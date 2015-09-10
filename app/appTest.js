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
    file1 = {fileName: "AppLauncher.ini", relativePath: "/Central/", overrideLevels: []};
    file2 = {fileName: "CCM.ini", relativePath: "/Central/", overrideLevels: []};
    file3 = {fileName: "Erik.ini", relativePath: "/Central/", overrideLevels: []};
    file4 = {fileName: "Everyth6.ini", relativePath: "/Central/", overrideLevels: []};
    file5 = {fileName: "AppLauncher.ini", relativePath: "/Clients/", overrideLevels: []};
    file6 = {fileName: "CCM.ini", relativePath: "/Clients/", overrideLevels: []};
    file7 = {fileName: "Erik.ini", relativePath: "/Clients/", overrideLevels: []};
    file8 = {fileName: "Everyth6.ini", relativePath: "/Clients/", overrideLevels: []};
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
  describe('isFile', function() {
    it('should be true for anything with a fileName and relativePath', function() {
      expect(ComparisonService.isFile(file1)).toBe(true);
      expect(ComparisonService.isFile(file2)).toBe(true);
      expect(ComparisonService.isFile(file6)).toBe(true);
      expect(ComparisonService.isFile(file7)).toBe(true);
    });
    it('should be false for an undefined thing', function() {
      var notAThing;
      expect(ComparisonService.isFile(notAThing)).toBe(false);
    })
    it('should be false for an array', function() {
      var array = [];
      expect(ComparisonService.isFile(array)).toBe(false);
    })
    it('should be false for an object with only one of the two required properties', function() {
      var thingWithFileName = {fileName: 'hello'};
      var thingWithRelativePath = {relativePath: 'here\'s a path!'};
      expect(ComparisonService.isFile(thingWithFileName)).toBe(false);
      expect(ComparisonService.isFile(thingWithRelativePath)).toBe(false);
    })
    it('should be true for an object with both properties and some other properties', function() {
      var fileExtra = {fileName: 'fileExtra', relativePath: 'here', colour: 'Red', shape: 'Circle'};
      expect(ComparisonService.isFile(fileExtra)).toBe(true);
    })
  })
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

  describe('addKeyValuePairsToEnvironment', function() {
    var overrideLevel;
    var keyValue1;
    var keyValue2;
    var keyValue3;
    var keyValues = [];

    beforeEach(function() {
      overrideLevel = {keyValuePairs: []};
      keyValue1 = {key: 'Colour', value: 'Red'};
      keyValue2 = {key: 'Shape', value: 'Square'};
      keyValue3 = {key: 'Size', value: 'Big'};
      keyValues = [keyValue1, keyValue2, keyValue3];
    });

    it('should add a bunch of keyValuePairs to an environment', function() {
      ComparisonService.addKeyValuePairsToEnvironment(keyValues, overrideLevel, 0);
      expect(overrideLevel.keyValuePairs.length).toBe(3);
    });
    it('should recognise repeated keys', function() {
      ComparisonService.addKeyValuePairsToEnvironment(keyValues, overrideLevel, 0);
      ComparisonService.addKeyValuePairsToEnvironment(keyValues, overrideLevel, 1);
      expect(overrideLevel.keyValuePairs.length).toBe(3);
    });

  })

  describe('addOverrideLevelToEnvironment', function() {
    var file;
    var overrideLevel1;
    var overrideLevel2;
    var overrideLevel3;

    beforeEach(function() {
      file = {overrideLevels: []};
      overrideLevel1 = {levelDescription: '[Default]', keyValuePairs: [{key: 'Colour', value: 'Red'}]};
      overrideLevel2 = {levelDescription: '[ABC]', keyValuePairs: [{key: 'Colour', value: 'Green'}, {key: 'Shape', value: 'Square'}]};
      overrideLevel3 = {levelDescription: '[Default]', keyValuePairs: [{key: 'Colour', value: 'Blue'}]};
    });

    it('should set existsInEnvironment', function() {
      ComparisonService.addOverrideLevelToEnvironment(overrideLevel1, file, 2);
      expect(file.overrideLevels[0].existsInEnvironment[0]).not.toBe(true)
      expect(file.overrideLevels[0].existsInEnvironment[1]).not.toBe(true)
      expect(file.overrideLevels[0].existsInEnvironment[2]).toBe(true)
      expect(file.overrideLevels[0].levelDescription).toBe('[Default]')
    });
    it('should treat matching descriptions as the same override level', function() {
      ComparisonService.addOverrideLevelToEnvironment(overrideLevel1, file, 0);
      ComparisonService.addOverrideLevelToEnvironment(overrideLevel3, file, 1);
      expect(file.overrideLevels.length).toBe(1);
      expect(file.overrideLevels[0].existsInEnvironment[0]).toBe(true);
      expect(file.overrideLevels[0].existsInEnvironment[1]).toBe(true);
    });
    it('should set the key values correctly', function() {
      ComparisonService.addOverrideLevelToEnvironment(overrideLevel1, file, 0);
      ComparisonService.addOverrideLevelToEnvironment(overrideLevel3, file, 1);
      expect(file.overrideLevels[0].keyValuePairs.length).toBe(1);
      expect(file.overrideLevels[0].keyValuePairs[0].key).toBe('Colour');
      expect(file.overrideLevels[0].keyValuePairs[0].value).toBe(undefined);
      expect(file.overrideLevels[0].keyValuePairs[0].existsInEnvironment[0]).toBe(true);
      expect(file.overrideLevels[0].keyValuePairs[0].valueInEnvironment[0]).toBe('Red');
      expect(file.overrideLevels[0].keyValuePairs[0].existsInEnvironment[1]).toBe(true);
      expect(file.overrideLevels[0].keyValuePairs[0].valueInEnvironment[1]).toBe('Blue');
    });
    it('should work with multiple override levels', function() {
      ComparisonService.addOverrideLevelToEnvironment(overrideLevel1, file, 0);
      ComparisonService.addOverrideLevelToEnvironment(overrideLevel2, file, 1);
      ComparisonService.addOverrideLevelToEnvironment(overrideLevel3, file, 1);
      expect(file.overrideLevels[0].keyValuePairs.length).toBe(1);
      expect(file.overrideLevels[0].keyValuePairs[0].key).toBe('Colour');
      expect(file.overrideLevels[1].keyValuePairs[1].key).toBe('Shape');
      expect(file.overrideLevels[1].keyValuePairs[0].key).toBe('Colour');
      expect(file.overrideLevels[1].keyValuePairs[1].existsInEnvironment[0]).not.toBe(true);
      expect(file.overrideLevels[1].keyValuePairs[1].existsInEnvironment[1]).toBe(true);
      expect(file.overrideLevels[1].keyValuePairs[1].valueInEnvironment[1]).toBe('Square');
    });
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

    var configFiles = [];
    var fileA = {
                  fileName: 'fileA',
                  relativePath: '/',
                  overrideLevels: [
                    {
                      levelDescription: '[Default]',
                      keyValuePairs: []
                    }
                  ]
                };
    var fileB = {
                  fileName: 'fileB',
                  relativePath: '/',
                  overrideLevels: [
                    {
                      levelDescription: '[Default]',
                      keyValuePairs: []
                    },
                    {
                      levelDescription: '[ABC]',
                      keyValuePairs: []
                    }
                  ]
                };                



    beforeEach(function() {
      configFiles = [];
    });

    it('should add a file to an empty environment', function() {
      ComparisonService.addFileToEnvironment(file1, configFiles, 0);
      expect(ComparisonService.listContainsFile(configFiles, file1)).toBe(true);
    });

    it('should not add a file to the configFiles twice', function() {
      ComparisonService.addFileToEnvironment(file1, configFiles, 0);
      ComparisonService.addFileToEnvironment(file1, configFiles, 1);
      expect(configFiles.length).toBe(1);
    });

    it('should identify that an environment contains a file', function() {
      ComparisonService.addFileToEnvironment(file1, configFiles, 0);
      expect(configFiles[0].existsInEnvironment[0]).toBe(true);
    });

    it('should identify which environments contain a file', function() {
      ComparisonService.addFileToEnvironment(file1, configFiles, 0);
      ComparisonService.addFileToEnvironment(file1, configFiles, 1);
      expect(configFiles[0].existsInEnvironment[0]).toBe(true);
      expect(configFiles[0].existsInEnvironment[1]).toBe(true);
    });

    it('should not assume an environment contains a file that wasn\'t added', function() {
      ComparisonService.addFileToEnvironment(file1, configFiles, 0);
      ComparisonService.addFileToEnvironment(file2, configFiles, 1);
      expect(configFiles[0].existsInEnvironment[1]).not.toBe(true);
      expect(configFiles[1].existsInEnvironment[0]).not.toBe(true);
    });

    it('should add the override levels within the file', function() {
      ComparisonService.addFileToEnvironment(fileA, configFiles, 0);
      ComparisonService.addFileToEnvironment(fileA, configFiles, 1);
      expect(configFiles[0].overrideLevels[0].existsInEnvironment[0]).toBe(true);
      expect(configFiles[0].overrideLevels[0].existsInEnvironment[1]).toBe(true);
    });

    it('should add a list of files to an environment', function() {
      var fileList = [fileA, fileB];
      ComparisonService.addFilesToEnvironment(fileList, configFiles, 0);
      expect(configFiles.length).toBe(2);
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

describe('ComparisonService\'s createComparisonFileList promise', function() {

  var customMatchers = {
    toMatchFile: function(util, customEqualityTesters) {
      return {
        compare: function(actual, expected) {
          var result = {};
          if (!ComparisonService.isFile(actual)) {
            result.pass = false;
            result.message = 'actual object ' + JSON.stringify(actual) + " is not a file";
            return result;
          } else if (!ComparisonService.isFile(expected)) {
            result.pass = false;
            result.message = 'expected object ' + JSON.stringify(expected) + " is not a file";
            return result;
          }
          result.pass = ComparisonService.filesMatch(actual, expected);
          if (result.pass) {
            result.message = "file " + JSON.stringify(actual) + " matched file " + JSON.stringify(expected);
          } else {
            result.message = "file " + JSON.stringify(actual) + " did not match file " + JSON.stringify(expected);
          }
          return result;
        }
      }
    }
  }

  var ComparisonService;
  var environments = [];
  var comparisonFileList = [];
  var file1;
  var result = [];
  var promise;

  beforeEach(module('configAuditViewer'));
  beforeEach(function() {
    jasmine.addMatchers(customMatchers);
  })

  beforeEach(inject(function(_ComparisonService_) {
      ComparisonService = _ComparisonService_;
      file1 = {fileName: "abc.ini", relativePath: "/", overrideLevels: []};
      environments = [[file1]];
  }));

  beforeEach(function(done) {
    result = [];
    promise = ComparisonService.createComparisonFileList(environments).then(function(response) {
      result = response;
      done();
    }, function(error){
      result = response;
      done();
    });
  });

  it('should asynchronously produce a comparison file list from a list of environments', function() {
    expect(result[0]).toMatchFile(file1);
  });

})