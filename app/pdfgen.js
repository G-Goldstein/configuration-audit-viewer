A4_WIDTH = 8.27
A4_HEIGHT = 11.69

BORDER_SIZE = 1

MAX_PAGE_Y = A4_HEIGHT - BORDER_SIZE
MIN_PAGE_Y = BORDER_SIZE
MIN_PAGE_X = BORDER_SIZE
MAX_PAGE_X = A4_WIDTH - BORDER_SIZE
TOTAL_PAGE_X = MAX_PAGE_X - MIN_PAGE_X
TOTAL_PAGE_Y = A4_HEIGHT - (2 * BORDER_SIZE)

FONT_FAMILY = 'Helvetica'
FONT_SPECIFIC = ''

function Running_Element(image_url, x, y, width, height) {
  this.image_url = image_url;
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.image = Q.Promise(function(resolve, reject, notify) {

    image = new Image();
    image.setAttribute('crossOrigin', 'anonymous');

    function onload() {
      resolve(image);
    }
    function onerror() {
      reject(new Error("Failed to load image " + image_url));
    }

    image.onload = onload;
    image.onerror = onerror;
    image.src = image_url;
  })
}

text_height = function(size) {
  return size / 72;
}

lines_height = function(lines, size) {
  return (lines.length + 1) * text_height(size);
}

advance_cursor = function(height) {
  return function(doc) {
    text_bottom = doc.text_y + height;
    doc.text_y = text_bottom;
    return doc;
  }
}

write_text = function(size, left, lines, height) {
  return add_to_promised_document(height, function(doc) {
    text_top = doc.text_y + text_height(size);
    doc.setFont(FONT_FAMILY, FONT_SPECIFIC)
       .setFontSize(size);
    doc.text(MIN_PAGE_X + left, text_top, lines);
    return doc;
  })
}

add_to_promised_document = function(height, populate_promised_document) {
  return function(doc) {
    if (height > TOTAL_PAGE_Y) {
      new Error("Document block too big for page") 
    };
    promised_doc = Q.fcall(function() {return doc});
    if (doc.text_y + height > TOTAL_PAGE_Y) {
      promised_doc = promised_doc.then(add_page);
    }
    return promised_doc.then(populate_promised_document);
  }
}

write_elements = function(height, elements, with_advance=true) {
  return add_to_promised_document(height, function(doc) {
    promised_doc = Q.fcall(function() {return doc});
    write_tasks = elements.map(function(element) {
      if (with_advance) {
        return [element.write, element.advance];
      } else {
        return element.write;
      }
    })
    write_tasks = flatten(write_tasks);
    return write_tasks.reduce(Q.when, promised_doc)
  })
}

function flatten(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}

function Text_Element(text, size, left=0, right=MAX_PAGE_X) {
  this.text = text;
  this.size = size;
  this.left = left;
  this.right = right;
  this.text_lines = function() {
    doc = new jsPDF('p', 'in', 'letter');
    lines = doc.setFont(FONT_FAMILY, FONT_SPECIFIC)
             .setFontSize(this.size)
             .splitTextToSize(this.text, this.right - this.left);
    return lines;
  }
  this.height = lines_height(this.text_lines(), this.size);
  this.write = write_text(this.size, this.left, this.text_lines(), this.height)
  this.advance = advance_cursor(this.height);
}

function Shared_Line_Element(elements) {
  this.elements = elements;
  this.height = Math.max(...this.elements
    .map(function(element) {
    return element.height;
  }));
  this.write = write_elements(this.height, elements, false);
  this.advance = advance_cursor(this.height);
}

function Block_Element(elements, break_after = 0) {
  this.elements = elements;
  this.height = this.elements.map(function(element) {
    return element.height
  }).reduce(function(a, b) {
    return a+b
  }, 0) + break_after;
  console.log(this.height);
  this.write = write_elements(this.height, elements);
  this.advance = [];
}

Pdf = function(running_elements) {

  this.add = function(element) {
    this.add_task(element.write);
    this.add_task(element.advance);
  }

  this.page_break = function() {
    this.add_task(add_page);
  }

  this.vertical_space = function(height) {
    this.add_task(advance_cursor(height));
  }

  this.save = function(filename) {
    flattasks = flatten(this.tasks);
    flattasks.reduce(Q.when, new_document_promise(this.running_elements))
    .then(save_document_promise(filename))
    .done();
  }

  this.add_task = function(task) {
    this.tasks.push(task)
  }

  this.running_elements = running_elements;
  this.tasks = [];
}

new_document_promise = function(running_elements) {
  promise = function() {
    doc = new jsPDF('p', 'in', 'letter');
    doc.running_elements = running_elements;
    set_up_new_page(doc);
    return doc;
  }
  return Q.fcall(promise);
}

save_document_promise = function(document_name) {
  return function(doc) {
    doc.save(document_name);
    return doc;
  }
}

add_page = function(doc) {
  doc.addPage();
  set_up_new_page(doc);
  return doc;
}

set_up_new_page = function(doc) {
  if (doc.running_elements.length === 0) {
    doc.text_y = MIN_PAGE_Y;
    return doc;
  }
  add_running_element_requests = doc.running_elements.map(function(running_element) {
    return function(doc) {
      return running_element.image.then(function(image) {
        doc.addImage({
          imageData: image,
          x: running_element.x,
          y: running_element.y,
          w: running_element.width,
          h: running_element.height
        })
        doc.text_y = MIN_PAGE_Y;
      }).done()
    }
  })
  return add_running_element_requests.reduce(Q.when, doc).done();
}

add_running_element_to_current_page = function(running_element) {
  self = this;
  running_element.image.then(function(promised_image) {
    self.doc.addImage({
      imageData: promised_image,
      angle: 0,
      x: running_element.x,
      y: running_element.y,
      w: running_element.width,
      h: running_element.height
    })
  })
}