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

    bump: {
      options: {
        filepaths: ['package.json', 'bower.json'],
        commit: true,
        tag: false
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
        src: ['lib/predicsis-jsSDK.js', 'lib/model/*.js', 'lib/helper/*.js'],
        dest: 'dist/predicsis-jsSDK.js'
      }
    },

    connect: {
      server: {
        options: {
          keepalive: true,
          port: 8100,
          hostname: '*'
        }
      }
    },

    // generate documentation of MLStudio source code
    ngdocs: {
      options: {
        dest: 'docs/',
        title: 'jsSDK: Documentation',
        //scripts: ['vendor/angular/angular.js'],
        styles: ['docs/ngdoc.css'],
        html5Mode: false,
        startPage: '/api',
        titleLink: '/api',
        bestMatch: true,
        analytics: {
          account: 'UA-63397194-1',
          domainName: 'http://yllieth.github.io/predicsis_ml_sdk-javascript'
        },
        discussions: {
          shortName: 'predicsismlsdkjavascript',
          url: 'https://predicsismlsdkjavascript.disqus.com',
          dev: false
        }
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
          'dist/predicsis-jsSDK.min.js': ['dist/predicsis-jsSDK.js']
        }
      }
    },

    karma: {
      unit: {
        configFile: 'test/configure.js',
        singleRun: true
      }
    },

    watch: {
      all: {
        files: ['lib/predicsis-jsSDK.js', 'lib/**/*.js'],
        tasks: ['build']
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

  grunt.registerTask('update', ['build', 'doc:deploy', 'bump:patch'])

};
