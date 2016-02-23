(function() {
	var app = angular.module(paella.editor.APP_NAME);
	
	app.directive("timeLine", function() {
		return {
			restrict: "E",
			templateUrl: "templates/timeline.html",
			controller: ["$scope",function($scope) {
				$scope.mainTracks = [];
				$scope.tracks = [];
				
				paella.player.videoContainer.masterVideo().getVideoData()
					.then(function(data) {
						$scope.mainTracks.push({
							pluginId:'trimming',
							name:'trimming',
							color:'#5500FF',
							textColor:'white',
							duration:data.duration,
							list:[
								{id:1,s:10,e:660}
							]
						});
						
						$scope.mainTracks.push({
							pluginId:'rest',
							name:'rest',
							color:'#AA2211',
							textColor:'black',
							duration:data.duration,
							list:[
								{id:1,s:120,e:150},{id:2,s:210,e:260}
							]
						});
						
						$scope.tracks.push({
							pluginId:'slices',
							name:'slices',
							color:'#11BB33',
							textColor:'black',
							duration:data.duration,
							list:[
								{id:1,s:20,e:90,name:"slice 1"},{id:2,s:105,e:160,name:"slice 2"}
							]
						});
						
						$scope.tracks.push({
							pluginId:'captions',
							name:'captions',
							color:'#FFBB33',
							textColor:'black',
							duration:data.duration,
							list:[
								{id:1,s:120,e:130,name:"caption 1"},{id:2,s:140,e:145,name:"caption 2"}
							]
						});
					});
			}]
		};
	});
	
	app.directive("track", function() {
		return {
			restrict: "E",
			templateUrl: "templates/track.html",
			scope: {
				data: "="
			},
			controller: ["$scope",function($scope) {
				$scope.pluginId = $scope.data.pluginId;
				$scope.name = $scope.data.name;
				$scope.color = $scope.data.color;
				$scope.textColor = $scope.data.textColor || 'black';
				$scope.tracks = $scope.data.list;
				$scope.duration = $scope.data.duration;
				
				$scope.getLeft = function(trackData) {
					return (100 * trackData.s / $scope.duration);
				};
				
				$scope.getWidth = function(trackData) {
					return (100 * (trackData.e - trackData.s) / $scope.duration);
				};
			}]
		};
	});
})();