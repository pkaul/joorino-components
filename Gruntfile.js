module.exports = function(grunt) {

    grunt.initConfig({

        // ----- Environment
        // read in some metadata from project descriptor
        project: grunt.file.readJSON('package.json'),

        // define some directories to be used during build
        dir: {

            // location where TypeScript source files are located
            "source_ts": "src/ts",

            // base location of all target files
            "target": "target",

            // location to place (compiled) javascript files
            "target_js": 'target/js',

            // location to place documentation, etc.
            "target_report": "target/report",

            // location to place distribution
            "target_dist": "target/dist"
        },

        // ---- clean workspace
        clean: {
            target: {
                src: "<%= dir.target %>"
            }
        },

        // ----- TypeScript compilation
        //  See https://npmjs.org/package/grunt-ts
        ts: {

            // Compiles main code. Add declaration file files
            compile: {
                src: ['<%= dir.source_ts %>/**/*.ts'],
                outDir: '<%= dir.target_js %>',
                options: {
                    target: 'es3',
                    declaration: true,
                    removeComments: false,
                    module: 'amd',
                    sourceMap: false
                }
            }
        },

        // ------- Unit tests with code coverage
        //  See https://github.com/gruntjs/grunt-contrib-jasmine
        jasmine: {
            tests: {
                // the code to be tested
                src: ['<%= dir.target_js %>/main/**/*.js',"<%= dir.target_js %>/es6-promises/index.js"],
                options: {
                    // the tests
                    specs: '<%= dir.target_js %>/test/**/*Spec.js',
                    keepRunner: true, // useful for debugging

                    // -- additional JUnit compliant test reports that Jenkins is able to analyze
                    junit: {
                        path: "<%= dir.target_report %>/surefire-reports",
                        consolidate: false
                    },


                    // -- Optional: code coverage reports
                    //   See https://github.com/maenu/grunt-template-jasmine-istanbul
//                    template: require('grunt-template-jasmine-istanbul'),
//                    templateOptions: {
//
//                        // options for jasmine-istanbul
//                        coverage: '<%= dir.target_report %>/coverage/coverage.json',
//                        report: [
//                            {
//                                type: 'html',
//                                options: { dir: '<%= dir.target_report %>/coverage/html' }
//                            },
//                            {
//                                // generate a cobertura-style report
//                                type: 'cobertura',
//                                options: { dir: '<%= dir.target_report %>/coverage/cobertura' }
//                            },
//                            {
//                                type: 'text-summary'
//                            }
//                        ],

                    // Run jasmine in AMD/RequireJS mode (because all compiled files are AMD!)
                    //   https://github.com/cloudchen/grunt-template-jasmine-requirejs
                    template: require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        requireConfig: {
                            // as described in https://github.com/maenu/grunt-template-jasmine-istanbul:
                            // use instrumented classes rather than the originals
                            //baseUrl: '.grunt/grunt-contrib-jasmine/<%= target_test_js %>',
                            // HACK: Fix nasty 'wrong uri' problem on windows. The location of the reporter.js
                            //  contains backslashes that can't be resolved by requirejs
                            map: {
                                '*': {
                                    '.gruntgrunt-contrib-jasminegrunt-template-jasmine-istanbul\reporter.js':
                                        '.grunt/grunt-contrib-jasmine/grunt-template-jasmine-istanbul/reporter.js'
                                }
                            }
                        }
//                        }
                    }
                }
            }
        },


        // ------------- dependency resolution

        // fetches compile dependencies using TypeScript's package manager "tsd"
        tsd: {
            "compile-dependencies": {
                options: {
                    // execute a command
                    command: 'reinstall',
                    config: './tsd.json'
                }
            }
        },

        // fetches runtime dependencies using "bower"
        bower: {
            "runtime-dependencies": {
                options: {
                    targetDir: '<%= dir.target_js %>',
                    layout: 'byType',
                    install: true,
                    verbose: false,
                    cleanTargetDir: false,
                    cleanBowerDir: false,
                    bowerOptions: {}
                }
            }
        },

        // Fixing invalid <reference path=""> references that are expanded  by compiler or grunt-ts in *.d.ts
        // https://www.npmjs.org/package/grunt-text-replace
        replace: {
            fix_references: {
                src: ['<%= dir.target_js %>/**/*.d.ts'],
                overwrite: true,
                replacements: [{
                    from: '../../src/ts/',
                    to: ''
                }]
            }
        },

        // build a module archive containing all *.js and *.d.ts files as well as bower.json
        compress: {
            distribution: {
                options: {
                    archive: '<%= dir.target_dist %>/<%= project.name %>.zip'
                },
                files: [
                    // add all compiled files
                    {expand: true, cwd: '<%= dir.target_js %>/main', src: ['**'], dest: '.'},
                    // ... and the dependency information
                    {src: "bower.json"}
                ]
            }
        }

    });


    // ----- Setup tasks

    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-tsd');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-text-replace');

    // Default task(s).
    grunt.registerTask('default', ['bower:runtime-dependencies','tsd:compile-dependencies','ts:compile','replace:fix_references','jasmine:tests','compress:distribution']);
};