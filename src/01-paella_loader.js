
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
