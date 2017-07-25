
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
				base.cookies.set("editorResizerH",top/$(window).height());
				var percentTop = top * 100 / $(window).height();
				var percentBottom = 100 - percentTop;
				this.topContainer.css({"height":percentTop + '%'});
				this.timeLineBar.css({"height":percentBottom + '%' });
				this.resizerH.css({"top":percentTop + '%' });
				paella.player.onresize();
			};
			
			this.resizerH.minY = 30;
			this.resizerH.maxY = 80;
			
			let storedHeight = base.cookies.get("editorResizerH") || 0.6;
			this.resizerH.setPosition($(window).height() * storedHeight);
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
				base.cookies.set("editorResizerV",left/$(window).width());
				let percentLeft = left * 100 / $(window).width();
				let percentRight = 100 - percentLeft;
				this.paellaVideoContainer.css({"width":percentLeft + '%'});
				this.sideBar.css({ "width":percentRight + '%' });
				this.resizerV.css({ "left":percentLeft + '%' });
				paella.player.onresize();
			};
			
			this.resizerV.minX = 30;
			this.resizerV.maxX = 90;
			
			let storedWidth = base.cookies.get("editorResizerV") || 0.8;
			this.resizerV.setPosition($(window).width() * storedWidth);
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
				var params = {};
				params.url = "config/editor-config.json";
				base.ajax.get(params,
				(data,type,returnCode) => {				
					if (typeof(data)=='string') {
						try {
							data = JSON.parse(data);
						}
						catch (e) {
							reject();
							return;
						}
					}
					this.config = data;
					paella.player.auth.canWrite()
						.then((canWrite) => {
							if (canWrite) {
								resolve();
							}
							else {
								alert(base.dictionary.translate("You are not authorized to view this resource"));
								let url = location.href;
								let result = /(\?.*)$/.exec(url);
								if (result) {
									location.href = `index.html${result[1]}`; 
								}
							}
						});
				},
				() => {
					reject();
				});
			});
		}
	};


	var app = angular.module(paella.editor.APP_NAME);
	
	app.factory("PaellaEditor", [ "$rootScope", "$timeout", "PluginManager", function($rootScope,$timeout,PluginManager) {
		let videoData = null;
		let currentTrackItem = {
			plugin:null,
			trackItem:null
		};

		let _editorLoaded = false;
		let _loadingEditor = false;
		function ensurePaellaEditorLoaded() {
			return new Promise((resolve) => {
				if (_loadingEditor) {
					$timeout(() => {
						if (_editorLoaded) {
							resolve();
						}
					}, 100);
				}
				else {
					_loadingEditor = true;
				
					paella.player.videoContainer.masterVideo().getVideoData()
						.then((data) => {	// Video data
							videoData = data;
							PluginManager.plugins()
								.then((plugins) => {
									let promisedTrackItems = [];
									service._tracks = [];
									plugins.trackPlugins.forEach((plugin) => {
										let trackItemPromise = plugin.getTrackItems();
										if (!Array.isArray(trackItemPromise)) {
											promisedTrackItems.push(trackItemPromise
												.then((trackItems) => {
													let depth = 0;
													trackItems.forEach((item) => {
														item.depth = depth++;
													});
													service._tracks.push({
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
										}
										
									});

									return Promise.all(promisedTrackItems);
								})

								.then(() => {
									_editorLoaded = true;
									resolve(service._tracks);
								});
						});
				}
			});
		}

		let trackItemSumary = {};
		var service = {
			_tracks:[],
			tools:[],
			currentTrack:null,
			currentTool:null,
			_isLoading:false,
			
			tracks:function(reload = false) {
				if (reload) {
					service._tracks = [];
					_loadingEditor = false;
				}
				return new Promise((resolve) => {
					ensurePaellaEditorLoaded().then(() => {
						// Compare trackItemSumary
						let newTrackItems = {};
						let newTrackItemData = {
							track: null,
							trackItem: null	
						};
						let oldTrackItemCount = Object.keys(trackItemSumary).length;
						this._tracks.forEach((track) => {
							track.list.forEach((trackItem) => {
								let hash = `${track.pluginId}-${trackItem.id}`;
								newTrackItems[hash] = trackItem;
								if (!trackItemSumary[hash] && oldTrackItemCount>0 && newTrackItemData.track==null) {
									 newTrackItemData.track = track;
									 newTrackItemData.trackItem = trackItem;
								} 
							});
						});
						trackItemSumary = newTrackItems;

						resolve(this._tracks);
						if (newTrackItemData.track && newTrackItemData.trackItem) {
							this.selectTrackItem(newTrackItemData.track.plugin,newTrackItemData.trackItem);
						}
						this.reloadTools();
					});
				});
			},
			
			saveAll:function() {
				return new Promise((mainResolve) => {
					let plugins = [];
					let result = [];
					this.tracks().then((tracks) => {
						tracks.forEach((track) => {
							plugins.push(track.plugin);
						});

						plugins.reduce((promise,plugin) => {
							return promise.then((first) => {
								if (!first) {
									result.push(true);
								}
								return plugin.onSave();
							});
						},Promise.resolve(true))
							.then(() => {
								result.push(true);
								mainResolve(result);
							});
					})
				});
			},

			saveAllSimultaneously:function() {
				this.isLoading = true;
				return new Promise((resolve,reject) => {
					this.tracks().then((tracks) => {
						let promisedTasks = tracks.map((track) => {
							return new Promise((resolve) => {
								let p = track.plugin.onSave();
								if (p) {
									p.then(() => {
										resolve({ err:null, track:track });
									})
									.catch((err) => {
										let error = new Error(`Error saving track ${ track.name }: ${ err.message }`);
										console.log(error.message);
										resolve({ err:error, track:track });
									});
								}
								else {
									let err = new Error(`Unexpected error saving track ${ track.name }: onSave() function does not returns a promise.`)
									resolve({ err:err, track:track });
								}
							})
						})
						//tracks.forEach((track) => {
						//	promisedTasks.push(track.plugin.onSave());
						//});
						Promise.all(promisedTasks)
							.then(() => {
								promisedTasks.forEach((p) => {
									p.then((data) => {
										if (data.err) {
											console.log("WARNING: " + data.err.message);
										}
									})
								})
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
				var This = this;
				if (!this.currentTrack || this.currentTrack.pluginId!=trackData.pluginId) {
					if (currentTrackItem.trackData) {
						currentTrackItem.trackData.selected = false;
					}
					if (trackData && trackData.list.length==1) {
						trackData.list[0].selected = true;
					}
					this.currentTrack = trackData;
					this.currentTool = null;
					this._tracks.forEach(function(track) {
						track.selected = false;
						track.plugin.onToolSelected(trackData);
					});
					trackData.selected = true;
				}
				this.reloadTools();	// this function calls notifyTrackSelected() and notify()
			},

			reloadTools:function() {
				let This = this;
				this.tools = [];
				if (this.currentTrack) {
					this.currentTrack.plugin.getTools().forEach(function(tool) {
						var isEnabled = This.currentTrack.plugin.isToolEnabled(tool);
						var isToggle = This.currentTrack.plugin.isToggleTool(tool);
						This.tools.push({
							name:tool,
							isEnabled:isEnabled,
							isToggle:isToggle
						});
					});
				}
				this.notifyTrackSelected();
				this.notify();
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
			
			selectTrackItem:function(plugin,trackData,tracks) {
				if (currentTrackItem.plugin != plugin ||
					!currentTrackItem.trackData || currentTrackItem.trackData.id!=trackData.id)
				{
					if (currentTrackItem.trackData) {
						currentTrackItem.trackData.selected = false;
					}
					if (currentTrackItem.plugin)
					{
						currentTrackItem.plugin.onUnselect(currentTrackItem.trackData && currentTrackItem.trackData.id);
					}
					plugin.onSelect(trackData.id);
					currentTrackItem.plugin = plugin;
					currentTrackItem.trackData = trackData;
					currentTrackItem.trackData.selected = true;
					
					this.currentTrackItem = { trackData:trackData, plugin: plugin };
					this.notifyTrackSelected();
					this.notify();
				}
			},

			subscribeTrackSelected:function(scope,callback) {
				var handler = $rootScope.$on('notify-track-selected', callback);
				scope.$on('destroy', handler);
			},

			subscribe:function(scope, callback) {
				var handler = $rootScope.$on('notify-service-changed', callback);
				scope.$on('destroy', handler);
			},
			
			notifyTrackSelected:function() {
				$rootScope.$emit('notify-track-selected');
			},

			notify:function() {
				$rootScope.$emit('notify-service-changed');
			},
			
			plugins:function() {
				return PluginManager.plugins();
			}
		};
		
		ensurePaellaEditorLoaded()
			.then(() => {
				// Loaded
				$rootScope.$apply();
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