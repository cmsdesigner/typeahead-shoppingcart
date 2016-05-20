'use strict';
module.exports = function (grunt) {
  // load all grunt tasks
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jst');
    
  grunt.initConfig({    
    jst: {
      compile: {
        options: {
          templateSettings: {
            evaluate : /\{\[([\s\S]+?)\]\}/g,
            interpolate : /\{\{([\s\S]+?)\}\}/g
          }
        },
        files: {
          "templates.js": [ "templates/item.html",
                            "templates/product-input.html",
                            "templates/total.html",                            
                            "templates/product-list.html",
                            "templates/product-list-header.html"]
        }
      }
    },    
    concat: {
      options: {
        separator: ';'       
      },           
      libs: {
        src: [
            'bower_components/jquery/dist/jquery.js',
            'bower_components/bootstrap/dist/js/bootstrap.js',
            'bower_components/underscore/underscore.js',
            'bower_components/backbone/backbone.js',
            'bower_components/backbone.localStorage/backbone.localStorage.js',
            'bower_components/typeahead.js/dist/typeahead.js',
            'bower_components/hogan/web/1.0.0/hogan.js',
            'templates.js',
			      'bondecommande.js'  
        ],
        dest: 'bdc.js',
        nonull: true
      },
    },

  });
  grunt.registerTask('default', ['jst','concat']);
};