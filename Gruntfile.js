module.exports = function(grunt) {
    // project config
    grunt.initConfig({
        // variables
        pkg: grunt.file.readJSON('package.json'),
        vars: {
            buildpath: '../<%= pkg.name %>-build'
        },
        //
        clean: {
            options: {
                force: true
            },
            build: ['<%= vars.buildpath %>']
        },
        //
        requirejs: {
            compile: {
                options: {
                    baseUrl: "js",
                    mainConfigFile: "js/main.js",
                    out: "<%= vars.buildpath %>/js/main.js",
                    name: "main"
                }
            }
        },
        //
        copy: {
            main: {
                files: [
                    {expand: true, src: ['styles/*.png'], dest: "<%= vars.buildpath %>/", filter: 'isFile'},
                    {expand: true, src: ['img/*.png'], dest: "<%= vars.buildpath %>/", filter: 'isFile'},
                    {expand: true, src: ['templates/*.html'], dest: "<%= vars.buildpath %>/", filter: 'isFile'},
                    {expand: true, src: ['js/*.conf]'], dest: "<%= vars.buildpath %>/"}
                ]
            }
        },
        //
        uglify: {
            build: {
                files: [
                    {
                        expand: true,
                        src: 'js/libs/*.js',
                        dest: '<%= vars.buildpath %>'
                    },
                    {
                        expand: true,
                        src: 'js/ss.js',
                        dest: '<%= vars.buildpath %>'
                    }
                ]
            }
        },
        //
        cssmin: {
            minify: {
                expand: true,
                cwd: 'styles/',
                src: ['*.css'],
                dest: '<%= vars.buildpath %>/styles/',
                ext: '.css'
            }
        },
        //
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: [
                    {
                        expand: true,
                        src: 'index.html',
                        dest: '<%= vars.buildpath %>/'
                    } /*, htmlmin can't handle parsing templates ATM.
                    {
                        expand: true,
                        src: 'templates/*.html',
                        dest: '<%= vars.buildpath %>/'
                    }*/
                ]
            }
        },
        //
        rsync: {
            options: {
                args: ['--verbose'],
                exclude: ['.node*', 'node_modules'],
                recursive: true
            },
            deploy: {
                options: {
                    host: '54.214.244.77',
                    src: '<%= vars.buildpath %>/',
                    dest: '/var/www',
                    syncDestIgnoreExcl: true
                }
            }
        }
    });

    // Load tasks
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-rsync');

    // default
    grunt.registerTask('default', ['clean', 'requirejs', 'copy', 'uglify', 'cssmin', 'htmlmin']);

    // deploy
    grunt.registerTask('deploy', ['rsync']);

    // all: build & deploy
    grunt.registerTask('all', ['default', 'deploy']);
}