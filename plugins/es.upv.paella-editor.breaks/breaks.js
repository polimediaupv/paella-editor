paella.editor.addPlugin(() => {
	
	let g_breakDuration = 0.05;	// 5% of the video duration

	return class BreaksEditorPlugin extends paella.editor.MainTrackPlugin {
		isEnabled() {
			this._tracks = [];
			return new Promise((resolve) => {
				paella.data.read('breaks',{id:paella.initDelegate.getId()},(data,status) => {
						if (data && typeof(data)=='object' && data.breaks && data.breaks.length>0) {
							this._tracks = data.breaks;
							resolve(true);
						}
						else {
							resolve(true);
						}
					});
			});
		}

		getIndex() {
			return 102;
		}
		
		getName() {
			return "breakEditorPlugin";
		}
		
		getTrackName() {
			return "Break";
		}
		
		getColor() {
			return "#0D949F";
		}
		
		getTextColor() {
			return "black";
		}
		
		getTrackItems() {
			return Promise.resolve(this._tracks);
		}

		getTools() {
			return ["Create", "Delete"];
		}

		onToolSelected(toolName) {
			if (toolName=="Delete" && this._currentId!==undefined) {
				let deleteIndex = -1;
				this._tracks.some((track,index) => {
					if (track.id==this._currentId) {
						deleteIndex = index;
					}
				});
				if (deleteIndex!=-1) {
					this._tracks.splice(deleteIndex,1);
					this.notifyTrackChanged();
				}
			}
			else if (toolName=="Create") {
				let id = 1;
				let done = false;
				while (!done) {
					if (this._tracks.some((t) => {
						if (id==t.id) {
							return true;
						}
					})) {
						++id;
					}
					else {
						done = true;
					}
				}
				let currentTime = 0;
				paella.player.videoContainer.currentTime()
					.then((time) => {
						currentTime = time;
						return paella.player.videoContainer.duration(true);
					})
					.then((duration)=> {
						let breakDuration = duration * g_breakDuration;
						let end = currentTime + breakDuration;
						end = end>duration ? duration : end;
						this._tracks.push({ id:id, s: currentTime, e: end, text:"Break" });
						this.notifyTrackChanged();
					});
			}
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
			this._tracks.some((t) => {
				if (t.id==id) {
					t.s = start;
					t.e = end;
				}
			});
		}
		
		onSelect(trackItemId) {
			this._currentId = trackItemId;
		}

		onUnselect(id) {
			this._currentId = null;
		}

		onSave() {
			return new Promise((resolve,reject) => {
				var data = {
					breaks: this._tracks
				};
				paella.data.write('breaks',{id:paella.initDelegate.getId()},data,function(response,status) {
					resolve();
				});
			});
		}
	}
});