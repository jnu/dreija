module.exports = function(grunt) {
    // project config
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        //
        clean: {
            options: {
                force: true
            },
            build: ['../newblog-build']
        },
        //
        requirejs: {
            compile: {
                options: {
                    baseUrl: "js",
                    mainConfigFile: "js/main.js",
                    out: "../newblog-build/js/main.js",
                    name: "main"
                }
            }
        },
        //
        copy: {
            main: {
                files: [
                    {expand: true, src: ['styles/*.png'], dest: "../newblog-build/", filter: 'isFile'},
                    {expand: true, src: ['img/*.png'], dest: "../newblog-build/", filter: 'isFile'},
                    {expand: true, src: ['templates/*.html'], dest: "../newblog-build/", filter: 'isFile'},
                    {expand: true, src: ['js/*.conf]'], dest: "../newblog-build/"}
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
                        dest: '../newblog-build'
                    },
                    {
                        expand: true,
                        src: 'js/ss.js',
                        dest: '../newblog-build'
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
                dest: '../newblog-build/styles/',
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
                files: {
                    '../newblog-build/index.html' : 'index.html'
                }
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
                    src: '../newblog-build/',
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