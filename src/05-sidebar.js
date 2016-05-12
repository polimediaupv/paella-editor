(function() {
	var app = angular.module(paella.editor.APP_NAME);
	
	app.directive("sideBar", function() {
		return {
			restrict: "E",
			templateUrl: "templates/sideBar.html",
			controller: ["$scope", "PaellaEditor", function($scope,PaellaEditor) {
				$scope.plugins = [];
				PaellaEditor.plugins()
					.then(function(plugins) {
						$scope.plugins = plugins.sideBarPlugins;
					});
			}]
		};
	})
})();
