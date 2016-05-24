
(function() {
	
	class UILayout {	
		constructor() {
			this.paellaVideoContainer = $('#paellaVideoContainer');
			this.sideBar = $('#sideBar');
			this.topContainer = $('#topContainer');
			this.timeLineBar = $('#timeLineBar');
			this.resizerH = $('#resizerH');
			this.resizerV = $('#resizerV');
			
			this.resizerH.setPosition = (top) => {
				var percentTop = top * 100 / $(window).height();
				var percentBottom = 100 - percentTop;
				this.topContainer.css({"height":percentTop + '%'});
				this.timeLineBar.css({"height":percentBottom + '%' });
				this.resizerH.css({"top":percentTop + '%' });
				paella.player.onresize();
			};
			
			this.resizerH.minY = 30;
			this.resizerH.maxY = 80;
			
			this.resizerH.setPosition($(window).height() * 0.6);
			this.resizerH.on("mousedown", (evt) => {
				$(document).on("mouseup", (evt) => {
					$(document).off("mouseup");
					$(document).off("mousemove");
				});
				$(document).on("mousemove", (evt) => {
					let minPercent = this.resizerH.minY;
					let minPx = $(window).height() * minPercent / 100;
					let maxPercent = this.resizerH.maxY;
					let maxPx = $(window).height() * maxPercent / 100;
					if (evt.clientY>=minPx && evt.clientY<=maxPx) {
						this.resizerH.setPosition(evt.clientY);
					}
				});
			});
			
			this.resizerV.setPosition = (left) => {
				let percentLeft = left * 100 / $(window).width();
				let percentRight = 100 - percentLeft;
				this.paellaVideoContainer.css({"width":percentLeft + '%'});
				this.sideBar.css({ "width":percentRight + '%' });
				this.resizerV.css({ "left":percentLeft + '%' });
				paella.player.onresize();
			};
			
			this.resizerV.minX = 30;
			this.resizerV.maxX = 90;
			
			this.resizerV.setPosition($(window).width() * 0.8);
			this.resizerV.on("mousedown", (evt) => {
				$(document).on("mouseup", (evt) => {
					$(document).off("mouseup");
					$(document).off("mousemove");
				});
				$(document).on("mousemove", (evt) => {
					let minPercent = this.resizerV.minX;
					let minPx = $(window).width() * minPercent / 100;
					let maxPercent = this.resizerV.maxX;
					let maxPx = $(window).width() * maxPercent / 100;
					if (evt.clientX>=minPx && evt.clientX<maxPx) {
						this.resizerV.setPosition(evt.clientX);
					}
				});
			});
		}
	}

	paella.editor.UILayout = UILayout;
	
	paella.$editor = {
		config:{},

		load:function() {
			this.uiLayout = new paella.editor.UILayout();
			return new Promise((resolve,reject) => {
				$.get("config/editor-config.json")
					.then((data) => {
						this.config = data;
						resolve();
					},
					() => {
						reject();
					});
			});
		}
	};


	var app = angular.module(paella.editor.APP_NAME);
	
	app.factory("PaellaEditor", [ "$rootScope", function($rootScope) {
		let videoData = null;
		var service = {
			_tracks:[],
			tools:[],
			currentTrack:null,
			currentTool:null,
			_isLoading:false,
			
			
			tracks:function() {
				return new Promise((resolve,reject) => {
					paella.player.videoContainer.masterVideo().getVideoData()
						.then((data) => {
							videoData = data;
							paella.editor.pluginManager.enabledPlugins.then((plugins) => {
								let promisedTrackItems = [];
								if (this._tracks.length==0) {
									plugins.trackPlugins.forEach((plugin) => {
										promisedTrackItems.push(plugin.getTrackItems()
											.then((trackItems) => {
												let depth = 0;
												trackItems.forEach((item) => {
													item.depth = depth++;
												});
												this._tracks.push({
													pluginId:plugin.getName(),
													type:plugin.getTrackType(),
													name:plugin.getTrackName(),
													color:plugin.getColor(),
													textColor:plugin.getTextColor(),
													duration:videoData.duration,
													allowResize:plugin.allowResize(),
													allowMove:plugin.allowDrag(),
													allowEditContent:plugin.allowEditContent(),
													list: trackItems,
													plugin:plugin
												});
											}));
									});
								}
								Promise.all(promisedTrackItems)
									.then(() => {
										resolve(this._tracks);
									});
							}); 
						})
				});
			},
			
			saveAll:function() {
				this.isLoading = true;
				return new Promise((resolve,reject) => {
					this.tracks().then((tracks) => {
						let promisedTasks = [];
						tracks.forEach((track) => {
							promisedTasks.push(track.plugin.onSave());
						});
						Promise.all(promisedTasks)
							.then(() => {
								$rootScope.$apply(() => {
									this.isLoading = false;
									resolve();
								});
							});
					});
				});
			},
			
			saveTrack:function(pluginId,trackData) {
				this.tracks().then((tracks) => {
						tracks.forEach(function(t) {
							if (t.pluginId == pluginId) {
								var index = -1;
								t.list.some(function(trackItem, i) {
									if (trackItem.id==trackData.id) {
										index = i;
										return true;
									}
								});
								
								if (index>=0) {
									t.list[index].s = trackData.s;
									t.list[index].e = trackData.e;
								}
								t.plugin.onTrackChanged(trackData.id, trackData.s, trackData.e);
								$rootScope.$apply();
							}
						});
						this.notify();
					});
			},
			
			saveTrackContent:function(pluginId,trackData) {
				this.tracks().then((tracks) => {
						tracks.forEach(function(t) {
							if (t.pluginId == pluginId) {
								var index = -1;
								t.list.some(function(trackItem, i) {
									if (trackItem.id==trackData.id) {
										index = i;
										return true;
									}
								});
								
								if (index>=0) {
									t.list[index].name = trackData.name;
								}
								t.plugin.onTrackContentChanged(trackData.id,trackData.name);
								$rootScope.$apply();
							}
						});
						this.notify();
					});
			},
			
			selectTrack:function(trackData) {
				if (!this.currentTrack || this.currentTrack.pluginId!=trackData.pluginId) {
					var This = this;
					this.currentTrack = trackData;
					this.currentTool = null;
					this._tracks.forEach(function(track) {
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
			},
			
			plugins:function() {
				return paella.editor.pluginManager.enabledPlugins;
			}
		};
		
		paella.editor.pluginManager.loadPlugins();
		
		service.tracks().then((tracks) => {
			// Tracks loaded
		});
		
		Object.defineProperty(service,'isLoading', {
			get: function() {
				return this._isLoading;
			},
			
			set: function(v) {
				this._isLoading = v;
				service.notify();
			}
		})
					
		return service;
	}]);
})();