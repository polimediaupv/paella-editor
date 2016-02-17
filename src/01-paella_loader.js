Class ("paella.editor.PaellaPlayer", paella.PaellaPlayer,{
	
	initialize:function(playerId) {
		this.parent(playerId);

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
