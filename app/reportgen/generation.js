function HtmlText(text, tag='') {
	this.text = text;
	this.tag = tag;
	this.html = function() {
		if (this.tag === '') {
			return this.text;
		}
		return '<' + this.tag + '>'
		     + this.text
		     + '</' + this.tag + '>';
	}
}

function HtmlTable(twoDHtmlElementArray) {
	this.twoDHtmlElementArray = twoDHtmlElementArray;
	this.html = function() {
		tableContent = this.twoDHtmlElementArray.map(function(row) {
			rowContent = row.map(function(cell) {
				result = new HtmlText(cell.html(), 'td');
				return result;
				return new HtmlText(cell.html(), 'td');
			});
			return new HtmlText(rowContent.html(), 'tr');
		});
		return new HtmlText(tableContent.html(), 'table').html();
	};
}

function HtmlElementListWithHeader(titleElement, listElements) {
	this.title = titleElement;
	this.content = listElements;
	this.html = function() {
		if (this.content.html() !== "") {
			return this.title.html() + this.content.html();
		}
		return "";
	}
}

function HtmlElementArray(array = []) {
	this.array = array;
	this.push = function(element) {
		 this.array.push(element)
	};
	this.html = function() {
		return this.array.reduce(function(htmlSoFar, nextElement) {
			return htmlSoFar + nextElement.html();
		}, "");
	};
	this.map = function(f) {
		return new HtmlElementArray(this.array.map(f));
	};
}