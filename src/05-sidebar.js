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
				$scope.selectedPlugin = $scope.plugins[0];
				$scope.$apply();
			});
			
	}
	
	app.directive("sideBar", ['$compile','PaellaEditor','PluginManager',function($compile,PaellaEditor,PluginManager) {
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

				function buildView() {
					PaellaEditor.plugins()
						.then(function(plugins) {
							$scope.plugins = [];
							let promises = [];
							
							plugins.sideBarPlugins.forEach((plugin) => {
								$scope.plugins.push(plugin);
								plugin.isVisible(PaellaEditor,PluginManager).then((visible) => {
									plugin.__visible__ = visible;
									promises.push(Promise.resolve());
								});
							});

							return Promise.all(promises);
						})

						.then(function(promises) {
							if (!$scope.selectedPlugin || !$scope.selectedPlugin.__visible__) {
								$scope.plugins.some((plugin) => {
									if (plugin.__visible__) {
										insertTabContents(plugin);
										$scope.selectedPlugin = plugin;
										return true;
									}
								});
							}
							else {
								$scope.selectTab($scope.selectedPlugin);
							}
							$scope.$apply();
						});
				}

				$scope.isSelected = function(plugin) {
					return plugin == $scope.selectedPlugin;			
				};
				
				$scope.selectTab = function(plugin) {
					insertTabContents(plugin);
					$scope.selectedPlugin = plugin;
				};

				paella.events.bind("editor:selectTab",function(evt,data) {
					if (data.pluginName) {
						PaellaEditor.plugins()
							.then((plugins) => {
								let plg = null;
								plugins.sideBarPlugins.some((p) => {
									if (p.getName()==data.pluginName) {
										plg = p;
										return true;
									}
								});
								return Promise.resolve(plg);
							})

							.then((plugin) => {
								$scope.$apply(() => {
									$scope.selectTab(plugin);
								});
							});
					}
				});
				
				PaellaEditor.subscribeTrackSelected($scope, () => {
					buildView();
				});
				
				buildView();
				createTabContainer();
			}//,
			//controller: ["$scope", "PaellaEditor", SidebarController]
		};
	}])
})();
