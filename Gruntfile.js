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
            build: ['<%= vars.buildpath %>']
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
                    }
                ]
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

    // build
    grunt.registerTask('build',
        ['clean', 'browserify', 'copy', 'uglify', 'cssmin']);

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
}