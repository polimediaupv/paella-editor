var paella = paella || {};

paella.editor = {};

paella.editor.APP_NAME = "paella-editor";

(function(){
	var app = angular.module(paella.editor.APP_NAME,[
		'pascalprecht.translate',
		"ngRoute",
		'rzModule',
		"ui.bootstrap",
		"ngResource"]);
		
})();