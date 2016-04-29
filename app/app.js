
var myApp = angular.module('configAuditViewer', ['monospaced.elastic']);

myApp.service('ServerDataService', ['$http', function($http) {
  this.getData = function(jsonFile) {
     return $http.get(jsonFile);
  }
}]);

myApp.service('ClientDataService', ['$q', function($q) {

  this.getData = function(fileList) {
    return new Promise(function(resolve, reject) {
      var environments = []
      var readers = []
        for (var f = 0; f < fileList.length; f++) {
          var file = fileList[f];
          readers.push(new FileReader());
          readers[f].onload = function(e) {
            try {
              environments.push(JSON.parse(this.result));
            } catch (e) {
              reject('Invalid json file')
            }
            if (environments.length == fileList.length) {
              resolve(environments);
            }
          }
          readers[f].readAsText(file, 'UTF-8');
        }
      }
    )
  }

}]);

myApp.service('ComparisonService', ['$q', function($q) {

  var comparisonService = this;

  this.createComparisonFileList = function(environments) {
    return new Promise(function(resolve, reject) {
      var fileList = [];
      for (var e = 0; e < environments.length; e++ ) {
        comparisonService.addFilesToEnvironment(environments[e].config_files, fileList, e, environments.length);
      }
      comparisonService.color_in_file_list(fileList);
      for (fileIndex in fileList) {
        file = fileList[fileIndex];
        file.keys = comparisonService.keysInDictionary(file.dictionary);
        for (profileIndex in file.profiles) {
          profile = file.profiles[profileIndex];
          profile.keys = comparisonService.keysInDictionary(profile.dictionary);
        }
      }
      resolve(fileList);
    })
  }

  this.createComparisonTableList = function(environments) {
    return new Promise(function(resolve, reject) {
      var tableList = [];
      for (var e = 0; e < environments.length; e++ ) {
        comparisonService.addTablesToEnvironment(environments[e].database_tables, tableList, e, environments.length);
      }
      comparisonService.color_in_table_list(tableList);
      resolve(tableList);
    })
  }

  this.createComparisonOverview = function(environments) {
    return new Promise(function(resolve, reject) {
      var combinedOverview = [];
      for (var e = 0; e < environments.length; e++ ) {
        comparisonService.addOverviewToEnvironment(environments[e].overview, combinedOverview, e, environments.length);
      }
      resolve(combinedOverview);
    })
  }

  this.filesMatch = function(fileA, fileB) {
    return (fileA.file === fileB.file)
  };

  this.titlesMatch = function(tableA, tableB) {
    return tableA.title === tableB.title
  }

  this.headersMatch = function(tableA, tableB) {
    range = function(n) {
      var result = []
      for (var i = 0; i < n; i++) {
        result.push(i)
      }
      return result
    }
    headerCount = function(table) { return table.headers.length };
    nthElementMatches = function(arrA, arrB, n) {
      return arrA[n] === arrB[n];
    }
    return (headerCount(tableA) === headerCount(tableB) &&
      range(headerCount(tableA)).every(elem => nthElementMatches(tableA.headers, tableB.headers, elem)))
  }

  this.tablesMatch = function(tableA, tableB) {
    return (this.titlesMatch(tableA, tableB) && this.headersMatch(tableA, tableB))
  };
  this.propertyHasKey = function(property, key) {
    return property.key === key;
  };

  this.rowsMatch = function(rowA, rowB) {
    if (rowA.length !== rowB.length) {
      return false;
    } else {
      for (var i = 0; i < rowA.length; i++) {
        if (rowA[i] !== rowB[i]) {
          return false;
        }
      }
      return true;
    }
  }

  this.isFile = function(object) {
    if (object === undefined) {
      return false;
    } else {
      return (object.hasOwnProperty('file'));
    }
  }
  this.isTable = function(object) {
    if (object === undefined) {
      return false;
    } else {
      return (object.hasOwnProperty('rows') && object.hasOwnProperty('headers'));
    }
  }
  this.profilesMatch = function(profileA, profileB) {
    return (profileA.profile === profileB.profile);
  }
  this.keysMatch = function(keyA, keyB) {
    return (keyA === keyB);
  }

  this.hasDictionary = function(profile) {
    return ((typeof profile !== 'undefined') && ('dictionary' in profile))
  }

  this.listContainsFile = function(fileList, file) {
    for (var f = 0; f < fileList.length; f++ ) {
      if (this.filesMatch(fileList[f], file)) {
        return true;
      } 
    }
    return false;
  }

  this.listContainsTable = function(tableList, table) {
    for (var t = 0; t < tableList.length; t++ ) {
      if (this.titlesMatch(tableList[t], table)) {
        return true;
      } 
    }
    return false;
  }

  this.listContainsProperty = function(propertyList, property) {
    for (var p = 0; p < propertyList.length; p++) {
      if (this.propertyHasKey(propertyList[p], property)) {
        return true;
      }
    }
    return false;
  }

  this.findFileIndexInList = function(file, fileList) {
    return this.getIndexOfItemInList(file, fileList, this.filesMatch);
  }
  this.findTableIndexInList = function(table, tableList) {
    return this.getIndexOfItemInList(table, tableList, this.titlesMatch);
  }
  this.findPropertyIndexInList = function(property, propertyList) {
    for (var p = 0; p < propertyList.length; p++) {
      if (this.propertyHasKey(propertyList[p], property)) {
        return p;
      }
    }
    return -1;
  }

  this.addFileToEnvironment = function(file, comparisonFiles, environment, environmentCount) {
    if (!this.listContainsFile(comparisonFiles, file)) {
      var fileInsert = {
        file: file.file,
        existsInEnvironment: [],
        profiles: [],
        highlight: false,
        show: false,
        dictionary: {}
      };
      for (var e = 0; e < environmentCount; e++ ) {
        fileInsert.existsInEnvironment[e] = false;
      }
      fileInsert.existsInEnvironment[environment] = true;
      this.addProfilesToEnvironment(file.profiles, fileInsert, environment, environmentCount);
      this.addDictionaryToEnvironment(file.dictionary, fileInsert, environment, environmentCount);
      comparisonFiles.push(fileInsert);
    } else {
      var indexOfFile = this.findFileIndexInList(file, comparisonFiles);
      comparisonFiles[indexOfFile].existsInEnvironment[environment] = true;
      this.addProfilesToEnvironment(file.profiles, comparisonFiles[indexOfFile], environment, environmentCount);
      this.addDictionaryToEnvironment(file.dictionary, comparisonFiles[indexOfFile], environment, environmentCount);
    }
  }

  this.rowsInEnvironment = function(rows, environment, environmentCount) {
    getEnvironmentArray = function() {
      var resultArray = [];
      for (var i = 0; i < environmentCount; i++) {
        if (i === environment) {
          resultArray.push(true);
        } else {
          resultArray.push(false);
        }
      }
      return resultArray
    }
    var environmentArray = getEnvironmentArray();
    var result = [];
    for (row in rows) {
      result.push({data: rows[row], existsInEnvironment: environmentArray});
    }
    return result;
  }

  this.interleaveRows = function(comparisonRows, newRows, newEnvironment, environmentCount) {
    var cIndex = 0;
    var nIndex = 0;
    var rIndex = 0;
    var resultRows = [];
    getNewEnvironmentArray = function() {
      var resultArray = [];
      for (var i = 0; i < environmentCount; i++) {
        if (i === newEnvironment) {
          resultArray.push(true);
        } else {
          resultArray.push(false);
        }
      }
      return resultArray
    }
    addNewRow = function(row) {
      resultRows.push({
        data: row, existsInEnvironment: getNewEnvironmentArray()
      });
      rIndex++;
      nIndex++;
    }
    addComparisonRow = function(row) {
      resultRows.push(row);
      rIndex++;
      cIndex++;
    }
    addBothRows = function(row) {
      resultRows.push(row);
      resultRows[rIndex].existsInEnvironment[newEnvironment] = true;
      rIndex++;
      cIndex++;
      nIndex++;
    }
    while (cIndex < comparisonRows.length || nIndex < newRows.length) {
      if (cIndex >= comparisonRows.length) {
        addNewRow(newRows[nIndex]);
      } else if (nIndex >= newRows.length) {
        addComparisonRow(comparisonRows[cIndex]);
      } else if (comparisonRows[cIndex].data > newRows[nIndex]) {
        addNewRow(newRows[nIndex]);
      } else if (comparisonRows[cIndex].data < newRows[nIndex]) {
        addComparisonRow(comparisonRows[cIndex]);
      } else {
        addBothRows(comparisonRows[cIndex])
      }
    }
    return resultRows;
  }

  this.addTableToEnvironment = function(table, comparisonTables, environment, environmentCount) {
    if (!this.listContainsTable(comparisonTables, table)) {
      var tableInsert = {
        title: table.title,
        existsInEnvironment: [],
        highlight: false,
        show: false,
        headers: table.headers,
        rows: this.rowsInEnvironment(table.rows, environment, environmentCount),
        sizesMatch: true
      };
      for (var e = 0; e < environmentCount; e++ ) {
        tableInsert.existsInEnvironment[e] = false;
      }
      tableInsert.existsInEnvironment[environment] = true;
      comparisonTables.push(tableInsert);
    } else {
      var indexOfTable = this.findTableIndexInList(table, comparisonTables);
      comparisonTables[indexOfTable].existsInEnvironment[environment] = true;
      if (comparisonTables[indexOfTable].headers.length === table.headers.length) {
        comparisonTables[indexOfTable].rows = this.interleaveRows(comparisonTables[indexOfTable].rows, table.rows, environment, environmentCount);
      } else {
        comparisonTables[indexOfTable].sizesMatch = false;
        comparisonTables[indexOfTable].headers = [];
        comparisonTables[indexOfTable].rows = [];
      }
    }
  }

  this.addFilesToEnvironment = function(fileList, comparisonFiles, environment, environmentCount) {
    for (var f = 0; f < fileList.length; f++ ) {
      this.addFileToEnvironment(fileList[f], comparisonFiles, environment, environmentCount);
    }
  }

  this.addTablesToEnvironment = function(tableList, comparisonTables, environment, environmentCount) {
    for (t in tableList) {
      this.addTableToEnvironment(tableList[t], comparisonTables, environment, environmentCount);
    }
  }

  this.addOverviewToEnvironment = function(overview, combinedOverview, environment, environmentCount) {
    for (property in overview) {
      if (!this.listContainsProperty(combinedOverview, property)) {
        var propertyToAdd = {valueInEnvironment: []}
        propertyToAdd.key = property;
        combinedOverview[property] = {valueInEnvironment:[]};
        for (var i = 0; i < environmentCount; i++) {
          propertyToAdd.valueInEnvironment[i] = '';
        }
        combinedOverview.push(propertyToAdd);
      }
      var indexOfProperty = this.findPropertyIndexInList(property, combinedOverview);
      combinedOverview[indexOfProperty].valueInEnvironment[environment] = overview[property];
    }
  }

  this.addProfileToEnvironment = function(profile, file, environment, environmentCount) {
    var index = this.getIndexOfItemInList(profile, file.profiles, this.profilesMatch);
    if (index === -1) {
      var profileInsert = {profile: profile.profile,
                                 existsInEnvironment: [],
                                 dictionary: {},
                                 show: false,
                                 highlight: false
                               }
      for (var e = 0; e < environmentCount; e++ ) {
        profileInsert.existsInEnvironment[e] = false;
      }
      profileInsert.existsInEnvironment[environment] = true;
      this.addDictionaryToEnvironment(profile.dictionary, profileInsert, environment, environmentCount);
      file.profiles.push(profileInsert);
    } else {
      file.profiles[index].existsInEnvironment[environment] = true;
      this.addDictionaryToEnvironment(profile.dictionary, file.profiles[index], environment, environmentCount);
    }
  }

  this.addProfilesToEnvironment = function(profiles, file, environment, environmentCount) {
    if (typeof profiles === 'undefined') {
      return;
    }
    for (var o = 0; o < profiles.length; o++ ) {
      this.addProfileToEnvironment(profiles[o], file, environment, environmentCount);
    }
  }

  this.addKeyValuePairToEnvironment = function(key, value, profile, environment, environmentCount) {
    if (!(key in profile.dictionary)) {
      var keyValuePairInsert = {}
      keyValuePairInsert.existsInEnvironment = []
      keyValuePairInsert.valueInEnvironment = []
      keyValuePairInsert.comment = '';
      for (var e = 0; e < environmentCount; e++ ) {
        keyValuePairInsert.existsInEnvironment[e] = false;
        keyValuePairInsert.valueInEnvironment[e] = '';
      }
      keyValuePairInsert.existsInEnvironment[environment] = true;
      keyValuePairInsert.valueInEnvironment[environment] = value;
      profile.dictionary[key] = keyValuePairInsert;
    } else {
      profile.dictionary[key].existsInEnvironment[environment] = true;
      profile.dictionary[key].valueInEnvironment[environment] = value;
    }
  }

  this.addDictionaryToEnvironment = function(dictionary, profile, environment, environmentCount) {
    if (typeof dictionary === 'undefined') {
      return;
    }
    for (var key in dictionary) {
      if (dictionary.hasOwnProperty(key)) {
        this.addKeyValuePairToEnvironment(key, dictionary[key], profile, environment, environmentCount);
      }
    }
  }

  this.getIndexOfItemInList = function(item, list, matchFunction) {
    for (var i = 0; i < list.length; i++ ) {
      if (matchFunction(item, list[i])) {
        return i;
      }
    }
    return -1;
  }

  this.color_in_file_list = function(file_list) {
    for (var f in file_list) {
      file = file_list[f];
      file.color = this.configFileColor(file);
      for (var k in file.dictionary) {
        key = file.dictionary[k];
        key.color = this.valueColor(key)
      }
      for (var p in file.profiles) {
        profile = file.profiles[p]
        profile.color = this.profileColor(profile)
        for (var q in profile.dictionary) {
          key = profile.dictionary[q]
          key.color = this.valueColor(key)
        }
      }
    }
  }

  this.color_in_table_list = function(table_list) {
    for (var t in table_list) {
      table = table_list[t];
      if (table.sizesMatch) {
        table.color = 'match';
      } else {
        table.color = 'absence';
        continue;
      }
      for (var r in table.rows) {
        row = table.rows[r];
        row.color = this.tableRowColor(row);
        if (row.color === 'difference') {
          table.color = 'difference';
        }
      }
    }
  }

  this.matchingValuesForKey = function(key) {
    if (key.existsInEnvironment.length == 0) {
      return true;
    } else {
      for (var i = 0; i < key.valueInEnvironment.length; i++ ) {
        if ((!key.existsInEnvironment[i]) || key.valueInEnvironment[i] != key.valueInEnvironment[0]) {
          return false;
        }
      }
    }
    return true;
  }

  this.profileColor = function(profile) {
    for (var env = 0; env < profile.existsInEnvironment.length; env++ ) {
      if (profile.existsInEnvironment[env] != true) {
        return "absence";
      }
    }
    for (var key in profile.dictionary) {
      if (!this.matchingValuesForKey(profile.dictionary[key])) {
        return "difference";
      }
    }
    return "match";
  }

  this.configFileColor = function(configFile) {
    for (var env = 0; env < configFile.existsInEnvironment.length; env++ ) {
      if (configFile.existsInEnvironment[env] != true) {
        return "absence";
      }
    }
    for (var o = 0; o < configFile.profiles.length; o++ ) {
      var profile = configFile.profiles[o];
      if (this.profileColor(profile) != "match") {
        return "difference";
      }
    }
    for (var key in configFile.dictionary) {
      if (!this.matchingValuesForKey(configFile.dictionary[key])) {
        return "difference";
      }
    }
    return "match";
  }

  this.valueColor = function(key) {
    if (key.existsInEnvironment.length === 0) {
      return "matching";
    } else {
      for (var i = 0; i < key.valueInEnvironment.length; i++ ) {
        if (!key.existsInEnvironment[i]) {
          return "absence"
        } else if (key.valueInEnvironment[i] !== key.valueInEnvironment[0]) {
          return "difference";
        }
      }
    }
    return "matching";
  }

  this.tableRowColor = function(row) {
    if (row.existsInEnvironment.length === 0) {
      return "matching";
    } else {
      for (var i = 0; i < row.existsInEnvironment.length; i++) {
        if (!row.existsInEnvironment[i]) {
          return "difference";
        }
      }
    }
    return "matching";
  }

  this.keysInDictionary = function(dictionary) {
    if (typeof dictionary !== 'undefined') {
      return Object.keys(dictionary)
    } else {
      return []
    }
  };
  
}]);
  
myApp.controller('ConfigAuditController', ['$scope', '$log', 'ServerDataService', 'ClientDataService', 'ComparisonService', function($scope, $log, ServerDataService, ClientDataService, ComparisonService) {

  this.files = [];
  this.errorMessage = '';
  this.error = false;
  this.comparisonObject = {configFiles: [], databaseTables: []};
  this.loaded = false;
  this.environments = [];
  this.environmentNames = [];
  this.loading = false;
  self = this;

  this.getConfigFilesFromJson = function(jsonFile, index) {
    self.createComparisonFileList = [];
    self.errorMessages[index] = '';
    ServerDataService.getData(jsonFile).then(function(response) {
      self.files[index] = response.data;
      self.getComparisonObject();
    }, function(errResponse) {
      $log.error('error getting data: ' + JSON.stringify(errResponse));
      self.errorMessage = errResponse.data;
      this.error=true;
      self.getComparisonObject();
    });
  };

  this.uploadFiles = function() {
    var fileList = $scope.files;
    this.environments = [];
    this.comparisonObject = {configFiles: [], databaseTables: []};
    ClientDataService.getData(fileList).then(function(response) {
      self.environments = response;
      self.environmentNames = response.map(function(env) {
        return env['overview']['Environment'];
      });
      ComparisonService.createComparisonFileList(self.environments).then(function(response) {
        self.comparisonObject.configFiles = response;
        $scope.$apply();
      });
      ComparisonService.createComparisonTableList(self.environments).then(function(response) {
        self.comparisonObject.databaseTables = response;
        $scope.$apply();
      });
      ComparisonService.createComparisonOverview(self.environments).then(function(response) {
        self.comparisonObject.overview = {
          values: response,
          show: true,
          highlight: false
        };
        $scope.$apply();
      });
      self.loading=false;
      self.loaded=true;
      $scope.$apply();
    }, function(errResponse) {
      $log.error(errResponse);
      self.errorMessage = errResponse;
      self.environments = [];
      self.loading=false;
      this.error=true;
      $scope.$apply();
    });
  }

  this.isNotEmpty = function(arrayElement) {
    return (arrayElement.length > 0)
  };

  this.environmentCount = function() {
    return this.environments.length;
  }

  this.openOrClosed = function(configLevel) {
    return configLevel.show ? "open" : "closed";
  }

  this.environmentAppearance = function(row) {
    if (this.comparisonObject.overview === undefined) {
      return ''
    }
    var count = 0;
    var environmentList = '';
    for (var e = 0; e < row.existsInEnvironment.length; e++) {
      if (row.existsInEnvironment[e]) {
        var p = ComparisonService.findPropertyIndexInList('Environment', this.comparisonObject.overview.values)
        if (count == 0) {
          environmentList = this.comparisonObject.overview.values[p].valueInEnvironment[e];
        } else {
          environmentList += ', ' + this.comparisonObject.overview.values[p].valueInEnvironment[e];
        }
        count ++;
      }
    }
    if (count > 1) {
      return 'Found in environments: ' + environmentList
    } else {
      return 'Found in environment: ' + environmentList
    }
  }

  this.createPDF = function() {

    block_with_title = function(pdf, title_text_element, content_text_elements, break_after) {
      if (content_text_elements.length > 0) {
        full_contents = [title_text_element].concat(content_text_elements);
        block = new Block_Element(full_contents, break_after);
        return block;
      }
    }

    running_elements = [];
    var pdf = new Pdf(running_elements);

    this.comparisonObject.configFiles.map(function(configFile) {

      fileHeader = new Text_Element(configFile.file, 18);
      fileText = [];
      for (var key in configFile.dictionary) {
        keyText = [];
        dictionary = configFile.dictionary;
        if (dictionary[key].comment !== '') {
          keyTitle = new Text_Element(key, 12, 0.2);
          for (var e = 0; e < this.environmentNames.length; e++) {
            env = new Text_Element(this.environmentNames[e], 10, 0.3, 2);
            value = new Text_Element(dictionary[key].valueInEnvironment[e], 10, 2.5);
            keyText.push(new Shared_Line_Element([env, value]));
          }
          keyText.push(new Text_Element(dictionary[key].comment, 10, 0.2));
          keyBlock = block_with_title(pdf, keyTitle, keyText, 0.3);
          if (keyBlock !== undefined) {
            fileText.push(keyBlock);
          }
        }
      }
      pdf.add(block_with_title(pdf, fileHeader, fileText), 0.2);
    }, this);
    // ele1 = new Text_Element('This is my new text element thing', 10, 1, 3);
    // ele2 = new Text_Element('This is another one, a bit bigger', 10, 4, 6);
    // hed = new Text_Element('This is the header', 16);
    // body = new Text_Element('This is some supporting text to explain the section', 10);
    // comment = new Text_Element('This is a long comment. This is a long comment. This is a long comment. This is a long comment. This is a long comment. This is a long comment. This is a long comment. ', 10);
    // left = new Text_Element('Key:', 10, 0, 1);
    // right1 = new Text_Element('Value!', 10, 2);
    // right2 = new Text_Element('More value!', 10, 2);
    // right3 = new Text_Element('Yet more value!', 10, 2);
    // shared1 = new Shared_Line_Element([left, right1]);
    // shared2 = new Shared_Line_Element([left, right2]);
    // shared3 = new Shared_Line_Element([left, right3]);
    // block = new Block_Element([hed, body, shared1, shared2, shared3, comment], 0.2);
    // pdf.add(block);
    // pdf.vertical_space(2);
    // pdf.add(block);
    // pdf.vertical_space(2);
    // pdf.add(block);
    // pdf.add(block);
    // pdf.page_break();
    // pdf.add(block);
    // pdf.page_break();
    // pdf.add(block);
    // pdf.page_break();
    // pdf.add(block);
    // pdf.add(block);
    // pdf.add(shared1);
    // pdf.add(shared1);
    // pdf.add(shared1);
    // pdf.add(shared1);
    // pdf.add(shared1);
    // pdf.add(shared1);
    // pdf.add(shared1);
    // pdf.add(shared1);
    // pdf.add(right2);
    // pdf.add(right2);
    // pdf.add(right2);
    // pdf.add(right2);
    // pdf.add(right2);
    // pdf.add(right2);
    // pdf.add(right2);
    // pdf.add(block);
    // pdf.header('Configuration Audit');
    // pdf.normal('This is the result of the configuration audit. It\'s a PDF, made using the PDF maker thing. It\'s starting to feel a bit better but I\'ve some work to do on getting sizes and gaps right.');
    // pdf.normal('It contains some text');
    // pdf.file_header('Central\\BM\\BackOffice.ini');
    // pdf.config_key('AutoExPeriod');
    // pdf.config_value('BRKLIVE', '1');
    // pdf.config_value('BRKLT', '30');
    // pdf.config_comment('The values here don\'t make much sense.')
    // pdf.normal('To show off the config audit');
    // for (var a = 0; a < 50; a++) {
    //   pdf.normal('This is a normal line of text' + a)
    // }
    pdf.save('Test.pdf');
  }

  $scope.filterText = ''
}]);

myApp.filter('tableContentFilter', function() {
  return function(rows, filterText, table) {
    if (rows === undefined) {
      return undefined;
    }
    if (table.title.toUpperCase().indexOf(filterText.toUpperCase()) > -1) {
      return rows;
    }
    var resultArray = [];
    angular.forEach(rows, function(row) {
      var rowAdded = false;
      angular.forEach(row.data, function(column) {
        if (!rowAdded) {
          if (column.toUpperCase().indexOf(filterText.toUpperCase()) > -1) {
            resultArray.push(row)
            rowAdded = true;
          }
        }
      })
    });
    return resultArray;
  }
})

myApp.filter('dictionaryContentFilter', function() {
  return function(rows, filterText, file, profile) {
    if (rows === undefined) {
      return undefined;
    }
    if (file.file.toUpperCase().indexOf(filterText.toUpperCase()) > -1) {
      return rows;
    }
    container = {};
    if (profile !== undefined) {
      if (profile.profile.toUpperCase().indexOf(filterText.toUpperCase()) > -1) {
        return rows;
      } else {
        container = profile;
      }
    } else {
      container = file;
    }
    var resultArray = [];
    angular.forEach(rows, function(key) {
      var keyAdded = false;
      if (key.toUpperCase().indexOf(filterText.toUpperCase()) > -1) {
        resultArray.push(key)
        keyAdded = true;
      }
      if (!keyAdded) {
        angular.forEach(container.dictionary[key].valueInEnvironment, function(value) {
          if (!keyAdded && value.toUpperCase().indexOf(filterText.toUpperCase()) > -1) {
            resultArray.push(key);
            keyAdded = true;
          }
        })
      }
    });
    return resultArray;
  }
})

myApp.filter('profileFilter', function() {
  return function(profiles, filterText, file) {
    if (file.file.toUpperCase().indexOf(filterText.toUpperCase()) > -1) {
      return profiles;
    }
    var resultArray = [];
    angular.forEach(profiles, function(profile) {
      var profileAdded = false;
      if (profile.profile.toUpperCase().indexOf(filterText.toUpperCase()) > -1) {
        resultArray.push(profile);
        profileAdded = true;
      }
      if (!profileAdded) {
        angular.forEach(profile.keys, function(key) {
          if (!profileAdded && key.toUpperCase().indexOf(filterText.toUpperCase()) > -1) {
            resultArray.push(profile)
            profileAdded = true;
          }
          if (!profileAdded) {
          angular.forEach(profile.dictionary[key].valueInEnvironment, function(value) {
            if (!profileAdded && value.toUpperCase().indexOf(filterText.toUpperCase()) > -1) {
              resultArray.push(profile);
              profileAdded = true;
              }
            })
          }
        });
      }
    })
    return resultArray;
  }
})

myApp.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
              if (element[0].files.length > 0) {
                scope.configViewer.loading=true;
                scope.configViewer.loaded=false;
                scope.configViewer.error=false;
                scope.configViewer.comparisonObject = [];
                scope.$apply();
                modelSetter(scope, element[0].files);
                scope.configViewer.uploadFiles();
              }
            });
        }
    };
}]);