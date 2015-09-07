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
  });
  describe('overrideLevelsMatch', function() {
    it('should be true when the levelDescriptions are the same', function() {
      var overrideLevel1 = {levelDescription: 'Level desc 1'};
      var overrideLevel2 = {levelDescription: 'Level desc 1'};
      var overrideLevel3 = {levelDescription: 'Level desc 2'};
      expect(ComparisonService.overrideLevelsMatch(overrideLevel1, overrideLevel2)).toBe(true);
      expect(ComparisonService.overrideLevelsMatch(overrideLevel1, overrideLevel3)).toBe(false);
    })
  })
  describe('keysMatch', function() {
    it('should be true when the keys are the same', function() {
      var keyValue1 = {key: 'Colour', value: 'Red'};
      var keyValue2 = {key: 'Colour', value: 'Blue'};
      var keyValue3 = {key: 'Shape', value: 'Square'};
      expect(ComparisonService.keysMatch(keyValue1, keyValue2)).toBe(true);
      expect(ComparisonService.keysMatch(keyValue1, keyValue3)).toBe(false);
    })
  })

  describe('listContainsFile', function () {
    it('should know whether a file is in a list', function() {
      var configFiles = [file1, file3];
      var file3withextrastuff = {fileName: "Erik.ini", relativePath: "/Central/", extraStuff: "Yes"};
      expect(ComparisonService.listContainsFile(configFiles, file1)).toBe(true);
      expect(ComparisonService.listContainsFile(configFiles, file2)).toBe(false);
      expect(ComparisonService.listContainsFile(configFiles, file3withextrastuff)).toBe(true);
    });
  });

  describe('addKeyValuePairToEnvironment', function() {
    var overrideLevel;
    var keyValue1 = {key: 'Colour', value: 'Red'};
    var keyValue2 = {key: 'Shape', value: 'Square'};
    var keyValue3 = {key: 'Colour', value: 'Blue'};

    beforeEach(function() {
      overrideLevel = {keyValuePairs: []};
      keyValue1 = {key: 'Colour', value: 'Red'};
      keyValue2 = {key: 'Shape', value: 'Square'};
      keyValue3 = {key: 'Colour', value: 'Blue'};
    });

    it('should set the correct index of valueInEnvironment to the value', function() {
      ComparisonService.addKeyValuePairToEnvironment(keyValue1, overrideLevel, 0);
      expect(overrideLevel.keyValuePairs[0].key).toBe('Colour');
    });
    it('should not set value', function() {
      ComparisonService.addKeyValuePairToEnvironment(keyValue1, overrideLevel, 0);
      expect(overrideLevel.keyValuePairs[0].value).toBe(undefined);
    });
    it('should set existsInEnvironment', function() {
      ComparisonService.addKeyValuePairToEnvironment(keyValue1, overrideLevel, 0);
      expect(overrideLevel.keyValuePairs[0].existsInEnvironment[0]).toBe(true);
    });
    it('should set valueInEnvironment', function() {
      ComparisonService.addKeyValuePairToEnvironment(keyValue1, overrideLevel, 0);
      expect(overrideLevel.keyValuePairs[0].valueInEnvironment[0]).toBe('Red');
    });
    it('should be able to store two separate values for a key in different environments', function() {
      ComparisonService.addKeyValuePairToEnvironment(keyValue1, overrideLevel, 0);
      ComparisonService.addKeyValuePairToEnvironment(keyValue3, overrideLevel, 1);
      expect(overrideLevel.keyValuePairs.length).toBe(1);
      expect(overrideLevel.keyValuePairs[0].existsInEnvironment[0]).toBe(true);
      expect(overrideLevel.keyValuePairs[0].existsInEnvironment[1]).toBe(true);
      expect(overrideLevel.keyValuePairs[0].valueInEnvironment[0]).toBe('Red');
      expect(overrideLevel.keyValuePairs[0].valueInEnvironment[1]).toBe('Blue');
    });
  });

  describe('addOverrideLevelToEnvironment', function() {
    var file;
    var overrideLevel1;
    var overrideLevel2;
    var overrideLevel3;

    beforeEach(function() {
      file = {overrideLevels: []};
      overrideLevel1 = {levelDescription: '[Default]'};
      overrideLevel2 = {levelDescription: '[ABC]'};
      overrideLevel3 = {levelDescription: '[Default]'};
    });

    it('should set existsInEnvironment', function() {
      ComparisonService.addOverrideLevelToEnvironment(overrideLevel1, file, 2);
      expect(file.overrideLevels[0].existsInEnvironment[0]).not.toBe(true)
      expect(file.overrideLevels[0].existsInEnvironment[1]).not.toBe(true)
      expect(file.overrideLevels[0].existsInEnvironment[2]).toBe(true)
    })

  });

  describe('getIndexOfItemInList', function() {
    var list = [];
    var element1 = {colour: 'Red', shape: 'Square'};
    var element2 = {colour: 'Blue', shape: 'Circle'};
    var element3 = {colour: 'Red', shape: 'Circle'};

    function coloursMatch(item1, item2) {
      return (item1.colour === item2.colour);
    }

    beforeEach(function() {
      list = [];
      element1 = {colour: 'Red', shape: 'Square'};
      element2 = {colour: 'Blue', shape: 'Circle'};
      element3 = {colour: 'Red', shape: 'Circle'};
    });

    it('should find the only element at position 0', function() {
      list.push(element1);
      expect(ComparisonService.getIndexOfItemInList(element1, list, coloursMatch)).toBe(0);
    })
    it('should not find the item if the list is empty', function() {
      expect(ComparisonService.getIndexOfItemInList(element1, list, coloursMatch)).toBe(-1);
    })
    it('should not find an item that doesn\'t match', function() {
      list.push(element1);
      expect(ComparisonService.getIndexOfItemInList(element2, list, coloursMatch)).toBe(-1);
    })
    it('should find any item that matches', function() {
      list.push(element1);
      expect(ComparisonService.getIndexOfItemInList(element3, list, coloursMatch)).toBe(0);
    })
    it('should find the element in a later position', function() {
      list.push(element2);
      list.push(element1);
      expect(ComparisonService.getIndexOfItemInList(element1, list, coloursMatch)).toBe(1);
    })
  })

  describe('addFileToEnvironment', function() {

    var comparisonObject;

    beforeEach(function() {
      comparisonObject = {configFiles: []};
    });

    it('should add a file to an empty environment', function() {
      ComparisonService.addFileToEnvironment(file1, comparisonObject, 0);
      expect(ComparisonService.listContainsFile(comparisonObject.configFiles, file1)).toBe(true);
    });

    it('should not add a file to the comparisonObject twice', function() {
      ComparisonService.addFileToEnvironment(file1, comparisonObject, 0);
      ComparisonService.addFileToEnvironment(file1, comparisonObject, 1);
      expect(comparisonObject.configFiles.length).toBe(1);
    });

    it('should identify that an environment contains a file', function() {
      ComparisonService.addFileToEnvironment(file1, comparisonObject, 0);
      expect(comparisonObject.configFiles[0].existsInEnvironment[0]).toBe(true);
    });

    it('should identify which environments contain a file', function() {
      ComparisonService.addFileToEnvironment(file1, comparisonObject, 0);
      ComparisonService.addFileToEnvironment(file1, comparisonObject, 1);
      expect(comparisonObject.configFiles[0].existsInEnvironment[0]).toBe(true);
      expect(comparisonObject.configFiles[0].existsInEnvironment[1]).toBe(true);
    });

    it('should not assume an environment contains a file that wasn\'t added', function() {
      ComparisonService.addFileToEnvironment(file1, comparisonObject, 0);
      ComparisonService.addFileToEnvironment(file2, comparisonObject, 1);
      expect(comparisonObject.configFiles[0].existsInEnvironment[1]).not.toBe(true);
      expect(comparisonObject.configFiles[1].existsInEnvironment[0]).not.toBe(true);
    });

  });

  describe('findFileIndexInList', function() {
    var fileList = [];

    beforeEach(function() {
      fileList = [];
    });

    it('should find a file when it has been added', function() {
      fileList.push(file1);
      expect(ComparisonService.findFileIndexInList(file1, fileList)).toBe(0);
    })

    it('should find files at higher index positions', function() {
      fileList.push(file1);
      fileList.push(file3);
      expect(ComparisonService.findFileIndexInList(file1, fileList)).toBe(0);
      expect(ComparisonService.findFileIndexInList(file3, fileList)).toBe(1);
    })

    it('should return -1 if the file isn\'t found', function() {
      expect(ComparisonService.findFileIndexInList(file2, fileList)).toBe(-1);
      fileList.push(file5);
      expect(ComparisonService.findFileIndexInList(file6, fileList)).toBe(-1);
    })

  })

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