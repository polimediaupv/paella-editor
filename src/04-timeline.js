(function() {
	var app = angular.module(paella.editor.APP_NAME);
	
	app.directive("timeLine", function() {
		return {
			restrict: "E",
			templateUrl: "templates/timeline.html",
			controller: ["$scope","$translate","PaellaEditor",function($scope,$translate,PaellaEditor) {
				$scope.zoom = 100;
				$scope.zoomOptions = {
					floor:100,
					ceil:5000
				};
				
				$scope.trackSelector = {
					isOpen:false
				};
				
				$scope.divisionWidth = 60;
				
				function setTimeMark(time) {
					let p = time.currentTime * $scope.zoom / time.duration;
					$('#time-mark').css({ left: p + '%'});
					let timeMarkOffset = $('#time-mark').offset();
					if (timeMarkOffset.left<0 || timeMarkOffset.left>$(window).width()) {
						$('.timeline-zoom-container')[0].scrollLeft += timeMarkOffset.left
					}
				}
				
				paella.events.bind(paella.events.timeUpdate, function(evt,time) {
					setTimeMark(time);
				});
				
				function setTime(clientX) {
					let left = $('.timeline-zoom-container')[0].scrollLeft;
					let width = $('#timeline-ruler').width();
					let offset = clientX;
					
					left = left * 100 / width;
					offset = offset * 100 / width;
					paella.player.videoContainer.seekTo(offset + left);
				}
				
				function buildTimeDivisions(divisionWidth) {
					paella.player.videoContainer.duration()
						.then(function(duration) {
							let width = $('#timeline-content').width();
							let numberOfDivisions = Math.floor(width / divisionWidth);
							let timelineRuler = $('#timeline-ruler')[0];
							timelineRuler.innerHTML = "";
							let timeIncrement = divisionWidth * duration / width;
							
							let time = 0;
							for (let i=0; i<numberOfDivisions; ++i) {
								let elem = document.createElement('span');
								elem.className = 'time-division';
								
								let hours = Math.floor(time / (60 * 60));
								let seconds = time % (60 * 60);
								let minutes = Math.floor(seconds / 60);
								seconds = Math.ceil(seconds % 60);
								elem.innerHTML = hours + ":" +
												 (minutes<10 ? "0":"") + minutes + ":" +
												 (seconds<10 ? "0":"") + seconds;
								
								$(elem).css({ width:divisionWidth + 'px' });
								timelineRuler.appendChild(elem);
								
								time += Math.round(timeIncrement);
							}
						});
				}
				
				$(window).resize(function(evt) {
					buildTimeDivisions($scope.divisionWidth);
				});
				
				$('#timeline-ruler-action').on('mousedown',(evt) => {
					setTime(evt.clientX);
					
					function cancelTracking() {
						$('#timeline-ruler-action').off("mouseup");
						$('#timeline-ruler-action').off("mousemove");
						$('#timeline-ruler-action').off("mouseout");
					}
					$('#timeline-ruler-action').on('mouseup',cancelTracking);
					$('#timeline-ruler-action').on('mouseout',cancelTracking);
					
					$('#timeline-ruler-action').on('mousemove',(evt) => {
						setTime(evt.clientX);
					});
				});
				
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
						
						$scope.saveAndClose = function() {
							PaellaEditor.saveAll()
								.then(() => {
									$scope.closeEditor(true);
								});
						};
						
						$scope.saveChanges = function() {
							PaellaEditor.saveAll();
						};
						
						$scope.closeEditor = function(noConfirm) {
							if (noConfirm || confirm($translate.instant("Are you sure you want to discard all changes and close editor?"))) {
								location.href = location.href.replace("editor.html","index.html");
							}
							
						};
						
						$scope.$watch('tracks', function() {
							//console.log("Tracks changed");
							$scope.$apply();
						});
						$scope.$watch('zoom',function() {
							$('#timeline-content').css({ width:$scope.zoom + "%" });
							buildTimeDivisions($scope.divisionWidth);
							paella.player.videoContainer.currentTime()
								.then((time) => {
									setTimeMark(time);
								});
						});
						
						PaellaEditor.subscribe($scope, function() {
							$scope.currentTrack = PaellaEditor.currentTrack;
							$scope.tools = PaellaEditor.tools;
							$scope.currentTool = PaellaEditor.currentTool;
							$scope.$apply();
						});

						$scope.$apply();
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
				$scope.plugin = $scope.data.plugin;
				
				function selectTrackItem(trackData) {
					PaellaEditor.selectTrackItem($scope.plugin,trackData);
				}

				$scope.highlightTrack = function(trackData) {
					PaellaEditor.tracks()
						.then((tracks) => {
							tracks.forEach(function(track) {
								track.list.forEach(function(trackItem) {
									trackItem.selected = false;
								});
							});
						});
					trackData.selected = true;
				};
				
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
					selectTrackItem(trackData);
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
					selectTrackItem(trackData);
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
						});
						$(document).on("mouseup",function(evt) {
							cancelMouseTracking();
						});
					}
				};
				
				$scope.rightHandlerDown = function(event,trackData) {
					selectTrackItem(trackData);
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