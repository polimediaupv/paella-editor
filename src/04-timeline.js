(function() {
	var app = angular.module(paella.editor.APP_NAME);
	
	app.directive("timeLine", function() {
		return {
			restrict: "E",
			templateUrl: "templates/timeline.html",
			controller: ["$scope","PaellaEditor",function($scope,PaellaEditor) {
				$scope.zoom = 100;
				$scope.zoomOptions = {
					floor:100,
					ceil:5000
				};
				
				$scope.trackSelector = {
					isOpen:false
				};
				
				
				PaellaEditor.tracks()
					.then(function(tracks) {
						$scope.tracks = tracks;
						$scope.currentTrack = PaellaEditor.currentTrack;
						$scope.selectTrack = function(t) {
							PaellaEditor.selectTrack(t);
						};
						
						$scope.tools = PaellaEditor.tools;
						$scope.currentTool = PaellaEditor.currentTool;
						$scope.selectTool = function(tool) {
							if (tool.isEnabled) {
								PaellaEditor.selectTool(tool.name);
							}
						};
						
						$scope.selectTrack = function(trackData) {
							PaellaEditor.selectTrack(trackData);
						};
						
						$scope.$watch('tracks');
						$scope.$watch('zoom',function() {
							$('#timeline-content').css({ width:$scope.zoom + "%" });
						});
						
						PaellaEditor.subscribe($scope, function() {
							$scope.currentTrack = PaellaEditor.currentTrack;
							$scope.tools = PaellaEditor.tools;
							$scope.currentTool = PaellaEditor.currentTool;
						});
					});
			}]
		};
	});
	
	app.directive("track", function() {
		function cancelMouseTracking() {
			$(document).off("mouseup");
			$(document).off("mousemove");
		}
		
		return {
			restrict: "E",
			templateUrl: "templates/track.html",
			scope: {
				data: "="
			},
			controller: ["$scope","PaellaEditor",function($scope,PaellaEditor) {
				$scope.pluginId = $scope.data.pluginId;
				$scope.name = $scope.data.name;
				$scope.color = $scope.data.color;
				$scope.textColor = $scope.data.textColor || 'black';
				$scope.tracks = $scope.data.list;
				$scope.duration = $scope.data.duration;
				$scope.allowResize = $scope.data.allowResize;
				$scope.allowMove = $scope.data.allowMove;
				
				function bringTrackToFront(trackData) {
					$('track-item').css({ 'z-index':2 });
				}
				
				$scope.getLeft = function(trackData) {
					return (100 * trackData.s / $scope.duration);
				};
				
				$scope.getWidth = function(trackData) {
					return (100 * (trackData.e - trackData.s) / $scope.duration);
				};
				
				$scope.getDepth = function(trackData) {
					return $(window).width() - Math.round(trackData.e - trackData.s);
				};
				
				$scope.getTrackItemId = function(trackData) {
					return "track-" + $scope.pluginId + "-" + trackData.id;
				};
				
				$scope.leftHandlerDown = function(event,trackData) {
					bringTrackToFront(trackData);
					if ($scope.allowResize) {
						var mouseDown = event.clientX;
						$(document).on("mousemove",function(evt) {
							var delta = evt.clientX - mouseDown;
							var elem = $('#' + $scope.getTrackItemId(trackData));
							var trackWidth = elem.width();
							var diff = delta * (trackData.e - trackData.s) / trackWidth;
							var s = trackData.s + diff;
							if (s>0 && s<trackData.e) {
								trackData.s = s;
								PaellaEditor.saveTrack($scope.pluginId,trackData);
								mouseDown = evt.clientX;
							}
							else {
								cancelMouseTracking();
							}
						});
						$(document).on("mouseup",function(evt) {
							cancelMouseTracking();
						});
					}
				};
				
				$scope.centerHandlerDown = function(event,trackData) {
					
					if ($scope.allowMove) {
						var mouseDown = event.clientX;
						$(document).on("mousemove",function(evt) {
							var delta = evt.clientX - mouseDown;
							var elem = $('#' + $scope.getTrackItemId(trackData));
							var trackWidth = elem.width();
							var diff = delta * (trackData.e - trackData.s) / trackWidth;
							var s = trackData.s + diff;
							var e = trackData.e + diff;
							if (s>0 && e<=$scope.duration) {
								trackData.s = s;
								trackData.e = e;
								PaellaEditor.saveTrack($scope.pluginId,trackData);
								mouseDown = evt.clientX;
							}
							else {
								cancelMouseTracking();
							}
							bringTrackToFront(trackData);
						});
						$(document).on("mouseup",function(evt) {
							cancelMouseTracking();
						});
					}
				};
				
				$scope.rightHandlerDown = function(event,trackData) {
					bringTrackToFront(trackData);
					if ($scope.allowResize) {
						var mouseDown = event.clientX;
						$(document).on("mousemove",function(evt) {
							var delta = evt.clientX - mouseDown;
							var elem = $('#' + $scope.getTrackItemId(trackData));
							var trackWidth = elem.width();
							var diff = delta * (trackData.e - trackData.s) / trackWidth;
							var e = trackData.e + diff;
							if (e<=$scope.duration && e>trackData.s) {
								trackData.e = e;
								PaellaEditor.saveTrack($scope.pluginId,trackData);
								mouseDown = evt.clientX;
							}
							else {
								cancelMouseTracking();
							}
						});
						$(document).on("mouseup",function(evt) {
							cancelMouseTracking();
						});						
					}
				};
			}]
		};
	});
})();