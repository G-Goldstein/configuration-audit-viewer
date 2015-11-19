describe('compare', function() {

  var stringA1 = 'hello';
  var stringA2 = 'hello';
  var stringB1 = 'goodbye';
  var arrayA1 = ['a', 'b', 'c'];
  var arrayA2 = ['a', 'b', 'c'];
  var arrayB1 = ['c', 'b', 'a'];
  var objectA1 = {greeting: 'hello', colour: 'red'};
  var objectA2 = {greeting: 'hello', colour: 'red'};
  var objectB1 = {greeting: 'goodbye', colour: 'blue'};
  var objectC1 = {favouriteobject: stringA1, otherobjects: [arrayA1, objectA1]};
  var objectC2 = {favouriteobject: stringA2, otherobjects: [arrayA2, objectA2]};
  var objectD1 = {favouriteobject: stringB1, otherobjects: [arrayB1, objectB1]};

  runtests = function(object_type, objA1, objA2, objB1) {
    describe(object_type, function() {
      it('should be true for matching ' + object_type, function() {
        expect(Object.objects_equal(objA1, objA1)).toBe(true);
        expect(Object.objects_equal(objA1, objA2)).toBe(true);
        expect(Object.objects_equal(objA2, objA1)).toBe(true);
      });
      it('should be false for ' + object_type + ' that don\'t match', function() {
        expect(Object.objects_equal(objA1, objB1)).toBe(false);
        expect(Object.objects_equal(objA2, objB1)).toBe(false);
      });
      it('should be false for comparison with a null object', function() {
        expect(Object.objects_equal(objA1, null)).toBe(false);
      });
    });
  };

  runtests('strings', stringA1, stringA2, stringB1);
  runtests('arrays', arrayA1, arrayA2, arrayB1);
  runtests('objects', objectA1, objectA2, objectB1);
  runtests('complex objects', objectA1, objectA2, objectB1);

  describe('string comparison', function() {
    it('should sort strings alphanumerically', function() {
      expect('a'<'b').toBe(true);
      expect('b'>'a').toBe(true);
      expect('a'>'0').toBe(true);
      expect('a'<'aa').toBe(true);
      expect('b'>'ab').toBe(true);
      expect('a'>'b').toBe(false);
      expect('b'<'a').toBe(false);
      expect('a'<'0').toBe(false);
      expect('a'>'aa').toBe(false);
      expect('b'<'ab').toBe(false);
    })
  })
  describe('array comparison', function() {
    describe('when given two arrays of the same length', function() {
      it('should sort them by sorting each element', function() {
        expect(['a']<['b']).toBe(true);
        expect(['a','c']<['a','d']).toBe(true);
        expect(['b','c']>['a','d']).toBe(true);
        expect([2,'c']>[1,'c']).toBe(true);
        expect(['a']>['b']).toBe(false);
        expect(['a','c']>['a','d']).toBe(false);
        expect(['b','c']<['a','d']).toBe(false);
        expect([2,'c']<[1,'c']).toBe(false);
      })
    })
  })

});