(function() {
	class TrimmingEditorPlugin extends paella.editor.MainTrackPlugin {
		isEnabled() {
			this._track = {};
			return new Promise((resolve,reject) => {
				var videoId = paella.initDelegate.getId();
				paella.data.read('trimming',{id:videoId},(data,status) => {
					let start = 0;
					let end = 0;
					let enabled = false;
					if (data && status && data.end>0) {
						start = data.start;
						end = data.end;
						enabled = data.end>0;
					}
					else {
						// Check for optional trim 'start' and 'end', in seconds, in location args
						start = base.parameters.get('start');
						end = base.parameters.get('end');
						enabled = end>0
					}

					if (enabled) {
						this._track.id = 1;
						this._track.s = start;
						this._track.e = end;
						paella.player.videoContainer.setTrimming(data.start, data.end)
							.then(() => resolve(true));
					}
					else {
						resolve(true);
					}
				});
			});
		}

		getIndex() {
			return 100;
		}
		
		getName() {
			return "trimmingEditorPluginV2";
		}
		
		getTrackName() {
			return "Trimming";
		}
		
		getColor() {
			return "#AA2211";
		}
		
		getTextColor() {
			return "black";
		}
		
		getTrackItems() {
			return new Promise((resolve,reject) => {
				let trimming = {}
				paella.player.videoContainer.trimming()
					.then((t) => {
						trimming = t;
						return paella.player.videoContainer.duration();
					})
					
					.then((d) => {
						this._track.id = 1;
						this._track.s = trimming.start;
						this._track.e = trimming.end || d;
						return resolve([this._track]);
					})
			});
		}

		getTools() {
			return ["Mark Start", "Mark End"];
		}

		onToolSelected(toolName) {
			if (toolName=="Mark Start") {
				paella.player.videoContainer.currentTime(true)
					.then((c) => {
						if (this._track.e>c) {
							this._track.s = c;
						}
					});
				this.notifyTrackChanged();
			}
			else if (toolName=="Mark End") {
				paella.player.videoContainer.currentTime(true)
					.then((c) => {
						if (this._track.s<c) {
							this._track.e = c;
						}
					});
				this.notifyTrackChanged();
			}
		}
		
		allowResize() {
			return true;
		}
		
		allowDrag() {
			return false;
		}

		allowEditContent() {
			return false;
		}
		
		onTrackChanged(id,start,end) {
			this._track.s = start;
			this._track.e = end;
		}
		
		onSave() {
			return new Promise((resolve,reject) => {
				if (this._track.s!==undefined) {
					paella.data.write('trimming',
						{id:paella.initDelegate.getId()},
						{start:this._track.s,end:this._track.e},
						function(data,status) {
							resolve();
						});
				}
				else {
					resolve();
				}			
			});
		}
	}

	new TrimmingEditorPlugin();
})();