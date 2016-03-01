
Class ("paella.editor.UILayout", {
	paellaVideoContainer:null,
	sideBar:null,
	topContainer:null,
	timeLineBar:null,
	resizerH:null,
	resizerV:null,
	
	initialize:function() {
		var This = this;
		this.paellaVideoContainer = $('#paellaVideoContainer');
		this.sideBar = $('#sideBar');
		this.topContainer = $('#topContainer');
		this.timeLineBar = $('#timeLineBar');
		this.resizerH = $('#resizerH');
		this.resizerV = $('#resizerV');
		
		this.resizerH.setPosition = function(top) {
			var percentTop = top * 100 / $(window).height();
			var percentBottom = 100 - percentTop;
			This.topContainer.css({"height":percentTop + '%'});
			This.timeLineBar.css({"height":percentBottom + '%' });
			This.resizerH.css({"top":percentTop + '%' });
			paella.player.onresize();
		};
		
		
		
		this.resizerH.minY = 30;
		this.resizerH.maxY = 80;
		
		this.resizerH.setPosition($(window).height() * 0.6);
		this.resizerH.on("mousedown",function(evt) {
			$(document).on("mouseup",function(evt) {
				$(document).off("mouseup");
				$(document).off("mousemove");
			});
			$(document).on("mousemove",function(evt) {
				var minPercent = This.resizerH.minY;
				var minPx = $(window).height() * minPercent / 100;
				var maxPercent = This.resizerH.maxY;
				var maxPx = $(window).height() * maxPercent / 100;
				if (evt.clientY>=minPx && evt.clientY<=maxPx) {
					This.resizerH.setPosition(evt.clientY);
				}
			});
		});
		
		this.resizerV.setPosition = function(left) {
			var percentLeft = left * 100 / $(window).width();
			var percentRight = 100 - percentLeft;
			This.paellaVideoContainer.css({"width":percentLeft + '%'});
			This.sideBar.css({ "width":percentRight + '%' });
			This.resizerV.css({ "left":percentLeft + '%' });
			paella.player.onresize();
		};
		
		this.resizerV.minX = 30;
		this.resizerV.maxX = 90;
		
		this.resizerV.setPosition($(window).width() * 0.8);
		this.resizerV.on("mousedown",function(evt) {
			$(document).on("mouseup",function(evt) {
				$(document).off("mouseup");
				$(document).off("mousemove");
			});
			$(document).on("mousemove",function(evt) {
				var minPercent = This.resizerV.minX;
				var minPx = $(window).width() * minPercent / 100;
				var maxPercent = This.resizerV.maxX;
				var maxPx = $(window).width() * maxPercent / 100;
				if (evt.clientX>=minPx && evt.clientX<maxPx) {
					This.resizerV.setPosition(evt.clientX);
				}
			});
		});
	}
});

paella.$editor = {
	config:{},

	load:function() {
		var This = this;
		var defer = $.Deferred();
		this.uiLayout = new paella.editor.UILayout();
		
		$.get("config/editor-config.json")
			.then(function(data) {
				This.config = data;
				defer.resolve();
			});
		return defer;
	}
};

(function() {
	var app = angular.module(paella.editor.APP_NAME);
	
	app.factory("PaellaEditor", [ "$rootScope", function($rootScope) {
		var service = {
			tracks:[],
			tools:[],
			currentTrack:null,
			currentTool:null,
			
			saveTrack:function(pluginId,trackData) {
				this.tracks.forEach(function(t) {
					if (t.pluginId == pluginId) {
						var index = -1;
						t.list.some(function(trackItem, i) {
							if (trackItem.id==trackData.id) {
								index = i;
								return true;
							}
						});
						
						if (index>=0) {
							t.list[index] = trackData;
						}
						t.plugin.onTrackChanged(trackData.id, trackData.s, trackData.e);
						$rootScope.$apply();
					}
				});
				this.notify();
			},
			
			saveTrackContent:function(pluginId,trackData) {
				
			},
			
			selectTrack:function(trackData) {
				if (!this.currentTrack || this.currentTrack.pluginId!=trackData.pluginId) {
					var This = this;
					this.currentTrack = trackData;
					this.currentTool = null;
					this.tracks.forEach(function(track) {
						track.plugin.onToolSelected(trackData);
					});
					this.tools = [];
					trackData.plugin.getTools().forEach(function(tool) {
						var isEnabled = This.currentTrack.plugin.isToolEnabled(tool);
						var isToggle = This.currentTrack.plugin.isToggleTool(tool);
						This.tools.push({
							name:tool,
							isEnabled:isEnabled,
							isToggle:isToggle
						});
					});
					this.notify();
				}
			},
			
			selectTool:function(toolName) {
				if (this.currentTrack.plugin.getTools().some(function(t) {
						return t==toolName;
					})
				) {
					this.currentTool = toolName;
					this.currentTrack.plugin.onToolSelected(toolName);
					this.notify();
				}
			},
			
			subscribe:function(scope, callback) {
				var handler = $rootScope.$on('notify-service-changed', callback);
				scope.$on('destroy', handler);
			},
			
			notify:function() {
				$rootScope.$emit('notify-service-changed');
			}
		};
		
		paella.editor.pluginManager.loadPlugins();
				
		paella.player.videoContainer.masterVideo().getVideoData()
			.then(function(data) {
				paella.editor.pluginManager.trackPlugins.forEach(function(plugin) {
					service.tracks.push({
						pluginId:plugin.getName(),
						type:plugin.getTrackType(),
						name:plugin.getTrackName(),
						color:plugin.getColor(),
						textColor:plugin.getTextColor(),
						duration:data.duration,
						allowResize:plugin.allowResize(),
						allowMove:plugin.allowDrag(),
						allowEditContent:plugin.allowEditContent(),
						list: plugin.getTrackItems(),
						plugin:plugin
					});
				});
				
				/*
				service.tracks.push({
					pluginId:'trimming',
					type:'main',
					name:'trimming',
					color:'#5500FF',
					textColor:'white',
					duration:data.duration,
					allowResize:true,
					allowMove:true,
					list:[
						{id:1,s:10,e:660}
					]
				});
				
				service.tracks.push({
					pluginId:'rest',
					type:'main',
					name:'rest',
					color:'#AA2211',
					textColor:'black',
					duration:data.duration,
					allowResize:true,
					allowMove:true,
					list:[
						{id:1,s:120,e:150},{id:2,s:210,e:260}
					]
				});
				
				service.tracks.push({
					pluginId:'slices',
					name:'slices',
					color:'#11BB33',
					textColor:'black',
					duration:data.duration,
					allowResize:true,
					allowMove:true,
					list:[
						{id:1,s:20,e:90,name:"slice 1"},{id:2,s:105,e:160,name:"slice 2"}
					]
				});
				
				service.tracks.push({
					pluginId:'captions',
					name:'captions',
					color:'#FFBB33',
					textColor:'black',
					duration:data.duration,
					allowResize:true,
					allowMove:true,
					list:[
						{id:1,s:120,e:130,name:"caption 1"},{id:2,s:140,e:145,name:"caption 2"}
					]
				});
				*/
			});
			
			
		return service;
	}]);
})();