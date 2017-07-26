

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
	

	class MilestoneTrackPlugin extends paella.editor.MainTrackPlugin {
		
		isEnabled() {
			return Promise.resolve(false);
		}
		
		getIndex() {
			return 10000;
		}

		getName() {
			return "milestonePlugin";
		}

		getTrackName() {
			return "Milestone test";
		}

		getColor() {
			return "#AA2244";
		}

		getTextColor() {
			return "black";
		}

		getTrackItems() {
			return new Promise((resolve,reject) => {
				resolve([{id:1,s:10,e:10,minDuration:0},{id:2,s:30,e:30,minDuration:0}]);
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

	new MilestoneTrackPlugin();



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

		isVisible(PaellaEditor,PluginManager) {
			return Promise.resolve(true);
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

		isVisible(PaellaEditor,PluginManager) {
			return Promise.resolve(PaellaEditor.currentTrack && PaellaEditor.currentTrack.pluginId=='trimmingEditorPluginV2');
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

		onSave() {
			console.log("On save sidebar");
			return Promise.resolve(true);
		}
	}
	
	new SidebarPlugin2();
	





	let VideoStatus = {
        NOT_SENT: 0,
        SENT: 1,
        PROCESSING: 2,
        PROCESSED: 3
    };

    class MultiTrackPlugin extends paella.editor.TrackPlugin {
        isEnabled() {
            return new Promise((resolve) => {
				this._trackStatus = null;
                this._allTracks = [
                    { id:1, s:20, e:60, video:"v1", name:"Video derivado 1", status:VideoStatus.NOT_SENT },
                    { id:2, s:90, e:130, video:"v1" },
                    { id:3, s:140, e:150, video:"v2", name:"Video 3", status:VideoStatus.PROCESSING },
                    { id:4, s:170, e:200, video:"v2" }
                ];
                this._allTracks.sort((a,b) => {
                    return a.s-b.s;
                });
                this._currentVideo = null;
                this._tracks = [];
                this.setVideo(null);
                this._currentId = 0;
                resolve(true);
            });
        }

        setVideo(id) {
            id = id || (this._allTracks.length && this._allTracks[0].video);
			this._tracks = [];
			this._trackStatus = null;
            this._allTracks.forEach((t) => {
                if (t.video == id) {
					this._tracks.push(t);
					if (this._trackStatus===null) {
						this._trackStatus = t.status;
					}
                }      
			});
            this.notifyTrackChanged();
        }

        getIndex() { return 9000; }
        getName() { return "derivativeVideosPlugin"; }
        getTrackName() { return "Derivative Videos"; }
        getColor() { return "#3385FA"; }
        getTextColor() { return "#F0F0F0"; }
        getTrackItems() { return Promise.resolve(this._tracks); }
		
		allowResize() {
			switch (this._trackStatus) {
			case VideoStatus.NOT_SENT:
			case VideoStatus.SENT:
				return true;
			case VideoStatus.PROCESSING:
			case VideoStatus.PROCESSED:
				return false;
			}
		}

        allowDrag() {
			switch (this._trackStatus) {
			case VideoStatus.NOT_SENT:
			case VideoStatus.SENT:
				return true;
			case VideoStatus.PROCESSING:
			case VideoStatus.PROCESSED:
				return false;
			}
		}

        allowEditContent() {
			switch (this._trackStatus) {
			case VideoStatus.NOT_SENT:
			case VideoStatus.SENT:
				return true;
			case VideoStatus.PROCESSING:
			case VideoStatus.PROCESSED:
				return false;
			}
		}

        setTimeOnSelect() { return false; }
        onTrackChanged(id,start,end) {}
        onTrackContentChanged(id,content) {}

        onSelect(trackItemId) { this._currentId = trackItemId; }
        onUnselect() { this._currentId = null; }

        getTools() { return ["Create","Delete"]; }

        onToolSelected(toolName) {
            switch (toolName) {
            case 'Create':
                break;
            case 'Delete':
                break;
            }
            this.notifyTrackChanged();
        }

        isToolEnabled(toolName) {
            switch (this._trackStatus) {
			case VideoStatus.NOT_SENT:
			case VideoStatus.SENT:
				return true;
			case VideoStatus.PROCESSING:
			case VideoStatus.PROCESSED:
				return false;
			}
        }

        isToggleTool(toolName) {
            return false;
        }

        onSave() {
            return new Promise((resolve) => {
                // TODO: guardar
                resolve(true);
            });
        }
    }

    paella.editor.multiTrackPlugin = new MultiTrackPlugin();
})();

