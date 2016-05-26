describe('generation', function() {

  describe('HtmlText', function() {
    beforeEach(function() {
    });

    it('should convert flat HtmlText objects to HTML', function() {
      flatText = "Flat";
      flat = new HtmlText(flatText);
      expect(flat.html()).toBe(flatText);
    })

    it('should convert tagged HtmlText objects to HTML', function() {
      paragraphText = "Paragraph";
      paragraph = new HtmlText(paragraphText, "p");
      paragraphHtml = "<p>" + paragraphText + "</p>";
      expect(paragraph.html()).toBe(paragraphHtml);
    })

  });

  describe('HtmlElementArray', function() {

    beforeEach(function() {
      p = "Paragraph";
      p2 = "Paragraph too";
      pEle = new HtmlText(p, "p");
      p2Ele = new HtmlText(p2, "p");
      EleList = new HtmlElementArray()
      EleList.push(pEle);
      EleList.push(p2Ele);
      EleListResult = "<p>Paragraph</p><p>Paragraph too</p>";
      a = new HtmlText('a','p');
      aParagraph = "<p>a</p>";
    })

    it('should store html elements in an internal array', function() {
      expect(EleList.array[0]).toBe(pEle);
      expect(EleList.array[1]).toBe(p2Ele);
      expect(EleList.array.length).toBe(2);
    })

    it('should convert html element arrays to concatenated html', function() {
      expect(EleList.html()).toBe(EleListResult);
    })

    it('should convert arrays of arrays to concatenated html', function() {
      EleListArray = new HtmlElementArray();
      EleListArray.push(EleList);
      EleListArray.push(EleList);
      expect(EleListArray.html()).toBe(EleListResult + EleListResult);
    })

    it('should be able to add an empty array to an array of arrays', function() {
      array = new HtmlElementArray();
      arrayOfArrays = new HtmlElementArray();
      arrayOfArrays.push(array);
      expect(arrayOfArrays.html()).toBe("");
    });

    it('should be able to add arrays with and without contents to an array of arrays', function() {
      arrayA = new HtmlElementArray([a]);
      arrayB = new HtmlElementArray();
      arrayC = new HtmlElementArray();
      arrayD = new HtmlElementArray([a]);
      arrayE = new HtmlElementArray();
      arrayF = new HtmlElementArray([a]);
      arrayOfArrays = new HtmlElementArray();
      arrayOfArrays.push(arrayA);
      arrayOfArrays.push(arrayB);
      arrayOfArrays.push(arrayC);
      arrayOfArrays.push(arrayD);
      arrayOfArrays.push(arrayE);
      arrayOfArrays.push(arrayF);
      expect(arrayOfArrays.html()).toBe(aParagraph + aParagraph + aParagraph);
    })

    it('should be able to handle at least five levels of arrays within arrays', function() {
      arrayA = new HtmlElementArray();
      arrayA.push(a);
      arrayB = new HtmlElementArray();
      arrayB.push(arrayA);
      arrayC = new HtmlElementArray();
      arrayC.push(arrayB);
      arrayD = new HtmlElementArray();
      arrayD.push(arrayC);
      arrayE = new HtmlElementArray();
      arrayE.push(arrayD);
      expect(arrayE.html()).toBe(aParagraph);
    })

  })

  describe('HtmlTable', function() {
    beforeEach(function() {
      a = new HtmlText('a');
      b = new HtmlText('b');
      c = new HtmlText('c');
      d = new HtmlText('d');
      row1 = new HtmlElementArray();
      row2 = new HtmlElementArray();
      row1.push(a);
      row1.push(b);
      row2.push(c);
      row2.push(d);
      tableContent = new HtmlElementArray();
      tableContent.push(row1);
      tableContent.push(row2);
      table = new HtmlTable(tableContent);
      expectedResult = "<table><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></table>"
    })

    it('should convert a two-dimensional Html Element Array to a table', function() {
      expect(table.html()).toBe(expectedResult);
    })

  })
});