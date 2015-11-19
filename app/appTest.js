var customMatchers = {
  toMatchObject: function(util, customEqualityTesters) {
    return {
      compare: function(actual, expected) {
        var result = {};
        result.pass = Object.objects_equal(actual, expected);
        if (result.pass) {
          result.message = "object:\n\n" + JSON.stringify(actual, null, 2) + "\n\nmatched object:\n\n" + JSON.stringify(expected, null, 2);
        } else {
          result.message = "object:\n\n" + JSON.stringify(actual, null, 2) + "\n\ndid not match object:\n\n" + JSON.stringify(expected, null, 2);
        }
        return result;
      }
    }
  },
  toContainObject: function(util, customEqualityTesters) {
    return {
      compare: function(actual, expected) {
        var result = {};
        result.pass = Object.object_in_list(expected, actual);
        if (result.pass) {
          result.message = "object:\n\n" + JSON.stringify(expected, null, 2) + "\n\nwas in list:\n\n" + JSON.stringify(actual, null, 2);
        } else {
          result.message = "object:\n\n" + JSON.stringify(expected, null, 2) + "\n\nwas not in list:\n\n" + JSON.stringify(actual, null, 2);
        }
        return result;
      }
    }
  }
}

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
  var table1;
  var table2;

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
    table1 = {title: "THING", headers:["Shape","Colour"], rows:[["Square","Red"], ["Circle","Blue"]]};
    table2 = {title: "THING", headers:["Shape","Colour"], rows:[["Square","Red"], ["Triangle","Blue"]]};
    table3 = {title: "TRUCK", headers:["Wheels","Weight"], rows:[[18,10], [8,4]]};
    table4 = {title: "TRUCK", headers:["Wheels","Weight","Capacity"], rows:[[18,10,160], [8,4,60]]};
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

  describe('isTable', function() {
    it('should be true for tables', function() {
      expect(ComparisonService.isTable(table1)).toBe(true);
      expect(ComparisonService.isTable(table2)).toBe(true);
    })
    it('should be false for files', function() {
      expect(ComparisonService.isTable(file1)).toBe(false);
      expect(ComparisonService.isTable(file2)).toBe(false);
    })
    it('should be false for an undefined thing', function() {
      var notAThing;
      expect(ComparisonService.isTable(notAThing)).toBe(false);
    })
    it('should be false for an array', function() {
      var array = [];
      expect(ComparisonService.isTable(array)).toBe(false);
    })
  })

  describe('tablesMatch', function() {
    beforeEach(function() {
      ComparisonService.testFunction = ComparisonService.tablesMatch
    });
    it('should be true when the table titles and headers are the same', function() {
      expect(ComparisonService.testFunction(table1, table2)).toBe(true);
      expect(ComparisonService.testFunction(table4, table4)).toBe(true);
    });
    it('should be false when the titles don\'t match', function() {
      expect(ComparisonService.testFunction(table2, table3)).toBe(false);
    });
    it('should be false when the headers don\'t match', function() {
      expect(ComparisonService.testFunction(table1, table4)).toBe(false);
      expect(ComparisonService.testFunction(table3, table4)).toBe(false);
    });
  })

  describe('titlesMatch', function() {
    beforeEach(function() {
      ComparisonService.testFunction = ComparisonService.titlesMatch
    });
    it('should be true when the table titles are the same', function() {
      expect(ComparisonService.testFunction(table1, table2)).toBe(true);
      expect(ComparisonService.testFunction(table4, table4)).toBe(true);
    });
    it('should be false when the titles don\'t match', function() {
      expect(ComparisonService.testFunction(table2, table3)).toBe(false);
      
    });
  })

  describe('headersMatch', function() {
    beforeEach(function() {
      ComparisonService.testFunction = ComparisonService.headersMatch
    });
    it('should be true when the table headers are the same', function() {
      expect(ComparisonService.testFunction(table1, table2)).toBe(true);
      expect(ComparisonService.testFunction(table4, table4)).toBe(true);
    });
    it('should be false when the headers don\'t match', function() {
      expect(ComparisonService.testFunction(table1, table4)).toBe(false);
      expect(ComparisonService.testFunction(table3, table4)).toBe(false);
    });
  })

  describe('rowsMatch', function() {

    var row1;
    var row2;
    var row3;
    var row4;
    var row5;

    beforeEach(function() {
      row1 = ['red', 5]
      row2 = ['red', 5]
      row3 = ['blue', 5]
      row4 = ['red', 6]
      row5 = ['red', 5, 'square']

      ComparisonService.testFunction = ComparisonService.rowsMatch
    });
    it('should be true when every column in both rows match', function() {
      expect(ComparisonService.testFunction(row1, row1)).toBe(true);
      expect(ComparisonService.testFunction(row1, row2)).toBe(true);
    })
    it('should be false when not every column matches', function() {
      expect(ComparisonService.testFunction(row1, row3)).toBe(false);
      expect(ComparisonService.testFunction(row1, row4)).toBe(false);
    })
    it('should be false when the row lengths differ, even if other fields match', function() {
      expect(ComparisonService.testFunction(row1, row5)).toBe(false);
      expect(ComparisonService.testFunction(row2, row5)).toBe(false);
      expect(ComparisonService.testFunction(row3, row5)).toBe(false);
      expect(ComparisonService.testFunction(row4, row5)).toBe(false);
    })
  })

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

  describe('listContainsTable', function () {
    it('should know whether a table is in a list', function() {
      var tables = [table1];
      var table1withextrastuff = table1;
      table1withextrastuff['extraStuff'] = "Yes";
      expect(ComparisonService.listContainsTable(tables, table1)).toBe(true);
      expect(ComparisonService.listContainsTable(tables, table2)).toBe(true);
      expect(ComparisonService.listContainsTable(tables, table1withextrastuff)).toBe(true);
      expect(ComparisonService.listContainsTable(tables, table3)).toBe(false);
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

describe('addTableToEnvironment', function() {

    var comparisonTables = [];
    var tableA;
    var tableComparisonA;
    var tableA;
    var tableComparisonA;

    beforeEach(function() {
      jasmine.addMatchers(customMatchers);
      comparisonTables = [];
      tableA = {
                    title: 'block',
                    headers: ['size', 'colour', 'shape'],
                    rows: [
                      ['big', 'red', 'circle'],
                      ['huge', 'green', 'rectangle'],
                      ['little', 'blue', 'cross']
                    ]
                  };
      tableComparisonA = {
                    title: 'block',
                    headers: ['size', 'colour', 'shape'],
                    rows: [
                      {data: ['big', 'red', 'circle'], existsInEnvironment: [true, false]},
                      {data: ['huge', 'green', 'rectangle'], existsInEnvironment: [true, false]},
                      {data: ['little', 'blue', 'cross'], existsInEnvironment: [true, false]}
                    ],
                    existsInEnvironment: [true, false],
                    highlight: false,
                    show: false,
                    sizesMatch: true
                  };    
      tableB = {
                    title: 'vehicle',
                    headers: ['name', 'wheels', 'sound'],
                    rows: [
                      ['car', 4, 'honk'],
                      ['helicopter', 0, 'whirr'],
                      ['truck', '18', 'HOOONK']
                    ]
                  };
      tableComparisonB = {
                    title: 'vehicle',
                    headers: ['name', 'wheels', 'sound'],
                    rows: [
                      {data: ['car', 4, 'honk'], existsInEnvironment: []},
                      {data: ['helicopter', 0, 'whirr'], existsInEnvironment: []},
                      {data: ['truck', '18', 'HOOONK'], existsInEnvironment: []}
                    ],
                    existsInEnvironment: [],
                    highlight: false,
                    show: false,
                  };    
    });

    describe('rowsInEnvironment', function() {
      it('should return the rows formatted for their existence in environments', function() {
        var formattedRows = ComparisonService.rowsInEnvironment(tableA.rows, 0, 2);
        for (var i = 0; i < tableComparisonA.rows.length; i++) {
          for (var j = 0; j < tableComparisonA.rows[i].data.length; j++) {
            expect(formattedRows[i].data[j] === tableComparisonA.rows[i].data[j]).toBe(true);
            expect(formattedRows[i].existsInEnvironment[j] === tableComparisonA.rows[i].existsInEnvironment[j]).toBe(true);
          }
        }
      })
    });

    describe('interleaveRows', function() {
      beforeEach(function() {
        e1Rows = [
          {data: ['aaa', 0, 'red'], existsInEnvironment: [true, false]},
          {data: ['aaa', 2, 'blue'], existsInEnvironment: [true, false]},
          {data: ['aaa', 3, 'green'], existsInEnvironment: [true, false]},
          {data: ['aba', 0, 'yellow'], existsInEnvironment: [true, false]},
          {data: ['aba', 1, 'black'], existsInEnvironment: [true, false]}
        ];
        e2RowsA = [
          ['aaa', 0, 'red']
        ];
        e1RowsPlus2RowsA = [
          {data: ['aaa', 0, 'red'], existsInEnvironment: [true, true]},
          {data: ['aaa', 2, 'blue'], existsInEnvironment: [true, false]},
          {data: ['aaa', 3, 'green'], existsInEnvironment: [true, false]},
          {data: ['aba', 0, 'yellow'], existsInEnvironment: [true, false]},
          {data: ['aba', 1, 'black'], existsInEnvironment: [true, false]}
        ];
        e2RowsB = [
          ['aab', 1, 'white']
        ];
        e1RowsPlus2RowsB = [
          {data: ['aaa', 0, 'red'], existsInEnvironment: [true, false]},
          {data: ['aaa', 2, 'blue'], existsInEnvironment: [true, false]},
          {data: ['aaa', 3, 'green'], existsInEnvironment: [true, false]},
          {data: ['aab', 1, 'white'], existsInEnvironment: [false, true]},
          {data: ['aba', 0, 'yellow'], existsInEnvironment: [true, false]},
          {data: ['aba', 1, 'black'], existsInEnvironment: [true, false]}
        ]
      })
      it('should add environment information about each row found', function() {
        expect(ComparisonService.interleaveRows(e1Rows, e2RowsA, 1, 2)).toMatchObject(e1RowsPlus2RowsA);
      });
      it('should add new rows in the correct position and with the correct env existence', function() {
        expect(ComparisonService.interleaveRows(e1Rows, e2RowsB, 1, 2)).toMatchObject(e1RowsPlus2RowsB);
      })
    })

    it('should add a table to an empty environment', function() {
      ComparisonService.addTableToEnvironment(tableA, comparisonTables, 0, 2);
      expect(comparisonTables).toContainObject(tableComparisonA);
      expect(comparisonTables).not.toContainObject(tableComparisonB);
    });

    it('should not add a table to the table list twice', function() {
      ComparisonService.addTableToEnvironment(tableA, comparisonTables, 0, 2);
      ComparisonService.addTableToEnvironment(tableA, comparisonTables, 1, 2);
      expect(comparisonTables.length).toBe(1);
    });

    it('should identify that an environment contains a table', function() {
      ComparisonService.addTableToEnvironment(tableA, comparisonTables, 0, 2);
      expect(comparisonTables[0].existsInEnvironment[0]).toBe(true);
    });

    it('should identify which environments contain a table', function() {
      ComparisonService.addTableToEnvironment(tableA, comparisonTables, 0, 2);
      ComparisonService.addTableToEnvironment(tableA, comparisonTables, 1, 2);
      expect(comparisonTables[0].existsInEnvironment[0]).toBe(true);
      expect(comparisonTables[0].existsInEnvironment[1]).toBe(true);
    });

    it('should not assume an environment contains a table that wasn\'t added', function() {
      ComparisonService.addTableToEnvironment(tableA, comparisonTables, 0, 2);
      ComparisonService.addTableToEnvironment(tableB, comparisonTables, 1, 2);
      expect(comparisonTables[0].existsInEnvironment[1]).not.toBe(true);
      expect(comparisonTables[1].existsInEnvironment[0]).not.toBe(true);
    });

    it('should add a list of tables to an environment', function() {
      var tableList = [tableA, tableB];
      ComparisonService.addTablesToEnvironment(tableList, comparisonTables, 0, 1);
      expect(comparisonTables.length).toBe(2);
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

  var customMatchersForFile;
  var ComparisonService;
  var environments = [];
  var comparisonFileList = [];
  var file1;
  var file2;
  var file3;
  var file4;
  var table1;
  var table2;
  var table3;
  var table4;
  var result = [];
  var promise;

  var customMatchersForFile = {
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

  beforeEach(module('configAuditViewer'));
  beforeEach(function() {
    jasmine.addMatchers(customMatchersForFile);
  })

  beforeEach(inject(function(_ComparisonService_) {
      ComparisonService = _ComparisonService_;
      file1 = {file: "/abc.ini", profiles: [{profile: "[Default]", dictionary: {colour: "Red"}}, {profile: "[Extra]", dictionary: {}}]};
      file2 = {file: "/def.ini", profiles: []};
      file3 = {file: "/ghi.ini", profiles: []};
      file4 = {file: "/abc.ini", profiles: [{profile: "[Default]", dictionary: {colour: "Blue"}}]};
      environments = [{"config_files":[file1, file2]},
          {"config_files": [file2, file3]},
          {"config_files": [file4]}];
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
  });

  it('should fill gaps in existence of profiles', function() {
    expect(result[0].profiles[0].existsInEnvironment[0]).toBe(true);
    expect(result[0].profiles[0].existsInEnvironment[2]).toBe(true);
    expect(result[0].profiles[0].existsInEnvironment[1]).toBe(false);
  });

  it('should fill gaps in existence and value of dictionary elements', function() {
    expect(result[0].profiles[0].dictionary['colour'].existsInEnvironment[0]).toBe(true);
    expect(result[0].profiles[0].dictionary['colour'].valueInEnvironment[0]).toBe('Red');
    expect(result[0].profiles[0].dictionary['colour'].existsInEnvironment[2]).toBe(true);
    expect(result[0].profiles[0].dictionary['colour'].valueInEnvironment[2]).toBe('Blue');
    expect(result[0].profiles[0].dictionary['colour'].existsInEnvironment[1]).toBe(false);
    expect(result[0].profiles[0].dictionary['colour'].valueInEnvironment[1]).toBe('');
  });
});

xdescribe('ComparisonService\'s createComparisonTableList promise', function() {

  var ComparisonService;
  var environments = [];
  var comparisonTableList = [];
  var table1;
  var table2;
  var table3;
  var table4;
  var result = [];
  var promise;

  beforeEach(module('configAuditViewer'));
  beforeEach(function() {
    jasmine.addMatchers(customMatchers);
  })

  beforeEach(inject(function(_ComparisonService_) {
      ComparisonService = _ComparisonService_;
      table1 = {title: "THING", headers:["Shape","Colour"], rows:[["Square","Red"], ["Circle","Blue"]]};
      table2 = {title: "THING", headers:["Shape","Colour"], rows:[["Square","Red"], ["Triangle","Blue"]]};
      environments = [{database_tables:[table1]},
          {database_tables:[table2]}];
  }));

  beforeEach(function(done) {
    result = [];
    promise = ComparisonService.createComparisonTableList(environments).then(function(response) {
      result = response;
      done();
    }, function(error){
      result = response;
      done();
    });
  });

  it('should do something', function() {

  });

});