Class ("paella.editor.PaellaPlayer", paella.PaellaPlayer,{
	
	initialize:function(playerId) {
		this.parent(playerId);
		paella.events.bind(paella.events.loadComplete, function() {
			paella.$editor.load();
			angular.bootstrap(document, [ paella.editor.APP_NAME ]);
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
