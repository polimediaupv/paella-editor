

(function() {
	
	class TestPlugin extends paella.editor.TrackPlugin {
		
		checkEnabled() {
			return Promise.resolve(true);
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

		onTrackChanged(id,start,end) {
			//base.log.debug('Track changed: id=' + id + ", start: " + start + ", end:" + end);
			console.log("Track changed: s=" + start + ", e=" + end);
		}

		onTrackContentChanged(id,content) {
			//base.log.debug('Track content changed: id=' + id + ', new content: ' + content);	
		}

		onSelect(trackItemId) {
			base.log.debug('Track list selected: ' + this.getTrackName());
		}

		onUnselect() {
			base.log.debug('Track list unselected: ' + this.getTrackName());
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
		
		checkEnabled() {
			return Promise.resolve(true);
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
			//base.log.debug('Track changed: id=' + id + ", start: " + start + ", end:" + end);
			console.log("Track changed: s=" + start + ", e=" + end);
		}

		onTrackContentChanged(id,content) {
			//base.log.debug('Track content changed: id=' + id + ', new content: ' + content);
		}

		onSelect(trackItemId) {
			base.log.debug('Track list selected: ' + this.getTrackName());
		}

		onUnselect() {
			base.log.debug('Track list unselected: ' + this.getTrackName());
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

		buildToolTabContent(tabContainer) {

		}

		getSettings() {
			return null;
		}
	}

	new TestPlugin2();
	
	var app = angular.module(paella.editor.APP_NAME);
	
	app.directive("sidebar1",function() {
		return {
			restrict: "E",
			templateUrl:"templates/es.upv.paella-editor.test/content.html",
			controller:["$scope",function($scope) {
				$scope.title = "Hello sidebar 1";
			}]
		}
	});

	class TestSideBar1 extends paella.editor.SideBarPlugin {
		checkEnabled() {
			return new Promise((resolve, reject) => {
				resolve(true);
			});
		}
		
		getName() {
			return "My side bar plugin";
		}

		getTabName() {
			return "Sidebar 1";
		}
		
		getContent() {
		}
		
		getDirectiveName() {
			return "sidebar1";
		}
	}

	new TestSideBar1();
	
	app.directive("sidebar2",function() {
		return {
			restrict: "E",
			templateUrl:"templates/es.upv.paella-editor.test/content.html",
			controller:["$scope","PaellaEditor",function($scope,PaellaEditor) {
				$scope.title = "Hello sidebar 2";
				$scope.trackName = "";
				
				PaellaEditor.subscribe($scope,() => {
					$scope.currentTrack = PaellaEditor.currentTrack;
					console.log($scope.currentTrack);
					$scope.trackName = $scope.currentTrack.name;
				});
			}]
		}
	});

	class TestSideBar2 extends paella.editor.SideBarPlugin {
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
})();

