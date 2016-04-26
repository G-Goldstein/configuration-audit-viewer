A4_WIDTH = 8.27
A4_HEIGHT = 11.69

BORDER_SIZE = 1

MAX_PAGE_Y = A4_HEIGHT - BORDER_SIZE
MIN_PAGE_Y = BORDER_SIZE
MIN_PAGE_X = BORDER_SIZE
MAX_PAGE_X = A4_WIDTH - BORDER_SIZE
TOTAL_PAGE_X = MAX_PAGE_X - MIN_PAGE_X

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

Pdf = function(running_elements) {
  this.addText = function(text, size, indent) {
    this.add_task(add_text_to_document_promise(text, size, indent))
  }

  // this._add_running_element_to_current_page = function(running_element) {
  //   self = this;
  //   running_element.image.then(function(promised_image) {
  //     self.doc.addImage({
  //       imageData: promised_image,
  //       angle: 0,
  //       x: running_element.x,
  //       y: running_element.y,
  //       w: running_element.width,
  //       h: running_element.height
  //     })
  //   })
  // }

  this.header = function(text) {
    this.addText(text, 14, 0);
  }

  this.normal = function(text) {
    this.addText(text, 8, 0);
  }

  this.file_header = function(text) {
    this.addText(text, 12, 0.2);
  }

  this.file_key = function(text) {
    this.addText(text, 8, 0.3);
  }

  this.save = function(filename) {
    // Q.fcall(new_document_promise())
    // .then(this.tasks[0])
    // .then(this.tasks[1])
    // .then((save_document_promise('Test.pdf')))
    // .done();
    this.tasks.reduce(Q.when, Q.fcall(new_document_promise()))
    .then(save_document_promise('Test.pdf'))
    .done();
  }

  this.add_task = function(task) {
    this.tasks.push(task)
  }

  this.running_elements = running_elements;
  this.tasks = [];
}

new_document_promise = function() {
  promise = function() {
    doc = new jsPDF('p', 'in', 'letter');
    set_up_new_page(doc);
    return doc;
  }
  return promise;
}

save_document_promise = function(document_name) {
  promise = function(doc) {
    doc.save(document_name);
    return doc;
  }
  return promise;
}

add_text_to_document_promise = function(text, size, indent) {
  promise = function(doc) {
    doc.text_y += size / 72;
    lines = doc.setFont(FONT_FAMILY, FONT_SPECIFIC)
                 .setFontSize(size)
                 .splitTextToSize(text, TOTAL_PAGE_X);
    text_bottom = doc.text_y + lines.length * size / 72;
    new_page_necessary = (text_bottom > MAX_PAGE_Y);
    if (new_page_necessary) {
      add_page(doc);
    };
    doc.text(MIN_PAGE_X + indent, doc.text_y, lines);
    doc.text_y = doc.text_y + lines.length * size / 72;
    return doc;
  }
  return promise;
}

add_page = function(doc) {
  doc.addPage();
  set_up_new_page(doc);
}

set_up_new_page = function(doc) {
  doc.text_y = MIN_PAGE_Y;
}