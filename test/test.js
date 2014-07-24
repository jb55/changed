
var expect  = require('expect.js');
var fs      = require('fs');
var changed = require('../');
var path    = require('path');
var touch   = require('touch');

var store   = "/tmp/test.changed.store";
var toCheck = ["index.js", "package.json"];
var toMatch = toCheck.map(function(file){
  return path.resolve(file);
});

describe('changed', function(){
  before(function(done){
    try {
      fs.unlinkSync(store);
    } catch(e) {}
    done();
  });

  it('notices changes first time', function(done){
    changed(toCheck, { store: store }, function(err, files){
      if (err) return done(err);
      expect(files).to.eql(toMatch);
      done();
    });
  });

  it('doesnt the second time', function(done){
    changed(toCheck, { store: store }, function(err, files){
      if (err) return done(err);
      expect(files.length).to.be(0);
      done();
    });
  });

  it('touching makes one changed', function(done){
    touch(toCheck[1], function(){
      changed(toCheck, { store: store }, function(err, files){
        if (err) return done(err);
        expect(files).to.eql([toMatch[1]]);
        done();
      });
    });
  });
});
