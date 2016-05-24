(function() {
	let app = angular.module(paella.editor.APP_NAME);
	
	app.directive("loader", function() {
		return {
			restrict: "E",
			templateUrl: "templates/loader.html",
			scope:{
				
			},
			controller: ["$scope","PaellaEditor",function($scope,PaellaEditor) {
					$scope.loading = PaellaEditor.isLoading;
					PaellaEditor.subscribe($scope,function() {
						$scope.loading = PaellaEditor.isLoading;
					});
				}
			]}
		});
	
})();