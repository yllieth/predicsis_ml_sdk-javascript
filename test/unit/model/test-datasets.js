describe('Datasets model', function () {
  var scope;

  beforeEach(module('predicsis.jsSDK'));
  beforeEach(inject(function ($rootScope) { scope = $rootScope.$new(); }));

  it('always pass', function (done) {
    expect(true).toBe(true);
    done();
  });
});
