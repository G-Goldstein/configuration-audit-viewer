
var myApp = angular.module('configAuditViewer', []);
  
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
        comparisonService.addFilesToEnvironment(environments[e], fileList, e);
      }
      resolve(fileList);
    })
  }

  this.uniqueFiles = function(environments) {
    var fileListBuilder = [];
    for (var env = 0; env < environments.length; env++ ) {
      for (var fil = 0; fil < environments[env].configFiles.length; fil ++) {
        var file = {relativePath: environments[env].configFiles[fil].relativePath, fileName: environments[env].configFiles[fil].fileName, existsInEnvironment: [true, false]}
        if (!this.listContainsFile(fileListBuilder, file)) {
          fileListBuilder.push(file);
        }
      }
    }
    return fileListBuilder;
  };

  this.filesMatch = function(fileA, fileB) {
    return (fileA.fileName === fileB.fileName && fileA.relativePath === fileB.relativePath)
  };
  this.isFile = function(object) {
    if (object === undefined) {
      return false;
    } else {
      return (object.hasOwnProperty('fileName') && object.hasOwnProperty('relativePath'));
    }
  }
  this.overrideLevelsMatch = function(overrideLevelA, overrideLevelB) {
    return (overrideLevelA.levelDescription === overrideLevelB.levelDescription);
  }
  this.keysMatch = function(keyValueA, keyValueB) {
    return (keyValueA.key === keyValueB.key);
  }

  this.listContainsFile = function(fileList, file) {
    for (var f = 0; f < fileList.length; f++ ) {
      if (this.filesMatch(fileList[f], file)) {
        return true;
      } 
    }
    return false;
  }

  this.findFileIndexInList = function(file, fileList) {
    return this.getIndexOfItemInList(file, fileList, this.filesMatch);
  }

  this.addFileToEnvironment = function(file, configFiles, environment) {
    if (!this.listContainsFile(configFiles, file)) {
      var fileInsert = {
        fileName: file.fileName,
        relativePath: file.relativePath,
        existsInEnvironment: [],
        overrideLevels: []
      };
      fileInsert.existsInEnvironment[environment] = true;
      this.addOverrideLevelsToEnvironment(file.overrideLevels, fileInsert, environment);
      configFiles.push(fileInsert);
    } else {
      var indexOfFile = this.findFileIndexInList(file, configFiles);
      configFiles[indexOfFile].existsInEnvironment[environment] = true;
      this.addOverrideLevelsToEnvironment(file.overrideLevels, configFiles[indexOfFile], environment);
    }
  }

  this.addFilesToEnvironment = function(fileList, configFiles, environment) {
    for (f = 0; f < fileList.length; f++ ) {
      this.addFileToEnvironment(fileList[f], configFiles, environment);
    }
  }

  this.addOverrideLevelToEnvironment = function(overrideLevel, file, environment) {
    var index = this.getIndexOfItemInList(overrideLevel, file.overrideLevels, this.overrideLevelsMatch);
    if (index === -1) {
      var overrideLevelInsert = {levelDescription: overrideLevel.levelDescription,
                                 existsInEnvironment: [],
                                 keyValuePairs: []}
      overrideLevelInsert.existsInEnvironment[environment] = true;
      this.addKeyValuePairsToEnvironment(overrideLevel.keyValuePairs, overrideLevelInsert, environment);
      file.overrideLevels.push(overrideLevelInsert);
    } else {
      file.overrideLevels[index].existsInEnvironment[environment] = true;
      this.addKeyValuePairsToEnvironment(overrideLevel.keyValuePairs, file.overrideLevels[index], environment);
    }
  }

  this.addOverrideLevelsToEnvironment = function(overrideLevels, file, environment) {
    for (o = 0; o < overrideLevels.length; o++ ) {
      this.addOverrideLevelToEnvironment(overrideLevels[o], file, environment);
    }
  }

  this.addKeyValuePairToEnvironment = function(keyValuePair, overrideLevel, environment) {
    var index = this.getIndexOfItemInList(keyValuePair, overrideLevel.keyValuePairs, this.keysMatch);
    if (index === -1) {
      var keyValuePairInsert = {key: keyValuePair.key, existsInEnvironment: [], valueInEnvironment: []}
      keyValuePairInsert.existsInEnvironment[environment] = true;
      keyValuePairInsert.valueInEnvironment[environment] = keyValuePair.value;
      overrideLevel.keyValuePairs.push(keyValuePairInsert);
    } else {
      overrideLevel.keyValuePairs[index].existsInEnvironment[environment] = true;
      overrideLevel.keyValuePairs[index].valueInEnvironment[environment] = keyValuePair.value;
    }
  }

  this.addKeyValuePairsToEnvironment = function(keyValuePairs, overrideLevel, environment) {
    for (k = 0; k < keyValuePairs.length; k++ ) {
      this.addKeyValuePairToEnvironment(keyValuePairs[k], overrideLevel, environment);
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
  
}]);
  
myApp.controller('ConfigAuditController', ['$scope', '$log', 'ServerDataService', 'ClientDataService', 'ComparisonService', function($scope, $log, ServerDataService, ClientDataService, ComparisonService) {

  this.files = [];
  this.errorMessage = '';
  this.comparisonObjectBuilder = [];
  this.comparisonObject = [];
  this.environments = [];
  this.loading = false;
  self = this;

  this.getConfigFilesFromJson = function(jsonFile, index) {
    self.files[index] = [];
    self.errorMessages[index] = '';
    ServerDataService.getData(jsonFile).then(function(response) {
      self.files[index] = response.data;
      self.getComparisonObject();
    }, function(errResponse) {
      $log.error('error getting data: ' + JSON.stringify(errResponse));
      self.errorMessage = errResponse.data;
      self.getComparisonObject();
    });
  };

  this.uploadFiles = function() {
    var fileList = $scope.files;
    this.environments = [];
    ClientDataService.getData(fileList).then(function(response) {
      self.environments = response;
      comparisonObject = ComparisonService.createComparisonFileList(self.environments);
      self.loading=false;
      $scope.$apply();
    }, function(errResponse) {
      $log.error(errResponse);
      self.errorMessage = errResponse;
      self.environments = [];
      self.loading=false;
      $scope.$apply();
    });
  }

  this.isNotEmpty = function(arrayElement) {
    return (arrayElement.length > 0)
  };

  this.matchingValuesForKey = function(keyValues) {
    if (keyValues.existsInEnvironment.length == 0) {
      return true;
    } else {
      for (var i = 0; i < keyValues.valueInEnvironment.length; i++ ) {
        if ((!keyValues.existsInEnvironment[i]) || keyValues.valueInEnvironment[i] != keyValues.valueInEnvironment[0]) {
          return false;
        }
      }
    }
    return true;
  }

  this.environmentCount = function() {
    return this.environments.length;
  }

  this.evenOdd = function(number) {
    if (number % 2 == 0) {
      return "even";
    } else {
      return "odd";
    }
  }

  this.overrideLevelColor = function(overrideLevel) {
    for (var env = 0; env < overrideLevel.existsInEnvironment.length; env++ ) {
      if (overrideLevel.existsInEnvironment[env] != true) {
        return "absence";
      }
    }
    for (var k = 0; k < overrideLevel.keyValues.length; k++ ) {
      var key = overrideLevel.keyValues[k];
      if (!this.matchingValuesForKey(key)) {
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
    for (var o = 0; o < configFile.overrideLevels.length; o++ ) {
      var overrideLevel = configFile.overrideLevels[o];
      if (this.overrideLevelColor(overrideLevel) != "match") {
        return "difference";
      }
    }
    return "match";
  }

  this.openOrClosed = function(configLevel) {
    if (configLevel.show) {
      return "open"
    } else {
      return "closed"
    }
  }

  this.valueColor = function(keyValue) {
    if (keyValue.existsInEnvironment.length == 0) {
      return "matching";
    } else {
      for (var i = 0; i < keyValue.valueInEnvironment.length; i++ ) {
        if (!keyValue.existsInEnvironment[i]) {
          return "absence"
        } else if (keyValue.valueInEnvironment[i] != keyValue.valueInEnvironment[0]) {
          return "difference";
        }
      }
    }
    return "matching";
  }

}]);

myApp.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
              if (element[0].files.length > 0) {
                scope.configViewer.loading=true;
                scope.configViewer.comparisonObject = [];
                scope.$apply();
                modelSetter(scope, element[0].files);
                scope.configViewer.uploadFiles();
              }
            });
        }
    };
}]);