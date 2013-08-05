module.exports = function(grunt) {
    // project config
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        requirejs: {
            compile: {
                options: {
                    appDir: "./",
                    baseUrl: "js",
                    dir: "../newblog-build",
                    mainConfigFile: "js/main.js",
                    modules: [{name: "main"}]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
}