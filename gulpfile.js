const   gulp = require('gulp'),
        sourcemaps = require('gulp-sourcemaps'),
        traceur = require('gulp-traceur'),
        concat = require('gulp-concat'),
        connect = require('gulp-connect'),
		replace = require('gulp-replace'),
		merge = require('gulp-merge-json');

var config = {
	outDir:'build/'
};

gulp.task("webserver", function() {
	connect.server();
});

gulp.task("compile", function() {
	gulp.src(["src/*.js","plugins/*/*.js"])
		//.pipe(sourcemaps.init())
		.pipe(traceur())
		.pipe(concat("paella_editor.js"))
		//.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(`${config.outDir}player/javascript/`));
});

gulp.task("compileDebug", function() {
	gulp.src(["src/*.js","plugins/*/*.js","src-debug/*.js"])
		//.pipe(sourcemaps.init())
		.pipe(traceur())
		.pipe(concat("paella_editor.js"))
		//.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(`${config.outDir}player/javascript/`));
});

gulp.task("styles", function() {
	gulp.src(['style/*.css','plugins/**/*.css'])
		.pipe(concat('editor.css'))
		.pipe(gulp.dest(`${config.outDir}player/resources/editor/css/`));
});

gulp.task("copy", function() {
	gulp.src('player/**')
		.pipe(gulp.dest(`${config.outDir}player`));
	
	gulp.src('editor.html')
		.pipe(gulp.dest(`${config.outDir}player`));
		
	gulp.src('templates/**')
		.pipe(gulp.dest(`${config.outDir}player/templates`));
	
	gulp.src('config/editor-config.json')
		.pipe(gulp.dest(`${config.outDir}player/config`));
	
	gulp.src('demos/**')
		.pipe(gulp.dest(`${config.outDir}repository`));
		
	gulp.src('plugins/*/*.html')
		.pipe(gulp.dest(`${config.outDir}player/templates/`));
	
	var depsjs = [
		'bower_components/angular/angular.min.js',
		'bower_components/angular/angular.js',
		'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
		'bower_components/angular-route/angular-route.min.js',
		'bower_components/angular-resource/angular-resource.min.js',
		'bower_components/angular-translate/angular-translate.min.js',
		'bower_components/bootstrap/dist/js/bootstrap.min.js',
		'bower_components/angularjs-slider/dist/rzslider.js',
		'bower_components/traceur/traceur.min.js'
	];
	gulp.src(depsjs)
		.pipe(gulp.dest(`${config.outDir}player/javascript/`));
	
	gulp.src(['bower_components/bootstrap/dist/css/bootstrap.min.css',
			  'bower_components/angularjs-slider/dist/rzslider.min.css'])
		.pipe(gulp.dest(`${config.outDir}player/resources/editor/css`));
	
	gulp.src('bower_components/bootstrap/dist/fonts/*')
		.pipe(gulp.dest(`${config.outDir}player/resources/editor/fonts`));
});

gulp.task('dictionary', function() {
	function addDictionary(lang) {
		gulp.src([`localization/*${lang}.json`,`plugins/**/localization/*${lang}.json`])
			.pipe(merge(`editor_${lang}.json`))
			.pipe(gulp.dest(`${config.outDir}player/localization/`));
	}
	
	addDictionary('en');
	addDictionary('es');
});


gulp.task("build", ["compile","styles","dictionary","copy"]);
gulp.task("buildDebug", ["compileDebug","styles","dictionary","copy"])

gulp.task("watch", function() {
	gulp.watch([
		'editor.html',
		'templates/**',
		'demos/**',
		'config/editor-config.json',
		'style/*.css',
		'plugins/**/*.css',
		'src/*.js',
		'src-debug/*.js',
		'plugins/**/*.js',
		'plugins/**/*.html'
	],["buildDebug"]);
});

gulp.task("default",["build"]);
gulp.task("serve",["buildDebug","webserver","watch"]);
