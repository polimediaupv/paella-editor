

(function() {
	
	class TestPlugin extends paella.editor.TrackPlugin {
		
		isEnabled() {
			return Promise.resolve(false);
		}
		
		getIndex() {
			return 10000;
		}

		getName() {
			return "testTrackPlugin";
		}

		getTrackName() {
			return "Track test";
		}

		getColor() {
			return "#5500FF";
		}

		getTextColor() {
			return "#F0F0F0";
		}

		getTrackItems() {
			return new Promise((resolve,reject) => {
				resolve([{id:1,s:10,e:70,name:"Track item 1"},{id:2,s:110,e:340,name:"second track item"}]);
			});
		}

		allowResize() {
			return true;
		}

		allowDrag() {
			return true;
		}

		allowEditContent() {
			return true;
		}

		setTimeOnSelect() {
			return true;
		}

		onTrackChanged(id,start,end) {
			//console.log("Track changed: s=" + start + ", e=" + end);
		}

		onTrackContentChanged(id,content) {
			//base.log.debug('Track content changed: id=' + id + ', new content: ' + content);	
		}

		onSelect(trackItemId) {
			this._currentId = trackItemId;
		}

		onUnselect(id) {
			this._currentId = null;
		}

		onDblClick(trackData) {
		}

		getTools() {
			return ["Tool 1", "Tool 2"];
		}

		onToolSelected(toolName) {
			console.log('Tool selected: ' + toolName);
		}

		isToolEnabled(toolName) {
			return true;
		}
		
		isToggleTool(toolName) {
			return toolName=="Tool 1";
		}

		buildToolTabContent(tabContainer) {

		}

		getSettings() {
			return null;
		}
	}

	new TestPlugin();

	class TestPlugin2 extends paella.editor.MainTrackPlugin {
		
		isEnabled() {
			return Promise.resolve(false);
		}
		
		getIndex() {
			return 9000;
		}

		getName() {
			return "testTrackPlugin2";
		}

		getTrackName() {
			return "Track test 2";
		}

		getColor() {
			return "#AA2211";
		}

		getTextColor() {
			return "black";
		}

		getTrackItems() {
			return new Promise((resolve,reject) => {
				resolve([{id:1,s:10,e:550}]);
			});
		}

		allowResize() {
			return true;
		}

		allowDrag() {
			return false;
		}

		allowEditContent() {
			return false;
		}

		onTrackChanged(id,start,end) {
			//console.log("Track changed: s=" + start + ", e=" + end);
		}

		onTrackContentChanged(id,content) {
			//console.log("Track content changed: " + content);
		}
		
		onSave() {
			return new Promise((resolve,reject) => {
				//setTimeout(function() {
					resolve();
				//},5000);
			});
		}

		onSelect(trackItemId) {
			console.log('Track item selected: ' + this.getTrackName() + ", " + trackItemId);
		}

		onUnselect(id) {
			console.log('Track list unselected: ' + this.getTrackName() + ", " + id);
		}

		onDblClick(trackData) {
		}

		getTools() {
			return [];
		}

		onToolSelected(toolName) {
			//base.log.debug('Tool selected: ' + toolName);
			paella.events.trigger(paella.events.documentChanged);
		}

		isToolEnabled(toolName) {
			return true;
		}

		getSettings() {
			return null;
		}
	}

	new TestPlugin2();
	
	var app = angular.module(paella.editor.APP_NAME);
	
	app.directive("sidebar2",function() {
		return {
			restrict: "E",
			templateUrl:"templates/es.upv.paella-editor.test/content.html",
			controller:["$scope","PaellaEditor",function($scope,PaellaEditor) {
				$scope.title = "Hello sidebar 2";
				$scope.trackName = "";
				
				PaellaEditor.subscribe($scope,() => {
					$scope.currentTrack = PaellaEditor.currentTrack;
					if ($scope.currentTrack) {
						$scope.trackName = $scope.currentTrack.name;	
					}
				});
			}]
		}
	});

	class TestSideBar2 extends paella.editor.SideBarPlugin {
		isEnabled() {
			return Promise.resolve(false);
		}

		getName() {
			return "My side bar plugin 2";
		}

		getTabName() {
			return "Sidebar 2";
		}

		getContent() {
		}

		getDirectiveName() {
			return "sidebar2";
		}
	}

	new TestSideBar2();
	
	app.directive("testSidebar",function() {
		return {
			restrict: "E",
			templateUrl:"templates/es.upv.paella-editor.test/plugin2.html",
			controller:["$scope","PaellaEditor", function($scope,PaellaEditor) {
				$scope.message = "I'm another plugin.";
			}]
		}
	});
	
	class SidebarPlugin2 extends paella.editor.SideBarPlugin {
		isEnabled() {
			return Promise.resolve(false);
		}
		
		getName() {
			return "other sidebar plugin";
		}
		
		getTabName() {
			return "Han Solo";
		}
		
		getDirectiveName() {
			return "test-sidebar";
		}
	}
	
	new SidebarPlugin2();
	
})();

