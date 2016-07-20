
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

  this.generateReport = function(css) {

    var htmlElements = new HtmlElementArray();

    var style = new HtmlText(css, 'style');
    var head = new HtmlWrap(style, 'head')

    htmlElements.push(head);

    this.comparisonObject.configFiles.map(function(configFile) {

      var environmentNames = this.environmentNames;

      report_config_comment = function(dictionary, key) {
        var configElements = new HtmlElementArray();
        if (dictionary[key].comment !== '') {
          var rows = new HtmlElementArray();
          for (var e = 0; e < environmentNames.length; e++) {
            var env = new HtmlText(environmentNames[e], 'b');
            var value  = new HtmlText(dictionary[key].valueInEnvironment[e]);
            var row = new HtmlElementArray();
            row.push(env);
            row.push(value);
            rows.push(row);
          }
          var comparisonTable = new HtmlTable(rows);
          configElements.push(new HtmlText(key, 'h3'));
          configElements.push(comparisonTable);
          configElements.push(new HtmlText(dictionary[key].comment, 'p'));
        }
        return new HtmlWrap(configElements, 'div', 'config');
      }

      report_each_comment_in_dictionary = function(dictionary) {
        var dictionaryElements = new HtmlElementArray();
        for (var key in dictionary) {
          element = report_config_comment(dictionary, key);
          dictionaryElements.push(element);
        }
        return dictionaryElements;
      }

      var fileHeader = new HtmlText(configFile.file, 'h1');
      var fileHtmlElements = report_each_comment_in_dictionary(configFile.dictionary);

      for (var p = 0; p < configFile.profiles.length; p++) {
        var profile = configFile.profiles[p]
        var profileHeader = new HtmlText(profile.profile, 'h2');
        var profileText = report_each_comment_in_dictionary(profile.dictionary);
        var profileList = new HtmlElementListWithHeader(profileHeader, profileText);

        profileList = new HtmlWrap(profileList, 'div', 'profile')

        fileHtmlElements.push(profileList);
      };

      var fileList = new HtmlElementListWithHeader(fileHeader, fileHtmlElements);
      fileList = new HtmlWrap(fileList, 'div', 'file')
      htmlElements.push(fileList);

    }, this);

    download_html('report.html', htmlElements.html());

  }

  this.createReport = function() {
    var cssFile = new XMLHttpRequest();
    cssFile.open("GET","reportgen/style.css",true);
    cssFile.send();

    var self = this;

    cssFile.onreadystatechange = function(){
      if (cssFile.readyState == 4 && cssFile.status == 200) {
        self.generateReport(cssFile.responseText);
      }
    }
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