(function() {
	class BreaksEditorPlugin extends paella.editor.MainTrackPlugin {
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
			return 101;
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
			if (toolName=="Delete") {

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
				paella.player.videoContainer.currentTime()
					.then((time) => {
						this._tracks.push({ id:id, s: time, e: time + 60});
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
			return false;
		}

		setTimeOnSelect() {
			return true;
		}
		
		onTrackChanged(id,start,end) {
		}
		
		onSave() {
		}
	}

	new BreaksEditorPlugin();
})();