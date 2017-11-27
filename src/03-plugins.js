(function() {
	var app = angular.module(paella.editor.APP_NAME);
	let plugins = [];
	let pluginsLoaded = false;

	let g_pluginClasses = [];

	function registeredPlugins(callback) {
		var enablePluginsByDefault = false;
		var pluginsConfig = {};
		try {
			enablePluginsByDefault = paella.$editor.config.plugins.enablePluginsByDefault;
		}
		catch(e){}
		try {
			pluginsConfig = paella.$editor.config.plugins.list;
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
	}

	// This function is called from paella.editor.PaellaPlayer.loadPaellaPlayer.
	// The function creates the editor plugin instances
	paella.editor.registerPluginClasses = function() {
		g_pluginClasses.forEach((PluginClass) => {
			let instance = new PluginClass();
			console.log("Registering plugin " + instance.getName());
			paella.editor.registerPlugin(instance);
		});
	}

	// This function is used to add a plugin class, that will be instantiated from
	// the paella.editor.registerPluginClasses() function
	paella.editor.addPlugin = function(pluginClass) {
		g_pluginClasses.push(pluginClass());
	};

	app.factory("PluginManager", ["$timeout","$rootScope",function($timeout,$rootScope) {
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
							let promise = new Promise((isEnabledResolve) => {
								if (registeredPlugin.isEnabled) {
									pluginsPromises.push()
									registeredPlugin.isEnabled().then((isEnabled) => {
										if (isEnabled) {
											addPlugin(registeredPlugin);
										}
										isEnabledResolve();
									});
								}
								else {
									isEnabledResolve();
								}
							});
							pluginsPromises.push(promise);
						}
					});

					Promise.all(pluginsPromises)
						.then(() => {
							function sortFunc(a,b) { return a.getIndex() - b.getIndex(); }
							service.trackPlugins.sort(sortFunc);
							service.sideBarPlugins.sort(sortFunc);
							service.toolbarPlugins.sort(sortFunc);
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

			subscribeTrackReload:function(scope,callback) {
				var handler = $rootScope.$on('notify-track-reload',callback);
				scope.$on('destroy',handler);
			},

			notifyTrackChanged:function(plugin) {
				$rootScope.$emit('notify-track-reload');
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
		}
		
		isEnabled() {
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

		notifyTrackChanged() {
			let injector = angular.element(document).injector();
			let PluginManager = injector.get('PluginManager');
			PluginManager.notifyTrackChanged(this);
		}

		getIndex() {
			return 10000;
		}

		getName() {
			return "editorTrackPlugin";
		}

		getSideBarPluginName() {
			return "";
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

		isVisible(PaellaEditor,PluginManager) {
			return Promise.resolve(true);
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
