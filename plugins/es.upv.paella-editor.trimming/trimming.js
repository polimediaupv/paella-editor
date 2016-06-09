(function() {
	class TrimmingEditorPlugin extends paella.editor.MainTrackPlugin {
		checkEnabled() {
			return new Promise((resolve,reject) => {
				var videoId = paella.initDelegate.getId();
				paella.data.read('trimming',{id:videoId},(data,status) => {
					if (data && status && data.end>0) {
						paella.player.videoContainer.setTrimming(data.start, data.end)
							.then(() => resolve(true) )
					}
					else {
						// Check for optional trim 'start' and 'end', in seconds, in location args
						var startTime =  base.parameters.get('start');
						var endTime = base.parameters.get('end');
						if (startTime && endTime) {
							paella.player.videoContainer.setTrimming(startTime, endTime)
								.then(() => resolve(true));
						}
						else {
							resolve(true);
						}
					}
				});
			});
		}

		getIndex() {
			return 100;
		}
		
		getName() {
			return "trimmingEditorPlugin";
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
						this._start = trimming.start;
						this._end = trimming.end || d;
						return resolve([{
							id:1,
							s:trimming.start,
							e:trimming.end || d
						}]);
					})
			});
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
			this._start = start;
			this._end = end;
			console.log(`From ${this._start} to ${this._end}`);
		}
		
		onSave() {
			return new Promise((resolve,reject) => {
				if (this._start!==undefined) {
					paella.data.write('trimming',
						{id:paella.initDelegate.getId()},
						{start:this._start,end:this._end},
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