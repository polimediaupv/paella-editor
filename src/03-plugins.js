(function() {
	var app = angular.module(paella.editor.APP_NAME);
	let plugins = [];
	let pluginsLoaded = false;

	function registeredPlugins(callback) {
		var enablePluginsByDefault = false;
		var pluginsConfig = {};
		try {
			enablePluginsByDefault = paella.$editor.config.plugins.enablePluginsByDefault;
		}
		catch(e){}
		try {
			pluginsConfig = paella.player.config.plugins.list;
		}
		catch(e){}
				
		plugins.forEach(function(plugin){			
			var name = plugin.getName();
			var config = pluginsConfig[name];
			if (!config) {
				config = { enabled: enablePluginsByDefault };
			}
			callback(plugin, config);
		});
	}

	paella.editor.registerPlugin = function(plugin) {
		plugins.push(plugin);
		plugins.sort(function(a,b) {
			return a.getIndex() - b.getIndex();
		});
	}

	app.factory("PluginManager", ["$timeout", function($timeout) {
		let loadingPlugins = false;
		let pluginsLoaded = false;

		function loadPlugins() {
			return new Promise(function(resolve) {
				function waitFunc() {
					if (pluginsLoaded) {
						resolve();
					}
					else {
						$timeout(waitFunc,100);
					}
				}

				if (!pluginsLoaded && loadingPlugins) {
					waitFunc();
				}
				else if (pluginsLoaded) {
					resolve();
				}
				else if (!loadingPlugins) {
					loadingPlugins = true;
					let pluginsPromises = [];
					registeredPlugins((registeredPlugin, config) => {
						if (config.enabled) {
							registeredPlugin.config = config;
							let promise = new Promise((checkEnabledResolve) => {
								registeredPlugin.checkEnabled().then((isEnabled) => {
									if (isEnabled) {
										addPlugin(registeredPlugin);
									}
									checkEnabledResolve();
								});
							})
						}
					});

					Promise.all(pluginsPromises)
						.then(() => {
							pluginsLoaded = true;
							resolve();
						});
				}
			});
			

		}

		function addPlugin(plugin) {
			plugin.setup();
			if (plugin.type=='editorTrackPlugin') {
				service.trackPlugins.push(plugin);
			}
			if (plugin.type=='editorSideBarPlugin') {
				console.log(`Adding plugin ${plugin.getName()}`)
				service.sideBarPlugins.push(plugin);
			}
			if (plugin.type=='editorToolbarPlugin') {
				service.toolbarPlugins.push(plugin);
			}
		}

		var service = {
			trackPlugins: [],
			sideBarPlugins: [],
			toolbarPlugins: [],

			plugins:function() {
				return new Promise((resolve) => {
					loadPlugins().then(() => {
						resolve({
							trackPlugins: this.trackPlugins,
							sideBarPlugins: this.sideBarPlugins,
							toolbarPlugins: this.toolbarPlugins
						});
					})
				});
			},

			ready:function() {
				return loadPlugins();
			},

			onTrackChanged:function(newTrack) {
				this.sideBarPlugins.forEach((plugin) => {
					plugin.onTrackSelected(newTrack);
				});

				this.toolbarPlugins.forEach((plugin) => {
					plugin.onTrackSelected(newTrack);
				});
			},

			onSave:function() {
				var promises = [];

				var handleOnSave = function(plugin) {
					promises.push(plugin.onSave());
				};

				this.trackPlugins.forEach(handleOnSave);
				this.sideBarPlugins.forEach(handleOnSave);
				this.toolbarPlugins.forEach(handleOnSave);

				return new Promise((resolve,reject) => {
					Promise.all(promises)
						.then(() => resolve())
						.catch(() => reject());
				});
			}
		};

		return service;
	}]);

	class EditorPlugin {
		constructor() {
			console.log("Registering plugin " + this.getName());
			paella.editor.registerPlugin(this);
		}
		
		checkEnabled() {
			return Promise.resolve(true);
		}
		
		setup() {
			
		}
		
		onSave() {
			return Promise.resolve();
		}

		onDiscard() {
			return Promise.resolve();
		}

		contextHelpString() {
			return "";
		}
	}
	
	paella.editor.EditorPlugin = EditorPlugin;

	class TrackPlugin extends paella.editor.EditorPlugin {
		constructor() {
			super();
			
			this.type = 'editorTrackPlugin';
		}

		getIndex() {
			return 10000;
		}

		getName() {
			return "editorTrackPlugin";
		}

		getTrackName() {
			return "My Track";
		}

		getColor() {
			return "#5500FF";
		}

		getTextColor() {
			return "#F0F0F0";
		}

		getTrackType() {
			return "secondary";
		}

		getTrackItems() {
			let exampleTracks = [{id:1,s:10,e:70},{id:2,s:110,e:340}];
			return exampleTracks;
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
			paella.events.trigger(paella.events.documentChanged);
		}

		onTrackContentChanged(id,content) {
			//base.log.debug('Track content changed: id=' + id + ', new content: ' + content);
			paella.events.trigger(paella.events.documentChanged);
		}

		onSelect(trackItemId) {
			base.log.debug('Track item selected: ' + this.getTrackName() + ", " + trackItemId);
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
		
		isToggleTool(toolName) {
			return true;
		}

		buildToolTabContent(tabContainer) {

		}

		getSettings() {
			return null;
		}
	}
	
	paella.editor.TrackPlugin = TrackPlugin;

	class MainTrackPlugin extends paella.editor.TrackPlugin {
		getTrackType() {
			return "master";
		}

		getTrackItems() {
			let exampleTracks = [{id:1,s:30,e:470}];
			return exampleTracks;
		}

		getName() {
			return "editorMainTrackPlugin";
		}
	}
	
	paella.editor.MainTrackPlugin = MainTrackPlugin;

	class SideBarPlugin extends paella.editor.EditorPlugin {
		constructor() {
			super();
			this.type = 'editorSideBarPlugin';
		}

		getIndex() {
			return 10000;
		}

		getName() {
			return "editorSideBarPlugin";
		}

		getTabName() {
			return "My Side bar Plugin";

		}
		getContent() {
			// 
		}

		onLoadFinished() {

		}
	}
	
	paella.editor.SideBarPlugin = SideBarPlugin;

	class EditorToolbarPlugin extends paella.editor.EditorPlugin {
		constructor() {
			super();
			this.type = editorToolbarPlugin;
			this.trackList = [];
		}

		getIndex() {
			return 10000;
		}

		getName() {
			return "editorToolbarPlugin";
		}

		getButtonName() {
			return "Toolbar Plugin";
		}

		getIcon() {
			return "icon-edit";
		}

		getOptions() {
			return [];
		}

		onOptionSelected(optionIndex) {
		}
	}
	
	paella.editor.EditorToolbarPlugin = EditorToolbarPlugin;

})();
