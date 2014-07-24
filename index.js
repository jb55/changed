
var fs      = require('fs');
var path    = require('path');
var split   = require('split');
var through = require('through2').obj;
var async   = require('async');
var _       = require('underscore');
var debug   = require('debug')('changed');

module.exports = function(toCheck, opts, done) {
  if (arguments.length === 2) {
    done = opts;
    opts = {};
  }
  else {
    opts = opts || {};
  }

  var store = opts.store || "/tmp/changed.store";
  toCheck = toCheck.map(function(file){
    return path.resolve(file);
  });

  readStorage(store, function(err, files){
    async.map(toCheck, statFile, function(err, checkedFiles){
      if (err) return done(err);
      var changed = checkedFiles.filter(function(checkedFile){
        var name = checkedFile.file;
        var nameInFiles = name in files;
        var cached = nameInFiles && files[name];
        var checked = checkedFile.mtime;
        debug("mtimes %s cached(%j) checked(%s)", name, cached, checked);
        return !nameInFiles || cached !== checked;
      });

      // remove missing files?
      checkedFiles.forEach(function(checkedFile){
        files[checkedFile.file] = checkedFile.mtime;
      });

      writeStorage(store, files, function(err){
        var picked = _.pluck(changed, 'file');
        done(err, picked);
      });
    });
  });
};

function statFile(file, done) {
  fs.stat(file, function(err, stats){
    if (err) return done(err);
    return done(err, {
      file: file,
      mtime: stats.mtime.getTime()
    });
  });
}

function writeStorage(storeFile, files, done) {
  var wstream = fs.createWriteStream(storeFile);
  for (var key in files) {
    var file = files[key];
    wstream.write(key + "\t" + file + "\n");
  }
  wstream.end();
  wstream.on('finish', done);
}

function readStorage(storeFile, done) {
  var files = {};

  if (!fs.existsSync(storeFile))
    return done(null, files);

  function write(chunk, enc, cb) {
    if (chunk.toString() === "") return cb();
    var arr = chunk.split("\t");
    files[arr[0]] = +arr[1];
    cb();
  }

  function end() {
    done(null, files);
  }

  return fs.createReadStream(storeFile)
  .pipe(split())
  .pipe(through(write, end));
}
