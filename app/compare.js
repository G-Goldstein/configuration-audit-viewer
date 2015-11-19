
Object.objects_equal = function (objA, objB) {
  return Object.stringify(objA) === Object.stringify(objB);
}

Object.object_in_list = function (obj, list) {
    for (var i = 0; i < list.length; i++) {
        if (Object.objects_equal(obj, list[i])) {
            return true;
        }
    }
    return false;
}

Object.stringify = function(object) {

  sort_for_jsoning = function(object) {
    if (typeof object !== "object" || object === null) {
      return object;
    }
    return Object.keys(object).sort().map(function(key) {
      return {
        key: key,
        value: sort_for_jsoning(object[key])
      };
    });
  }

  return JSON.stringify(sort_for_jsoning(object))
}