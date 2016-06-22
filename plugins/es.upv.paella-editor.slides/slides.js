(function() {
	class SlidesEditorPlugin extends paella.editor.MainTrackPlugin {
		isEnabled() {
			let frames = paella.player.videoLoader.frameList;
			return Promise.resolve(Object.keys(frames).length);
		}

		getIndex() {
			return 101;
		}
		
		getName() {
			return "slidesEditorPlugin";
		}
		
		getTrackName() {
			return "Slides";
		}
		
		getColor() {
			return "#EEEEEE";
		}
		
		getTextColor() {
			return "black";
		}
		
		getTrackItems() {
			return new Promise((resolve,reject) => {
				paella.player.videoContainer.duration()
					.then((duration) => {
						let frames = paella.player.videoLoader.frameList;
						let result = [];
						let last = null;
						for (let index in frames) {
							if (last) {
								last.e = frames[index].time;
							}
							last = {
								id: index,
								s: frames[index].time,
								e: duration,
								img: frames[index].thumb || frames[index].url
							}
							result.push(last);
						}
						resolve(result);
					});
			});
		}
		
		allowResize() {
			return false;
		}
		
		allowDrag() {
			return false;
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

	new SlidesEditorPlugin();
})();