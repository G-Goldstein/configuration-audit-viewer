describe('ComparisonService', function() {

  beforeEach(module('configAuditViewer2'));

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
    file1 = {file: "/Central/AppLauncher.ini", profiles: []};
    file2 = {file: "/Central/CCM.ini", profiles: []};
    file3 = {file: "/Central/Erik.ini"};
    file4 = {file: "/Central/Everyth6.ini"};
    file5 = {file: "/Clients/AppLauncher.ini"};
    file6 = {file: "/Clients/CCM.ini"};
    file7 = {file: "/Clients/Erik.ini"};
    file8 = {file: "/Clients/Everyth6.ini"};
    env1 = {configFiles: [file1, file2, file3, file5]};
    env2 = {configFiles: [file3, file5, file6]};
  });

  describe('filesMatch', function() {
    it('should be true when the file properties are the same', function() {
      var file4withextrastuff = {file: file4['file'], extraStuff: 'Yes'}
      expect(ComparisonService.filesMatch(file1, file2)).toBe(false);
      expect(ComparisonService.filesMatch(file3, file3)).toBe(true);
      expect(ComparisonService.filesMatch(file4, file4withextrastuff)).toBe(true);
    })
  });
  describe('isFile', function() {
    it('should be true for anything with a file property', function() {
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
    it('should be false for an object with only other properties', function() {
      var thingWithFileName = {fileName: 'hello'};
      var thingWithRelativePath = {relativePath: 'here\'s a path!'};
      expect(ComparisonService.isFile(thingWithFileName)).toBe(false);
      expect(ComparisonService.isFile(thingWithRelativePath)).toBe(false);
    })
    it('should be true for an object with the file property and some other properties', function() {
      var fileExtra = {file: 'fileExtra', relativePath: 'here', colour: 'Red', shape: 'Circle'};
      expect(ComparisonService.isFile(fileExtra)).toBe(true);
    })
  })
  describe('profilesMatch', function() {
    it('should be true when the "profile" properties are the same', function() {
      var profile1 = {profile: 'Level desc 1'};
      var profile2 = {profile: 'Level desc 1'};
      var profile3 = {profile: 'Level desc 2'};
      expect(ComparisonService.profilesMatch(profile1, profile2)).toBe(true);
      expect(ComparisonService.profilesMatch(profile1, profile3)).toBe(false);
    })
  })
  describe('hasDictionary', function() {
    it('should be true when the object has a dictionary property', function() {
      var obj1 = {dictionary: {}, name: 'obj1'};
      var obj2 = {dictionary: {colour: 'Blue'}}
      expect(ComparisonService.hasDictionary(obj1)).toBe(true);
      expect(ComparisonService.hasDictionary(obj2)).toBe(true);
    });
    it('should be false when the object is undefined', function() {
      var obj3 = undefined;
      expect(ComparisonService.hasDictionary(obj3)).toBe(false);
    });
    it('should be false when the object doesn\'t have a dictionary property', function() {
      var obj4 = {dict: {}, name: 'obj4'};
      var obj5 = {};
      expect(ComparisonService.hasDictionary(obj4)).toBe(false);
      expect(ComparisonService.hasDictionary(obj5)).toBe(false);
    });
  });

  // Object.getOwnPropertyNames(obj) will get the keys out. Can then do obj[property] to get the value.
  describe('keysMatch', function() {
    it('should be true when the keys are the same', function() {
      var key1 = 'Colour';
      var key2 = 'Colour';
      var key3 = 'Shape';
      expect(ComparisonService.keysMatch(key1, key2)).toBe(true);
      expect(ComparisonService.keysMatch(key1, key3)).toBe(false);
    })
  })

  describe('listContainsFile', function () {
    it('should know whether a file is in a list', function() {
      var configFiles = [file1, file3];
      var file3withextrastuff = file3;
      file3withextrastuff['extraStuff'] = "Yes";
      expect(ComparisonService.listContainsFile(configFiles, file1)).toBe(true);
      expect(ComparisonService.listContainsFile(configFiles, file2)).toBe(false);
      expect(ComparisonService.listContainsFile(configFiles, file3withextrastuff)).toBe(true);
    });
  });

  describe('addKeyValuePairToEnvironment', function() {
    var profile = {};
    var key1 = 'Colour';
    var value1 = 'Red';
    var key2 = 'Shape';
    var value2 = 'Square';
    var key3 = 'Colour';
    var value3 = 'Blue';
    
    beforeEach(function() {
      profile = {dictionary: {}};
      key1 = 'Colour';
      value1 = 'Red';
      key2 = 'Shape';
      value2 = 'Square';
      key3 = 'Colour';
      value3 = 'Blue';
    });

    it('should set the correct index of valueInEnvironment to the value', function() {
      ComparisonService.addKeyValuePairToEnvironment(key1, value1, profile, 0, 1);
      expect(profile.dictionary[key1].valueInEnvironment[0]).toBe(value1);
    });
    it('should not set value', function() {
      ComparisonService.addKeyValuePairToEnvironment(key1, value1, profile, 0, 1);
      expect(profile.dictionary[key1].value).toBe(undefined);
    });
    it('should set existsInEnvironment', function() {
      ComparisonService.addKeyValuePairToEnvironment(key1, value1, profile, 0, 1);
      expect(profile.dictionary[key1].existsInEnvironment[0]).toBe(true);
    });
    it('should be able to store two separate values for a key in different environments', function() {
      ComparisonService.addKeyValuePairToEnvironment(key1, value1, profile, 0, 2);
      ComparisonService.addKeyValuePairToEnvironment(key1, value3, profile, 1, 2);
      var dictsize = Object.keys(profile.dictionary).length;
      expect(dictsize).toBe(1);
      expect(profile.dictionary[key1].existsInEnvironment[0]).toBe(true);
      expect(profile.dictionary[key1].existsInEnvironment[1]).toBe(true);
      expect(profile.dictionary[key1].valueInEnvironment[0]).toBe(value1);
      expect(profile.dictionary[key1].valueInEnvironment[1]).toBe(value3);
    });
    it('should set existsInEnvironment to false for environments that haven\'t provided a value', function() {
      ComparisonService.addKeyValuePairToEnvironment(key1, value1, profile, 0, 2);
      expect(profile.dictionary[key1].existsInEnvironment[1]).toBe(false);
    });
  });

  describe('addDictionaryToEnvironment', function() {
    var profile;
    var dictionary = {};

    beforeEach(function() {
      profile = {dictionary: []};
      dictionary = {colour: 'Red', shape: 'Square', size: 'Big'}
    });

    it('should add a bunch of keyValuePairs to an environment', function() {
      ComparisonService.addDictionaryToEnvironment(dictionary, profile, 0);
      var dictsize = Object.keys(profile.dictionary).length;
      expect(dictsize).toBe(3);
    });
    it('should recognise repeated keys', function() {
      ComparisonService.addDictionaryToEnvironment(dictionary, profile, 0);
      ComparisonService.addDictionaryToEnvironment(dictionary, profile, 1);
      var dictsize = Object.keys(profile.dictionary).length;
      expect(dictsize).toBe(3);
    });

  })

  describe('addProfileToEnvironment', function() {
    var file;
    var profile1;
    var profile2;
    var profile3;

    beforeEach(function() {
      file = {profiles: []};
      profile1 = {profile: '[Default]', dictionary: {colour: 'Red'}};
      profile2 = {profile: '[ABC]', dictionary: {colour: 'Green', shape: 'Square'}};
      profile3 = {profile: '[Default]', dictionary: {colour: 'Blue'}};
    });

    it('should set existsInEnvironment', function() {
      ComparisonService.addProfileToEnvironment(profile1, file, 2, 3);
      expect(file.profiles[0].existsInEnvironment[0]).toBe(false)
      expect(file.profiles[0].existsInEnvironment[1]).toBe(false)
      expect(file.profiles[0].existsInEnvironment[2]).toBe(true)
      expect(file.profiles[0].profile).toBe('[Default]')
    });
    it('should treat matching descriptions as the same profile', function() {
      ComparisonService.addProfileToEnvironment(profile1, file, 0, 2);
      ComparisonService.addProfileToEnvironment(profile3, file, 1, 2);
      expect(file.profiles.length).toBe(1);
      expect(file.profiles[0].existsInEnvironment[0]).toBe(true);
      expect(file.profiles[0].existsInEnvironment[1]).toBe(true);
    });
    it('should set the key values correctly', function() {
      ComparisonService.addProfileToEnvironment(profile1, file, 0, 2);
      ComparisonService.addProfileToEnvironment(profile3, file, 1, 2);
      var dictsize = Object.keys(file.profiles[0].dictionary).length;
      expect(dictsize).toBe(1);
      expect(file.profiles[0].dictionary['colour'].value).toBe(undefined);
      expect(file.profiles[0].dictionary['colour'].existsInEnvironment[0]).toBe(true);
      expect(file.profiles[0].dictionary['colour'].valueInEnvironment[0]).toBe('Red');
      expect(file.profiles[0].dictionary['colour'].existsInEnvironment[1]).toBe(true);
      expect(file.profiles[0].dictionary['colour'].valueInEnvironment[1]).toBe('Blue');
    });
    it('should work with multiple profiles', function() {
      ComparisonService.addProfileToEnvironment(profile1, file, 0, 2);
      ComparisonService.addProfileToEnvironment(profile2, file, 1, 2);
      ComparisonService.addProfileToEnvironment(profile3, file, 1, 2);
      var dictsize = Object.keys(file.profiles[0].dictionary).length;
      expect(dictsize).toBe(1);
      expect(file.profiles[1].dictionary['shape'].existsInEnvironment[0]).toBe(false);
      expect(file.profiles[1].dictionary['shape'].existsInEnvironment[1]).toBe(true);
      expect(file.profiles[1].dictionary['shape'].valueInEnvironment[1]).toBe('Square');
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
                  file: '/fileA.ini',
                  profiles: [
                    {
                      profile: '[Default]',
                      dictionary: {}
                    }
                  ]
                };
    var fileB = {
                  file: '/fileB.ini',
                  profiles: [
                    {
                      profile: '[Default]',
                      dictionary: {}
                    },
                    {
                      profile: '[ABC]',
                      dictionary: {}
                    }
                  ]
                };                



    beforeEach(function() {
      configFiles = [];
    });

    it('should add a file to an empty environment', function() {
      ComparisonService.addFileToEnvironment(file1, configFiles, 0, 2);
      expect(ComparisonService.listContainsFile(configFiles, file1)).toBe(true);
    });

    it('should not add a file to the configFiles twice', function() {
      ComparisonService.addFileToEnvironment(file1, configFiles, 0, 2);
      ComparisonService.addFileToEnvironment(file1, configFiles, 1, 2);
      expect(configFiles.length).toBe(1);
    });

    it('should identify that an environment contains a file', function() {
      ComparisonService.addFileToEnvironment(file1, configFiles, 0, 2);
      expect(configFiles[0].existsInEnvironment[0]).toBe(true);
    });

    it('should identify which environments contain a file', function() {
      ComparisonService.addFileToEnvironment(file1, configFiles, 0, 2);
      ComparisonService.addFileToEnvironment(file1, configFiles, 1, 2);
      expect(configFiles[0].existsInEnvironment[0]).toBe(true);
      expect(configFiles[0].existsInEnvironment[1]).toBe(true);
    });

    it('should not assume an environment contains a file that wasn\'t added', function() {
      ComparisonService.addFileToEnvironment(file1, configFiles, 0, 2);
      ComparisonService.addFileToEnvironment(file2, configFiles, 1, 2);
      expect(configFiles[0].existsInEnvironment[1]).not.toBe(true);
      expect(configFiles[1].existsInEnvironment[0]).not.toBe(true);
    });

    it('should add the profiles within the file', function() {
      ComparisonService.addFileToEnvironment(fileA, configFiles, 0, 2);
      ComparisonService.addFileToEnvironment(fileA, configFiles, 1, 2);
      expect(configFiles[0].profiles[0].existsInEnvironment[0]).toBe(true);
      expect(configFiles[0].profiles[0].existsInEnvironment[1]).toBe(true);
    });

    it('should add a list of files to an environment', function() {
      var fileList = [fileA, fileB];
      ComparisonService.addFilesToEnvironment(fileList, configFiles, 0, 1);
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
  var file2;
  var file3;
  var file4;
  var result = [];
  var promise;

  beforeEach(module('configAuditViewer2'));
  beforeEach(function() {
    jasmine.addMatchers(customMatchers);
  })

  beforeEach(inject(function(_ComparisonService_) {
      ComparisonService = _ComparisonService_;
      file1 = {file: "/abc.ini", profiles: [{profile: "[Default]", dictionary: {colour: "Red"}}, {profile: "[Extra]", dictionary: {}}]};
      file2 = {file: "/def.ini", profiles: []};
      file3 = {file: "/ghi.ini", profiles: []};
      file4 = {file: "/abc.ini", profiles: [{profile: "[Default]", dictionary: {colour: "Blue"}}]};
      environments = [[file1, file2], [file2, file3], [file4]];
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

  it('should fill gaps in existence for files', function() {
    expect(result[0].existsInEnvironment[0]).toBe(true);
    expect(result[0].existsInEnvironment[1]).toBe(false);
    expect(result[0].existsInEnvironment[2]).toBe(true);
  })

  it('should fill gaps in existence of profiles', function() {
    expect(result[0].profiles[0].existsInEnvironment[0]).toBe(true);
    expect(result[0].profiles[0].existsInEnvironment[2]).toBe(true);
    expect(result[0].profiles[0].existsInEnvironment[1]).toBe(false);
  })

  it('should fill gaps in existence and value of dictionary elements', function() {
    expect(result[0].profiles[0].dictionary['colour'].existsInEnvironment[0]).toBe(true);
    expect(result[0].profiles[0].dictionary['colour'].valueInEnvironment[0]).toBe('Red');
    expect(result[0].profiles[0].dictionary['colour'].existsInEnvironment[2]).toBe(true);
    expect(result[0].profiles[0].dictionary['colour'].valueInEnvironment[2]).toBe('Blue');
    expect(result[0].profiles[0].dictionary['colour'].existsInEnvironment[1]).toBe(false);
    expect(result[0].profiles[0].dictionary['colour'].valueInEnvironment[1]).toBe('');
  })

})