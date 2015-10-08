
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
        comparisonService.addFilesToEnvironment(environments[e].config_files, fileList, e, environments.length);
      }
      comparisonService.color_in_file_list(fileList);
      resolve(fileList);
    })
  }

  this.filesMatch = function(fileA, fileB) {
    return (fileA.file === fileB.file)
  };
  this.isFile = function(object) {
    if (object === undefined) {
      return false;
    } else {
      return (object.hasOwnProperty('file'));
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

  this.findFileIndexInList = function(file, fileList) {
    return this.getIndexOfItemInList(file, fileList, this.filesMatch);
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

  this.addFilesToEnvironment = function(fileList, comparisonFiles, environment, environmentCount) {
    for (var f = 0; f < fileList.length; f++ ) {
      this.addFileToEnvironment(fileList[f], comparisonFiles, environment, environmentCount);
    }
  }

  this.addProfileToEnvironment = function(profile, file, environment, environmentCount) {
    var index = this.getIndexOfItemInList(profile, file.profiles, this.profilesMatch);
    if (index === -1) {
      var profileInsert = {profile: profile.profile,
                                 existsInEnvironment: [],
                                 dictionary: {},
                                 show: true,
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
  
}]);
  
myApp.controller('ConfigAuditController', ['$scope', '$log', 'ServerDataService', 'ClientDataService', 'ComparisonService', function($scope, $log, ServerDataService, ClientDataService, ComparisonService) {

  this.files = [];
  this.errorMessage = '';
  this.comparisonObject = {configFiles: []};
  this.environments = [];
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
      self.getComparisonObject();
    });
  };

  this.uploadFiles = function() {
    var fileList = $scope.files;
    this.environments = [];
    this.comparisonObject = {configFiles: []};
    ClientDataService.getData(fileList).then(function(response) {
      self.environments = response;
      ComparisonService.createComparisonFileList(self.environments).then(function(response) {
        self.comparisonObject.configFiles = response;
        $scope.$apply();
      });
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

  this.openOrClosed = function(configLevel) {
    if (configLevel.show) {
      return "open"
    } else {
      return "closed"
    }
  }

  this.keysInDictionary = function(dictionary) {
    return Object.keys(dictionary)
  };

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