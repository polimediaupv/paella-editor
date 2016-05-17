(function() {
	var app = angular.module(paella.editor.APP_NAME);
	
	function SidebarController($scope, PaellaEditor) {
		$scope.plugins = [];
		$scope.tabs = [];
		$scope.selectedPlugin = null;

		$scope.isSelected = function(plugin) {
			return plugin == $scope.selectedPlugin;			
		};
		
		$scope.selectTab = function(plugin) {
			$scope.selectedPlugin = plugin;
		}
		
		$scope.insertDirective = function(plugin,node) {
			
		}

		PaellaEditor.plugins()
			.then(function(plugins) {
				$scope.plugins = plugins.sideBarPlugins;
				console.log($scope.plugins);
				$scope.selectedPlugin = $scope.plugins[0];
				$scope.$apply();
			});
			
	}
	
	app.directive("sideBar", ['$compile','PaellaEditor',function($compile,PaellaEditor) {
		return {
			restrict: "E",
			templateUrl: "templates/sideBar.html",
			link: function(scope, element, attrs) {
				let $scope = scope;
				$scope.plugins = [];
				$scope.tabs = [];
				$scope.selectedPlugin = null;
				
				let tabContainer = null;
				
				function createTabContainer() {
					if (tabContainer) {
						tabContainer.html('');
					}
					tabContainer = $compile('<div></div>')(scope);
					element.append(tabContainer);
				}
				
				function insertTabContents(plugin) {
					createTabContainer();
					let directiveName = plugin.getDirectiveName();
					let tabContent = $compile(`<${directiveName}></${directiveName}>`)(scope);
					tabContainer.append(tabContent);
				}

				$scope.isSelected = function(plugin) {
					return plugin == $scope.selectedPlugin;			
				};
				
				$scope.selectTab = function(plugin) {
					$scope.selectedPlugin = plugin;
					insertTabContents(plugin);
				}
				
				PaellaEditor.plugins()
					.then(function(plugins) {
						$scope.plugins = plugins.sideBarPlugins;
						if ($scope.plugins.length) {
							insertTabContents($scope.plugins[0]);
						}
						$scope.selectedPlugin = $scope.plugins[0];
						$scope.$apply();
					});
					
				createTabContainer();
			}//,
			//controller: ["$scope", "PaellaEditor", SidebarController]
		};
	}])
})();
