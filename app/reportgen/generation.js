function HtmlText(text, tag='') {
	this.text = text;
	this.tag = tag;
	this.html = function() {
		if (this.tag === '') {
			return this.text;
		}
		return '<' + this.tag + '>\n'
		     + this.text
		     + '</' + this.tag + '>\n';
	}
}

function HtmlWrap(htmlElement, tag, htmlClass='') {
	this.htmlElement = htmlElement;
	this.tag = tag;
	this.htmlClass = htmlClass;
	this.html = function() {
		if (this.htmlElement.html() !== "") {
			return '<' + this.tag + ' class="' + this.htmlClass + '">\n'
				+ this.htmlElement.html()
				+ '</' + this.tag + '>\n'
		}
		return "";
	}
}

function HtmlTable(twoDHtmlElementArray) {
	this.twoDHtmlElementArray = twoDHtmlElementArray;
	this.html = function() {
		tableContent = this.twoDHtmlElementArray.map(function(row) {
			rowContent = row.map(function(cell) {
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