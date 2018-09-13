
Class ("paella.editor.PaellaPlayer", paella.PaellaPlayer,{
	
	initialize:function(playerId) {
		this.parent(playerId);
		paella.events.bind(paella.events.loadComplete, function() {
			paella.$editor.load()
				.then(function() {
					angular.bootstrap(document, [ paella.editor.APP_NAME ]);
					paella.keyManager.enabled = false;
				});
		});
		
		let backwBtn = $('#backward-btn')[0];
		let playBtn = $('#play-btn')[0];
		let pauseBtn = $('#pause-btn')[0];
		let forwBtn = $('#forward-btn')[0];
		
		$(pauseBtn).hide();
		$(playBtn).click(function(evt) {
			paella.player.play();
		});
		
		$(pauseBtn).click(function(evt) {
			paella.player.pause();
		});
		
		$(backwBtn).click(function(evt) {
			paella.player.videoContainer.currentTime()
				.then(function(t) {
					let newtime = t - 30;
					paella.player.videoContainer.seekToTime(newtime);
				});
		});
		
		$(forwBtn).click(function(evt) {
			paella.player.videoContainer.currentTime()
				.then(function(t) {
					let newtime = t + 30;
					paella.player.videoContainer.seekToTime(newtime);
				});
		});
		
		paella.events.bind(paella.events.play, function() {
			$(pauseBtn).show();
			$(playBtn).hide();
		});
		
		paella.events.bind(paella.events.pause, function() {
			$(pauseBtn).hide();
			$(playBtn).show();
		});
	},

	// This function is rewrited here to prevent load the skin style sheet
	loadPaellaPlayer:function() {
		var This = this;
		this.loader = new paella.LoaderContainer('paellaPlayer_loader');
		$('body')[0].appendChild(this.loader.domElement);
		paella.editor.registerPluginClasses();
		paella.events.trigger(paella.events.loadStarted);






		paella.initDelegate.loadDictionary()
			.then(function() {
				return paella.initDelegate.loadConfig();
			})

			.then(function(config) {
				This.accessControl = paella.initDelegate.initParams.accessControl;
				This.videoLoader = paella.initDelegate.initParams.videoLoader;
				This.onLoadConfig(config);
			});






		/*

		paella.editor.registerPluginClasses();
		paella.events.trigger(paella.events.loadStarted);

		paella.initDelegate.loadDictionary()
			.then(function() {
				return paella.initDelegate.loadConfig();
			})

			.then(function(config) {
				This.accessControl = paella.initDelegate.initParams.accessControl;
				This.onLoadConfig(config);
			});
			*/
	},

	showPlaybackBar:function() {
		// Use custom editor playback controls
	},
	
	play:function() {
		// Use custom editor playback controls
		this.videoContainer.play();
	}
});

// Overwrite PaellaPlayer class
var PaellaPlayer = paella.editor.PaellaPlayer;
