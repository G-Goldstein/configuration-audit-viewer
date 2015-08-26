var homePage = 'index.html';

var list = element(by.css('[data-ref=todoList]'));
var listItems = element.all(by.css('[data-ref=todoList] li span'));
var form = element(by.css('[data-ref=todoForm]'));
var input = element(by.css('[data-ref=todoForm] input[type=text]'));
var button = element(by.css('[data-ref=todoForm] input[type=submit]'));

describe('Todo list application', function() {
  beforeEach(function() {
     browser.addMockModule('httpBackendMock',
      function() {
          angular.module('httpBackendMock', ['todoApp', 'ngMockE2E'])
          .run(function($httpBackend) {
              $httpBackend.whenGET('../data/todos.json').respond(200, [{text: "buy food", done: true}, {text: "learn AngularJS", done: false}, {text: "learn TypeScript", done: false}]);    
          });
      }); 
     
     browser.get(homePage); });
  
  it('should display the correct elements', function() { 
    expect(list).toBeDefined();
    expect(form).toBeDefined();
  });
  
  it('should display the correct data in the list', function() {
    expect(listItems.count()).toBe(3);
    expect(listItems.get(0).getText()).toBe('0 - buy food');
  });
  
  it('should add to the list', function() {
    var text = 'sleep';
    
    input.sendKeys(text);
    button.click();
    
    expect(listItems.count()).toBe(4);
    expect(listItems.get(3).getText()).toBe('3 - ' + text);
  });
});