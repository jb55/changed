#!/usr/bin/env node

var changed = require('../');

function usage() {
  console.error("usage: changed file1.txt file2.txt");
  return process.exit(1);
}

if (process.argv.length < 3)
  return usage();

var files = process.argv.slice(2);
changed(files, function(err, files){
  files.forEach(function(file){
    console.log(file);
  });
});
