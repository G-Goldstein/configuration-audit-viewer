xdescribe('The config audit controller controller', function() {
  beforeEach(module('configAuditViewer'));

  var ctrl, dataService, $httpBackend;
  
  beforeEach(inject(function($controller, _$httpBackend_, ServerDataService) { 
    dataService = ServerDataService;
    
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

xdescribe('The config audit controller with an error', function() {
  beforeEach(module('configAuditViewer'));

  var ctrl, dataService, $httpBackend;
  
  beforeEach(inject(function($controller, _$httpBackend_, ServerDataService) { 
    dataService = ServerDataService;
    
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
  
  

});

describe('ComparisonService', function() {

  beforeEach(module('configAuditViewer'));

  var ComparisonService;
  var file1;
  var file2;
  var file3;
  var file4;
  var file5;
  var file6;
  var file7;
  var file8;
  var env1;
  var env2;

  beforeEach(inject(function(_ComparisonService_) {
      ComparisonService = _ComparisonService_;
  }));

  beforeEach(function() {
    file1 = {fileName: "AppLauncher.ini", relativePath: "/Central/"};
    file2 = {fileName: "CCM.ini", relativePath: "/Central/"};
    file3 = {fileName: "Erik.ini", relativePath: "/Central/"};
    file4 = {fileName: "Everyth6.ini", relativePath: "/Central/"};
    file5 = {fileName: "AppLauncher.ini", relativePath: "/Clients/"};
    file6 = {fileName: "CCM.ini", relativePath: "/Clients/"};
    file7 = {fileName: "Erik.ini", relativePath: "/Clients/"};
    file8 = {fileName: "Everyth6.ini", relativePath: "/Clients/"};
    env1 = {configFiles: [file1, file2, file3, file5]};
    env2 = {configFiles: [file3, file5, file6]};
  });

  describe('filesMatch', function() {
    it('should be true when the fileName and relativePath are the same', function() {
      var file4withextrastuff = {fileName: "Everyth6.ini", relativePath: "/Central/", extraStuff: "Yes"}
      expect(ComparisonService.filesMatch(file1, file2)).toBe(false);
      expect(ComparisonService.filesMatch(file3, file3)).toBe(true);
      expect(ComparisonService.filesMatch(file4, file4withextrastuff)).toBe(true);
    })
  })

  describe('listContainsFile', function () {
    it('should know whether a file is in a list', function() {
      var fileList = [file1, file3];
      var file3withextrastuff = {fileName: "Erik.ini", relativePath: "/Central/", extraStuff: "Yes"};
      expect(ComparisonService.listContainsFile(fileList, file1)).toBe(true);
      expect(ComparisonService.listContainsFile(fileList, file2)).toBe(false);
      expect(ComparisonService.listContainsFile(fileList, file3withextrastuff)).toBe(true);
    });
  });

  describe('addFileToEnvironment', function() {
    it('should add a file to an empty list', function() {
      var fileList = [];
      ComparisonService.addFileToEnvironment(file1, fileList, 0)
      expect(listContainsFile(fileList, file1)).toBe(true)
    });
  });

  describe('uniqueFiles', function() {
    it('should find a unique list of files in two environments', function() {
      var uniqueFiles = ComparisonService.uniqueFiles([env1, env2]);
      expect(uniqueFiles.length).toBe(5);
      expect(ComparisonService.listContainsFile(uniqueFiles, file1)).toBe(true);
      expect(ComparisonService.listContainsFile(uniqueFiles, file2)).toBe(true);
      expect(ComparisonService.listContainsFile(uniqueFiles, file3)).toBe(true);
      expect(ComparisonService.listContainsFile(uniqueFiles, file5)).toBe(true);
      expect(ComparisonService.listContainsFile(uniqueFiles, file6)).toBe(true);
    });

    describe('existsInEnvironment', function() {
      var found;
      var uniqueFiles;

      beforeEach(function() {
        found = false;
        uniqueFiles = ComparisonService.uniqueFiles([env1, env2]);
      });

      it('should correctly identify environment existence for file 1', function() {
        for (var f = 0; f < uniqueFiles.length; f++ ) {
          if (ComparisonService.filesMatch(uniqueFiles[f], file1)) {
            expect(uniqueFiles[f].existsInEnvironment[0]).toBe(true);
            expect(uniqueFiles[f].existsInEnvironment[1]).toBe(false);
            expect(found).toBe(false);
            found = true;
          };
        };
        expect(found).toBe(true);
      });

      it('should correctly identify environment existence for file 3', function() {
        for (var f = 0; f < uniqueFiles.length; f++ ) {
          if (ComparisonService.filesMatch(uniqueFiles[f], file3)) {
            expect(found).toBe(false);
            found = true;
          };
        };
        expect(found).toBe(true);
      });

      it('should correctly identify environment existence for file 6', function() {
        for (var f = 0; f < uniqueFiles.length; f++ ) {
          if (ComparisonService.filesMatch(uniqueFiles[f], file6)) {
            expect(found).toBe(false);
            found = true;
          };
        };
        expect(found).toBe(true);
      });

    });

  });


});