const   gulp = require('gulp'),
        sourcemaps = require('gulp-sourcemaps'),
        traceur = require('gulp-traceur'),
        concat = require('gulp-concat'),
        connect = require('gulp-connect'),
		replace = require('gulp-replace'),
		merge = require('gulp-merge-json');

var config = {
	outDir:'build/',
	editorDir:'player/',
	buildTest:true,
	paellaDir:'bower_components/paella/player',
	editorFiles: [
		"src/*.js",
		"plugins/*/*.js"
	],
	deps: [
		'bower_components/angular/angular.min.js',
		'bower_components/angular/angular.js',
		'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
		'bower_components/angular-route/angular-route.min.js',
		'bower_components/angular-resource/angular-resource.min.js',
		'bower_components/angular-translate/angular-translate.min.js',
		'bower_components/bootstrap/dist/js/bootstrap.min.js',
		'bower_components/angularjs-slider/dist/rzslider.js',
		'bower_components/traceur/traceur.min.js'
	]
};

gulp.task("configTest", function() {
	config.outDir = 'build/';
	config.editorDir = 'player/';
	config.buildTest = true;
	config.editorFiles.push("src-debug/*.js");
});

gulp.task("configAll", function() {
	config.outDir = 'build/';
	config.editorDir = 'player/';
	config.buildTest = false;
});

gulp.task("configEditorOnly", function() {
	config.outDir = 'build/editor-files/'
	config.editorDir = '';
	config.buildTest = false;
	config.paellaDir = "";
});

gulp.task("webserver", function() {
	return connect.server();
});

gulp.task("compile", function() {
	return gulp.src(config.editorFiles)
		.pipe(traceur())
		.pipe(concat("paella_editor.js"))
		.pipe(gulp.dest(`${ config.outDir }${ config.editorDir }javascript/`));
});

gulp.task("styles", function() {
	return gulp.src(['style/*.css','plugins/**/*.css'])
		.pipe(concat('editor.css'))
		.pipe(gulp.dest(`${ config.outDir }${ config.editorDir }/resources/editor/css/`));
});

function $p(task) {
	return new Promise((resolve) => {
		task.on('end',resolve);
	});
}

gulp.task("copy", function() {
	let promises = [
		$p(gulp.src('editor.html')
			.pipe(gulp.dest(`${config.outDir}${ config.editorDir }`))),
	
		$p(gulp.src('templates/**')
			.pipe(gulp.dest(`${config.outDir}${ config.editorDir }templates`))),
	
		$p(gulp.src('config/editor-config.json')
			.pipe(gulp.dest(`${config.outDir}${ config.editorDir }config`))),
	
		
		$p(gulp.src('plugins/*/*.html')
			.pipe(gulp.dest(`${config.outDir}${ config.editorDir }templates/`))),

		$p(gulp.src(config.deps)
			.pipe(gulp.dest(`${config.outDir}${ config.editorDir }javascript/`))),

		$p(gulp.src(['bower_components/bootstrap/dist/css/bootstrap.min.css',
				'bower_components/angularjs-slider/dist/rzslider.min.css'])
			.pipe(gulp.dest(`${config.outDir}${ config.editorDir }resources/editor/css`))),
		
		$p(gulp.src('bower_components/bootstrap/dist/fonts/*')
			.pipe(gulp.dest(`${config.outDir}${ config.editorDir }resources/editor/fonts`)))
	];

	if (config.paellaDir) {
		promises.push($p(gulp.src(`${ config.paellaDir }/**`)
			.pipe(gulp.dest(`${ config.outDir }${ config.editorDir }`))));
	}

	if (config.buildTest) {
		promises.push($p(gulp.src('demos/**')
			.pipe(gulp.dest(`${config.outDir}repository`))));
	}

	return Promise.all(promises);
});

gulp.task('dictionary', function() {
	function addDictionary(lang) {
		return gulp.src([`localization/*${lang}.json`,`plugins/**/localization/*${lang}.json`])
			.pipe(merge(`editor_${lang}.json`))
			.pipe(gulp.dest(`${config.outDir}${ config.editorDir }localization/`));
	}
	
	return Promise.all([
		$p(addDictionary('en')),
		$p(addDictionary('es'))
	])
});

gulp.task("buildFiles", ["compile","styles","dictionary","copy"]);

gulp.task("watch", function() {
	return gulp.watch([
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

gulp.task("build",["configAll","buildFiles"]);
gulp.task("serve",["configTest","buildFiles","webserver","watch"]);
gulp.task("editorFiles",["configEditorOnly","buildFiles"]);

gulp.task("default",["build"]);
