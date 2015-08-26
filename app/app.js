var myApp = angular.module('configAuditViewer', []);
  
myApp.service('DataService', ['$http', function($http) {
  this.getData = function(jsonFile) {
     return $http.get(jsonFile);
  }
}]);
  
myApp.controller('ConfigAuditController', ['$log', 'DataService', function($log, DataService) {

    // $log.error('ConfigAuditController started');

    this.environmentConfigs = [];
    this.errorMessages = [];
    this.fileLocation0 = '../data/SGSSUAT.json';
    this.fileLocation1 = '../data/SGSSPreProd.json';
    this.fileLocation2 = '../data/SGSSUAT.json';
    this.comparisonObjectBuilder = [];
    this.comparisonObject = [];
    self = this;

    this.getConfigFilesFromJson = function(jsonFile, index) {
      self.environmentConfigs[index] = [];
      self.errorMessages[index] = '';
      DataService.getData(jsonFile).then(function(response) {
        self.environmentConfigs[index] = response.data;
        self.getComparisonObject();
      }, function(errResponse) {
        $log.error('error getting data: ' + JSON.stringify(errResponse));
        self.errorMessages[index] = errResponse.data;
        self.getComparisonObject();
      });
    };

    this.getConfigFilesFromJson(this.fileLocation0, 1);
    this.getConfigFilesFromJson(this.fileLocation1, 0);

    this.getComparisonObject = function() {
      this.environments = this.environmentConfigs.filter(this.isNotEmpty);
      allFiles = function(environments) {
        var allFilesBuilder = [];
        for (i = 0; i < environments.length; i++ ) {
          for (j = 0; j < environments[i].length; j ++) {
            var file = {relativePath: environments[i][j].relativePath, fileName: environments[i][j].fileName}
            if (!listContainsFile(allFilesBuilder, file)) {
              allFilesBuilder.push(file);
            }
          }
        }
        return allFilesBuilder;
      }

      function listContainsFile(fileList, file) {
        for (f = 0; f < fileList.length; f ++) {
          if (fileList[f].fileName == file.fileName && fileList[f].relativePath == file.relativePath) {
            return true;
          } 
        }
        return false;
      }

      function indexOfFileInEnv(environmentFiles, file) {
        for (f = 0; f < environmentFiles.length; f ++) {
          if (environmentFiles[f].fileName == file.fileName && environmentFiles[f].relativePath == file.relativePath) {
            return f;
          }
        }
        return -1;
      }

      function indexOfOverrideLevelInFile(file, overrideLevel) {
        for (o = 0; o < file.overrideLevels.length; o ++) {
          if (file.overrideLevels[o].levelDescription == overrideLevel.levelDescription) {
            return o;
          }
        }
        return -1;
      }

      function fileContainsOverrideLevel(file, overrideLevel) {
        for (o = 0; o < file.overrideLevels.length; o++ ) {
          if (file.overrideLevels[o].levelDescription == overrideLevel.levelDescription) {
            return true;
          }
        }
        return false;
      }

      function overrideLevelContainsKey(overrideLevel, key) {
        for (k = 0; k < overrideLevel.keyValues.length; k++ ) {
          if (overrideLevel.keyValues[k].key == key) {
            return true;
          }
        }
        return false;
      }

      function envOverrideLevelContainsKey(overrideLevel, key) {
        for (k = 0; k < overrideLevel.keyValuePairs.length; k++ ) {
          if (overrideLevel.keyValuePairs[k].key == key) {
            return true;
          }
        }
        return false;
      }

      function valueOfKeyInEnvOverride(key, overrideLevel) {
        for (k = 0; k < overrideLevel.keyValuePairs.length; k++ ) {
          if (overrideLevel.keyValuePairs[k].key == key) {
            return overrideLevel.keyValuePairs[k].value;
          }
        }
        return null;
      }

      this.comparisonObjectBuilder = allFiles(this.environments);

      // find the override levels in each file.
      for (i = 0; i < this.comparisonObjectBuilder.length; i++ ) {
        this.comparisonObjectBuilder[i].existsInEnvironment = [];
        this.comparisonObjectBuilder[i].overrideLevels = [];
        this.comparisonObjectBuilder[i].highlight = false;
        this.comparisonObjectBuilder[i].show = false;
        for (j = 0; j < this.environments.length; j++ ) {
          var indexOfFile = indexOfFileInEnv(this.environments[j], (this.comparisonObjectBuilder[i]))
          this.comparisonObjectBuilder[i].existsInEnvironment[j] = (indexOfFile != -1)
          if (this.comparisonObjectBuilder[i].existsInEnvironment[j]) {
            for (ovrLvl = 0; ovrLvl < this.environments[j][indexOfFile].overrideLevels.length; ovrLvl++ ) {
              if (!fileContainsOverrideLevel(this.comparisonObjectBuilder[i], (this.environments[j][indexOfFile].overrideLevels[ovrLvl]))) {
                var overrideLevel = {show: false, highlight: false, levelDescription: this.environments[j][indexOfFile].overrideLevels[ovrLvl].levelDescription, existsInEnvironment: [], keyValues: []}
                this.comparisonObjectBuilder[i].overrideLevels.push(overrideLevel);
              }
              var coOvrLvl = indexOfOverrideLevelInFile(this.comparisonObjectBuilder[i], this.environments[j][indexOfFile].overrideLevels[ovrLvl])
              var coOverrideLevel = this.comparisonObjectBuilder[i].overrideLevels[coOvrLvl]
              for (k = 0; k < this.environments[j][indexOfFile].overrideLevels[ovrLvl].keyValuePairs.length; k++ ) {
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
      for (coF = 0; coF < this.comparisonObjectBuilder.length; coF++ ) {
        var coFile = this.comparisonObjectBuilder[coF];
        for (envE = 0; envE < this.environments.length; envE++ ) {
          var environment = this.environments[envE];
          if (coFile.existsInEnvironment[envE]) {
            for (coO = 0; coO < coFile.overrideLevels.length; coO++ ) {
              var envFile = environment[indexOfFileInEnv(environment, coFile)];
              var coOverrideLevel = coFile.overrideLevels[coO];
              coOverrideLevel.existsInEnvironment[envE] = fileContainsOverrideLevel(envFile, coOverrideLevel);
              if (coOverrideLevel.existsInEnvironment[envE]) {
                var envOverrideLevel = envFile.overrideLevels[indexOfOverrideLevelInFile(envFile, coOverrideLevel)];
                for (coK = 0; coK < coOverrideLevel.keyValues.length; coK++ ) {
                  var coKey = coOverrideLevel.keyValues[coK];
                  coKey.existsInEnvironment[envE] = envOverrideLevelContainsKey(envOverrideLevel, coKey.key);
                  if (coOverrideLevel.existsInEnvironment[envE]) {
                    coKey.valueInEnvironment[envE] = valueOfKeyInEnvOverride(coKey.key, envOverrideLevel);
                  }
                }
              }
            }
          }
        }
      }

      // Where something doesn't exist in an environment, populate the value's existence with 'false'.
      for (envE = 0; envE < this.environments.length; envE++ ) {
        for (coF = 0; coF < this.comparisonObjectBuilder.length; coF++ ) {
          var file = this.comparisonObjectBuilder[coF];
          for (coO = 0; coO < file.overrideLevels.length; coO++ ) {
            var overrideLevel = file.overrideLevels[coO];
            if (!overrideLevel.existsInEnvironment[envE]) {
              for (coK = 0; coK < overrideLevel.keyValues.length; coK++ ) {
                overrideLevel.keyValues[coK].existsInEnvironment[envE] = false;
                overrideLevel.keyValues[coK].valueInEnvironment[envE] = "";
              }
            }
          }
        }
      }
      

      this.comparisonObject = this.comparisonObjectBuilder;
    };

    this.isNotEmpty = function(arrayElement) {
      return (arrayElement.length > 0)
    };

    this.matchingValuesForKey = function(keyValues) {
      if (keyValues.existsInEnvironment.length == 0) {
        return true;
      } else {
        for (i = 0; i < keyValues.valueInEnvironment.length; i++ ) {
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
      for (env = 0; env < overrideLevel.existsInEnvironment.length; env++ ) {
        if (overrideLevel.existsInEnvironment[env] != true) {
          return "absence";
        }
      }
      for (k = 0; k < overrideLevel.keyValues.length; k++ ) {
        var key = overrideLevel.keyValues[k];
        if (!this.matchingValuesForKey(key)) {
          return "difference";
        }
      }
      return "match";
    }

    this.configFileColor = function(configFile) {
      for (env = 0; env < configFile.existsInEnvironment.length; env++ ) {
        if (configFile.existsInEnvironment[env] != true) {
          return "absence";
        }
      }
      for (o = 0; o < configFile.overrideLevels.length; o++ ) {
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
        for (i = 0; i < keyValue.valueInEnvironment.length; i++ ) {
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