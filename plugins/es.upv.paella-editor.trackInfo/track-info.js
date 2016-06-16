(function() {
	let app = angular.module(paella.editor.APP_NAME);

	app.directive("trackInfo",function() {
		return {
			restrict: "E",
			templateUrl:"templates/es.upv.paella-editor.trackInfo/track-info.html",
			controller:["$scope","PaellaEditor",function($scope,PaellaEditor) {
				$scope.trackName = "";
				
				PaellaEditor.subscribe($scope,() => {
					$scope.currentTrack = PaellaEditor.currentTrack;
					//if (PaellaEditor.currentTrackItem) console.log(PaellaEditor.currentTrackItem.trackData.id);
					if ($scope.currentTrack) {
						$scope.trackName = $scope.currentTrack.name;	
					}
				});
			}]
		}
	});

	class TrackInfoPlugin extends paella.editor.SideBarPlugin {
		isEnabled() {
			return Promise.resolve(true);
		}

		getName() {
			return "trackInfoSidebar";
		}

		getTabName() {
			return "Track info";
		}

		getDirectiveName() {
			return "track-info";
		}
	}

	new TrackInfoPlugin();
})();