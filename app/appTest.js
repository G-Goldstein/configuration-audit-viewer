describe('The config audit controller controller', function() {
  beforeEach(module('configAuditViewer'));

  var ctrl, dataService, $httpBackend;
  
  beforeEach(inject(function($controller, _$httpBackend_, DataService) { 
    dataService = DataService;
    
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('../data/SGSSUAT.json').
        respond(200, [{fileName: "Env_AppLauncher.ini", relativePath: "/", overrideLevels: [{levelDescription: "[Default]", keyValuePairs: [{key: "System", value:"TRACEY"}, {key:"Environment", value:"*ENV"}]}]}]);
    $httpBackend.expectGET('../data/SGSSPreProd.json').
        respond(200, [{fileName: "Env_AppLauncher.ini", relativePath: "/", overrideLevels: [{levelDescription: "[Default]", keyValuePairs: [{key: "System", value:"TRACEY"}, {key:"Environment", value:"*ENV"}]}]}]);
    ctrl = $controller('ConfigAuditController');
  }));

  it('should have config files available on load', function() {
    $httpBackend.flush();
    expect(ctrl.environmentConfigs[0].length).toBe(1);
  });
  
  it('should be able to find the default override level', function() {
    $httpBackend.flush();
    expect(ctrl.environmentConfigs[0][0].overrideLevels[0].levelDescription).toBe("[Default]");
  });
});

describe('The config audit controller with an error', function() {
  beforeEach(module('configAuditViewer'));

  var ctrl, dataService, $httpBackend;
  
  beforeEach(inject(function($controller, _$httpBackend_, DataService) { 
    dataService = DataService;
    
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('../data/SGSSUAT.json').
        respond(404, {data: "Configuration audit data not found"});
    $httpBackend.expectGET('../data/SGSSPreProd.json').
        respond(404, {data: "Configuration audit data not found"});
    
    ctrl = $controller('ConfigAuditController');
  }));

  it('should initialise variables correctly still', function() {
    $httpBackend.flush();
    
    // expect(ctrl.environmentConfigs[0].length).toBe(0);
    expect(ctrl.errorMessages[0].data).toBe("Configuration audit data not found"); 
  });
  
  // Test comment for branch.

});