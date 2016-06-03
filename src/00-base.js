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
	
	app.config(["$translateProvider",function($translateProvider) {
		function loadDictionary(localization) {
				$.ajax('localization/editor_' + localization + '.json')
					.success(function(data) {
						$translateProvider.translations(localization,data);
					});
			}

			var defaultLanguage = navigator.language.substring(0, 2);
			loadDictionary('es');
			loadDictionary('en');
			$translateProvider.preferredLanguage(defaultLanguage);
			document.head.setAttribute("lang",defaultLanguage);
	}]);
})();