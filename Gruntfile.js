module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    vars: {
      buildpath: './build',
      tmppath: './tmp',
      host: '54.214.244.77'
    },

    clean: {
      options: {
        force: true
      },
      build: ['<%= vars.buildpath %>', '<%= vars.tmppath %>']
    },

    copy: {
      main: {
        files: [
          {
            expand: true,
            src: ['src/styles/*.png'],
            dest: "<%= vars.buildpath %>/public/styles",
            filter: 'isFile',
            flatten: true
          },
          {
            expand: true,
            src: ['src/img/*.png'],
            dest: "<%= vars.buildpath %>/public/img",
            filter: 'isFile',
            flatten: true
          },
          {
            expand: true,
            src: ['src/templates/*.html'],
            dest: "<%= vars.buildpath %>/templates",
            filter: 'isFile',
            flatten: true
          },
          {
            src: 'src/app.conf',
            dest: "<%= vars.buildpath %>/app.conf"
          },
          // copy all the UI modules for swig-react
          {
            expand: true,
            cwd: '<%= vars.tmppath %>/ssjsx',
            src: ['**'],
            filter: 'isFile',
            dest: "<%= vars.buildpath %>/modules"
          }
        ]
      },
      dev: {
        files: {
          '<%= vars.buildpath %>/public/js/bundle.js': '<%= vars.tmppath %>/bundle.js',
          '<%= vars.buildpath %>/app.js': 'src/app.js'
        }
      }
    },

    uglify: {
      build: {
        files: {
          '<%= vars.buildpath %>/public/js/bundle.js': '<%= vars.tmppath %>/bundle.js',
          '<%= vars.buildpath %>/app.js': 'src/app.js'
        }
      }
    },

    cssmin: {
      minify: {
        expand: true,
        cwd: 'src/styles/',
        src: ['*.css'],
        dest: '<%= vars.buildpath %>/public/styles/',
        ext: '.css'
      }
    },

    react: {
      serverSide: {
        files: [
          {
            expand: true,
            cwd: 'src/',
            src: ['ui/**/*.jsx'],
            dest: '<%= vars.tmppath %>/ssjsx/',
            ext: '.js'
          }
        ]
      }
    },

    browserify: {
      '<%= vars.tmppath %>/bundle.js': ['src/main.js']
    },

    rsync: {
      options: {
        args: ['--verbose'],
        exclude: ['.node*', 'node_modules'],
        recursive: true
      },
      deploy: {
        options: {
          host: '<%= vars.host %>',
          src: '<%= vars.buildpath %>/',
          dest: '/var/www',
          syncDestIgnoreExcl: true
        }
      },
      stage: {
        options: {
          host: '<%= vars.host %>',
          src: '<%= vars.buildpath %>/',
          dest: '/var/stage',
          syncDestIgnoreExcl: true
        }
      }
    }
  });

  // Load tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-rsync');
  grunt.loadNpmTasks('grunt-react');

  // build
  grunt.registerTask('build',
    ['clean', 'react:serverSide', 'browserify', 'copy', 'uglify', 'cssmin']);

  // dev
  grunt.registerTask('dev',
    ['clean', 'react:serverSide', 'browserify', 'copy', 'copy:dev']);

  // deploy
  grunt.registerTask('deploy',
    ['rsync:deploy']);

  // stage
  grunt.registerTask('stage',
    ['rsync:stage']);

  // all: build & deploy
  grunt.registerTask('all',
    ['default', 'deploy']);

  // Build only by default
  grunt.registerTask('default', ['build']);
};