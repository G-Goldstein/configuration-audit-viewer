
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

myApp.service('ComparisonService', function() {

  this.uniqueFiles = function(environments) {
    var fileListBuilder = [];
    for (var env = 0; env < environments.length; env ++ ) {
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

  this.listContainsFile = function(fileList, file) {
    for (var f = 0; f < fileList.length; f ++) {
      if (this.filesMatch(fileList[f], file)) {
        return true;
      } 
    }
    return false;
  }
  
});
  
myApp.controller('ConfigAuditController', ['$scope', '$log', 'ServerDataService', 'ClientDataService', function($scope, $log, ServerDataService, ClientDataService) {

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
      self.getComparisonObject();
      self.loading=false;
      $scope.$apply();
    }, function(errResponse) {
      $log.error(errResponse);
      self.errorMessage = errResponse;
      self.environments = [];
      self.getComparisonObject();
      self.loading=false;
      $scope.$apply();
    });
  }


  this.getComparisonObject = function() {
    allFiles = function(environments) {
      var allFilesBuilder = [];
      for (var i = 0; i < environments.length; i++ ) {
        for (var j = 0; j < environments[i].length; j ++) {
          var file = {relativePath: environments[i][j].relativePath, fileName: environments[i][j].fileName}
          if (!listContainsFile(allFilesBuilder, file)) {
            allFilesBuilder.push(file);
          }
        }
      }
      return allFilesBuilder;
    }

    

    function indexOfFileInEnv(environmentFiles, file) {
      for (var f = 0; f < environmentFiles.length; f ++) {
        if (environmentFiles[f].fileName == file.fileName && environmentFiles[f].relativePath == file.relativePath) {
          return f;
        }
      }
      return -1;
    }

    function indexOfOverrideLevelInFile(file, overrideLevel) {
      for (var o = 0; o < file.overrideLevels.length; o ++) {
        if (file.overrideLevels[o].levelDescription == overrideLevel.levelDescription) {
          return o;
        }
      }
      return -1;
    }

    function fileContainsOverrideLevel(file, overrideLevel) {
      for (var o = 0; o < file.overrideLevels.length; o++ ) {
        if (file.overrideLevels[o].levelDescription == overrideLevel.levelDescription) {
          return true;
        }
      }
      return false;
    }

    function overrideLevelContainsKey(overrideLevel, key) {
      for (var k = 0; k < overrideLevel.keyValues.length; k++ ) {
        if (overrideLevel.keyValues[k].key == key) {
          return true;
        }
      }
      return false;
    }

    function envOverrideLevelContainsKey(overrideLevel, key) {
      for (var k = 0; k < overrideLevel.keyValuePairs.length; k++ ) {
        if (overrideLevel.keyValuePairs[k].key == key) {
          return true;
        }
      }
      return false;
    }

    function valueOfKeyInEnvOverride(key, overrideLevel) {
      for (var k = 0; k < overrideLevel.keyValuePairs.length; k++ ) {
        if (overrideLevel.keyValuePairs[k].key == key) {
          return overrideLevel.keyValuePairs[k].value;
        }
      }
      return null;
    }

    this.comparisonObjectBuilder = allFiles(this.environments);

    // find the override levels in each file.
    for (var i = 0; i < this.comparisonObjectBuilder.length; i++ ) {
      this.comparisonObjectBuilder[i].existsInEnvironment = [];
      this.comparisonObjectBuilder[i].overrideLevels = [];
      this.comparisonObjectBuilder[i].highlight = false;
      this.comparisonObjectBuilder[i].show = false;
      for (var j = 0; j < this.environments.length; j++ ) {
        var indexOfFile = indexOfFileInEnv(this.environments[j], (this.comparisonObjectBuilder[i]))
        this.comparisonObjectBuilder[i].existsInEnvironment[j] = (indexOfFile != -1)
        if (this.comparisonObjectBuilder[i].existsInEnvironment[j]) {
          for (var ovrLvl = 0; ovrLvl < this.environments[j][indexOfFile].overrideLevels.length; ovrLvl++ ) {
            if (!fileContainsOverrideLevel(this.comparisonObjectBuilder[i], (this.environments[j][indexOfFile].overrideLevels[ovrLvl]))) {
              var overrideLevel = {show: true, highlight: false, levelDescription: this.environments[j][indexOfFile].overrideLevels[ovrLvl].levelDescription, existsInEnvironment: [], keyValues: []}
              this.comparisonObjectBuilder[i].overrideLevels.push(overrideLevel);
            }
            var coOvrLvl = indexOfOverrideLevelInFile(this.comparisonObjectBuilder[i], this.environments[j][indexOfFile].overrideLevels[ovrLvl])
            var coOverrideLevel = this.comparisonObjectBuilder[i].overrideLevels[coOvrLvl]
            for (var k = 0; k < this.environments[j][indexOfFile].overrideLevels[ovrLvl].keyValuePairs.length; k++ ) {
              var key = {key: this.environments[j][indexOfFile].overrideLevels[ovrLvl].keyValuePairs[k].key, existsInEnvironment: [], valueInEnvironment: []}
              if (!overrideLevelContainsKey(coOverrideLevel, key.key)) {
                coOverrideLevel.keyValues.push(key);
              }
            }
          }
        } 
      }
    }

    // for each environment, check whether the override and key values exist, and record that along with what they are.
    for (var coF = 0; coF < this.comparisonObjectBuilder.length; coF++ ) {
      var coFile = this.comparisonObjectBuilder[coF];
      for (var envE = 0; envE < this.environments.length; envE++ ) {
        var environment = this.environments[envE];
        if (coFile.existsInEnvironment[envE]) {
          for (var coO = 0; coO < coFile.overrideLevels.length; coO++ ) {
            var envFile = environment[indexOfFileInEnv(environment, coFile)];
            var coOverrideLevel = coFile.overrideLevels[coO];
            coOverrideLevel.existsInEnvironment[envE] = fileContainsOverrideLevel(envFile, coOverrideLevel);
            if (coOverrideLevel.existsInEnvironment[envE]) {
              var envOverrideLevel = envFile.overrideLevels[indexOfOverrideLevelInFile(envFile, coOverrideLevel)];
              for (var coK = 0; coK < coOverrideLevel.keyValues.length; coK++ ) {
                var coKey = coOverrideLevel.keyValues[coK];
                coKey.existsInEnvironment[envE] = envOverrideLevelContainsKey(envOverrideLevel, coKey.key);
                if (coOverrideLevel.existsInEnvironment[envE]) {
                  coKey.valueInEnvironment[envE] = valueOfKeyInEnvOverride(coKey.key, envOverrideLevel);
                }
              }
            }
          }
        } else {
          for (var coO = 0; coO < coFile.overrideLevels.length; coO++ ) {
            var coOverrideLevel = coFile.overrideLevels[coO];
            coOverrideLevel.existsInEnvironment[envE] = false;
          }
        }
      }
    }

    // Where something doesn't exist in an environment, populate the value's existence with 'false'.
    for (var envE = 0; envE < this.environments.length; envE++ ) {
      for (var coF = 0; coF < this.comparisonObjectBuilder.length; coF++ ) {
        var file = this.comparisonObjectBuilder[coF];
        for (var coO = 0; coO < file.overrideLevels.length; coO++ ) {
          var overrideLevel = file.overrideLevels[coO];
          if (!overrideLevel.existsInEnvironment[envE]) {
            for (var coK = 0; coK < overrideLevel.keyValues.length; coK++ ) {
              overrideLevel.keyValues[coK].existsInEnvironment[envE] = false;
              overrideLevel.keyValues[coK].valueInEnvironment[envE] = "";
            }
          }
        }
      }
    }
    

    this.comparisonObject.configFiles = this.comparisonObjectBuilder;

  };

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