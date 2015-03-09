module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    buildcontrol: {
      options: {
        dir: 'docs',
        commit: true,
        push: true,
        message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
      },
      github: {
        options: {
          remote: 'git@github.com:yllieth/predicsis_ml_sdk-javascript.git',
          branch: 'gh-pages'
        }
      }
    },

    // remove previous builds
    clean: {
      dist: ['dist'],
      docs: ['docs/.git']
    },

    // build all model files into a single js file
    concat: {
      dist: {
        src: ['lib/model/*.js'],
        dest: 'dist/predicsisMLSDK.js'
      }
    },

    // generate documentation of MLStudio source code
    ngdocs: {
      options: {
        dest: 'docs/',
        title: 'Documentation',
        //scripts: ['vendor/angular/angular.js'],
        styles: ['docs/ngdoc.css'],
        html5Mode: false,
        startPage: '/api',
        titleLink: '/api',
        bestMatch: true
      },
      api: {
        src: ['lib/model/*.js', 'lib/helper/*.js']
      }
    },

    // remove comments
    uglify: {
      options: {
        mangle: false,
        sourceMap: true
      },
      dist: {
        files: {
          'dist/predicsisMLSDK.min.js': ['dist/predicsisMLSDK.js']
        }
      }
    }
  });

  grunt.registerTask('build', ['clean:dist', 'concat', 'uglify']);

  grunt.registerTask('doc', function(target) {
    if (target === 'deploy') {
      grunt.task.run(['buildcontrol:github', 'clean:docs']);
    } else {
      grunt.task.run(['ngdocs']);
    }
  });

};
