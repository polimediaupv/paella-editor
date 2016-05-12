(function() {
	class PluginManager {
		constructor() {
			this.trackPlugins = [];
			this.sideBarPlugins = [];
			this.toolbarPlugins = [];
			
			this._plugins = [];
			this._pluginsLoaded = false;
		}
		
		registerPlugin(plugin) {
			this._plugins.push(plugin);
			this._plugins.sort(function(a,b) {
				return a.getIndex() - b.getIndex();
			});
		}
		
		loadPlugins() {
			return new Promise((loadResolve,loadReject) => {
				let pluginsPromises = [];
				this.foreach((plugin,config) => {
					if (config.enabled) {
						plugin.config = config;
						let promise = new Promise((resolve, reject) => {
							plugin.checkEnabled()
								.then((isEnabled) => {
									if (isEnabled) {
										this.addPlugin(plugin);
									}
									resolve();
								});
						});
						pluginsPromises.push(promise);
					}
				});
				Promise.all(pluginsPromises)
					.then(() => {
						this._pluginsLoaded = true;
						loadResolve();
					});
			});
		}
		
		foreach(callback) {
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
					
			this._plugins.forEach(function(plugin){			
				var name = plugin.getName();
				var config = pluginsConfig[name];
				if (!config) {
					config = { enabled: enablePluginsByDefault };
				}
				callback(plugin, config);
			});
		}
		
		get plugins() {
			return this._plugins;
		}
		
		get enabledPlugins() {
			return new Promise((resolve,reject) => {
				function checkAndResolve() {
					if (this._pluginsLoaded) {
						resolve({
							trackPlugins:this.trackPlugins,
							sideBarPlugins:this.sideBarPlugins,
							toolbarPlugins:this.toolbarPlugins
						});
					}
					else {
						setTimeout(checkAndResolve(), 100);
					}
				}
				checkAndResolve();
			});
		}
		
		addPlugin(plugin) {
			plugin.setup();
			if (plugin.type=='editorTrackPlugin') {
				this.trackPlugins.push(plugin);
			}
			if (plugin.type=='editorSideBarPlugin') {
				console.log(`Adding plugin ${plugin.getName()}`)
				this.sideBarPlugins.push(plugin);
			}
			if (plugin.type=='editorToolbarPlugin') {
				this.toolbarPlugins.push(plugin);
			}
		}
		
		onTrackChanged(newTrack) {
			// Notify tab plugins
			this.sideBarPlugins.forEach(function(plugin) {
				plugin.onTrackSelected(newTrack);
			});

			// Notify toolbar plugins
			this.toolbarPlugins.forEach(function(plugin) {
				plugin.onTrackSelected(newTrack);
			});
		}

		onSave() {
			var promises = [];
			
			var handleOnSave = function(plugin) {
				promises.push(plugin.onSave());
			};
			
			this.trackPlugins.forEach(handleOnSave);
			this.sideBarPlugins.forEach(handleOnSave);
			this.toolbarPlugins.forEach(handleOnSave);
			
			return new Promise((resolve,reject) => {
				Promise.all(promises)
					.then(() => {
						resolve();
					})
					.catch(() => {
						reject();
					});
			});
		}

		onDiscard() {
			
		}
	}
	
	paella.editor.pluginManager = new PluginManager();
	
	class EditorPlugin {
		constructor() {
			console.log("Registering plugin " + this.getName());
			paella.editor.pluginManager.registerPlugin(this);
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
			base.log.debug('Track list selected: ' + this.getTrackName());
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
