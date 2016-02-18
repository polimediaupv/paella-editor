var fs = require('fs');

module.exports = function(grunt) {
	var initConfig = {
		pkg: grunt.file.readJSON('package.json'),

		clean: {
			build: ["build"]
		},
		revision: {
			options: {
				property: 'meta.revision',
				ref: 'HEAD',
				short: true
			}
		},
		copy: {
			paella: {
				files: [
					{ expand: true, src: ['player/**'], dest:'build/' },
					{ expand: true, src: ['editor.html'], dest: 'build/player' },
 					{ expand: true, cwd:'config/', src: ['**'], dest: 'build/player/config' },
					{ expand: true, cwd:'demos', src:[ '**' ], dest: 'build/repository'},
					{ expand: true, cwd:'bower_components/angular/', src:[ 'angular.min.js' ], dest:'build/player/javascript' },
					{ expand: true, cwd:'bower_components/angular-resource/', src:[ 'angular-resource.min.js' ], dest:'build/player/javascript' },
					{ expand: true, cwd:'bower_components/angular-translate/', src:[ 'angular-translate.min.js' ], dest:'build/player/javascript' },
					{ expand: true, cwd:'bower_components/bootstrap/dist/js', src:[ 'bootstrap.min.js' ], dest:'build/player/javascript' },
					{ expand: true, cwd:'bower_components/bootstrap/dist/css', src:[ 'bootstrap.min.css' ], dest:'build/player/resources/editor/css' },
					{ expand: true, cwd:'bower_components/bootstrap/dist/fonts', src:[ '**' ], dest:'build/player/resources/editor/fonts' }
				]
			}
		},
		concat: {
			options: {
				separator: '\n',
				process: function(src, filepath) {
					return '/*** File: ' + filepath + ' ***/\n' + src;
				}
			},
			'dist.js': {
				options: {
					footer: 'paella.version = "<%= pkg.version %> - build: <%= meta.revision %>";\n'
				},
				src: [
					'src/*.js',
					'plugins/*/*.js'
				],
				dest: 'build/player/javascript/paella_editor.js'
			},
			'dist.css': {
				src: [
					'style/*.css',
					'plugins/*/*.css'
				],
				dest: 'build/player/resources/editor/css/editor.css'
			}
		},
		uglify: {
			options: {
				banner: '/*\n' +
						'	Paella HTML5 Multistream Player v.<%= pkg.version %>\n' +
						'	Copyright (C) 2013  Universitat Politècnica de València' +
						'\n'+
						'	File generated at <%= grunt.template.today("dd-mm-yyyy") %>\n' +
						'*/\n',
				mangle: false
			},
			dist: {
				files: {
					'build/player/javascript/paella_editor.js': ['build/player/javascript/paella_editor.js']
				}
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			dist: [
				'src/*.js'
			]
		},
		
		'merge-json': {
			'i18n': {
				files: {
					'build/player/localization/editor_en.json': [ 'localization/*en.json', 'plugins/*/localization/*en.json' ],
					'build/player/localization/editor_es.json': [ 'localization/*es.json', 'plugins/*/localization/*es.json' ]
				}
			}
		},

		watch: {
			 release: {
				 files: [
				 	'editor.html',
				 	'src/*.js',
				 	'plugins/**',
					'style/*.less'
				 ],
				 tasks: ['build.release']
			},
			debug: {
				 files: [
				 	'editor.html',
				 	'src/*.js',
				 	'plugins/**',
					'style/*.less'
				 ],
				 tasks: ['build.debug']
			}
		},
		express: {
			paella: {
		      options: {
			      port:8001,
			      bases: 'build'
		      }
		  }
		},
		jsonlint: {
			paella: {
				src: [	'package.json',
						'config/*.json',
						'plugins/*/localization/*.json',
						'localization/*.json'
				]
			}
		}
	};

	initConfig.concat.less = { 'files':{} };
	initConfig.less = {
		production: {
			options:{ paths: [ "css" ] },
			files:{}
		}
	};
	
	grunt.initConfig(initConfig);

	grunt.loadNpmTasks('grunt-git-revision');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-express');
	grunt.loadNpmTasks('grunt-jsonlint');
	grunt.loadNpmTasks('grunt-merge-json');


	grunt.registerTask('default', ['dist']);
	grunt.registerTask('checksyntax', ['concat:less','less:production','jshint', 'jsonlint']);

	grunt.registerTask('build.common', ['revision', 'checksyntax', 'copy:paella', 'concat:dist.js', 'concat:dist.css', 'merge-json:i18n']);
	grunt.registerTask('build.release', ['build.common', 'uglify:dist', 'cssmin:dist']);
	grunt.registerTask('build.debug', ['build.common']);

	grunt.registerTask('server.release', ['build.release', 'express', 'watch:release']);
	grunt.registerTask('server.debug', ['build.debug', 'express', 'watch:debug']);
	
};
