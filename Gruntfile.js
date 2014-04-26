module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    ender: {
      options: {
        output: "public/build/ender",
        dependencies: ["bean", "bonzo", "qwery", "reqwest", "domready"]
      }
    },
    database: 'likamag.sqlite',
  });

  grunt.loadNpmTasks('grunt-ender');

  grunt.registerTask('default', ['ender']);
  grunt.registerTask('database', function(){
    var done = this.async();
    var fs = require('fs');
    var sqlite3 = require('sqlite3');
    var filename = grunt.config('database');
    var db;

    if (fs.existsSync(filename)) {
      grunt.warn('database '+filename+' already created');
      done();
    } else {
      fs.openSync(filename, 'w');
      db = new sqlite3.Database(filename);
      db.run("CREATE TABLE links (clx NUMERIC, id INTEGER PRIMARY KEY, url TEXT)", done);
      grunt.log.writeln('database '+filename+' successfully created').ok();
    }
  });
};
