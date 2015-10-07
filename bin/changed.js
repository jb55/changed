#!/usr/bin/env node

var changed = require('../');
var argv = require('minimist')(process.argv.slice(2));

function usage() {
  console.error("usage: changed [-s /tmp/store] file1.txt file2.txt");
  return process.exit(1);
}

if (argv._.length === 0)
  return usage();

var store = argv.s || "/tmp/changed.store";

changed(argv._, { store: store }, function(err, files){
  if (err) {
    console.error(err);
    process.exit(1);
  }

  files.forEach(function(file){
    console.log(file);
  });

  if (files.length === 0) process.exit(2);

  process.exit(0);
});
