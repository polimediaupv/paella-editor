(function() {
	var app = angular.module(paella.editor.APP_NAME);
	
	app.directive("sideBar", function() {
		return {
			restrict: "E",
			templateUrl: "templates/sideBar.html",
			controller: ["$scope", "PaellaEditor", function($scope,PaellaEditor) {
				
			}]
		};
	})
})();
