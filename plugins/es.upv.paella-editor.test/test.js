

Class ("es.upv.paellaEditor.Test", paella.editor.TrackPlugin,{
	
	checkEnabled:function(onSuccess) {
		onSuccess(true);
	},
	
	getIndex:function() {
		return 10000;
	},

	getName:function() {
		return "testTrackPlugin";
	},

	getTrackName:function() {
		return "Track test";
	},

	getColor:function() {
		return "#5500FF";
	},

	getTextColor:function() {
		return "#F0F0F0";
	},

	getTrackItems:function() {
		var exampleTracks = [{id:1,s:10,e:70},{id:2,s:110,e:340}];
		return exampleTracks;
	},

	allowResize:function() {
		return true;
	},

	allowDrag:function() {
		return true;
	},

	allowEditContent:function() {
		return true;
	},

	onTrackChanged:function(id,start,end) {
		//base.log.debug('Track changed: id=' + id + ", start: " + start + ", end:" + end);
		console.log("Track changed: s=" + start + ", e=" + end);
	},

	onTrackContentChanged:function(id,content) {
		//base.log.debug('Track content changed: id=' + id + ', new content: ' + content);
		
	},

	onSelect:function(trackItemId) {
		base.log.debug('Track list selected: ' + this.getTrackName());
	},

	onUnselect:function() {
		base.log.debug('Track list unselected: ' + this.getTrackName());
	},

	onDblClick:function(trackData) {
	},

	getTools:function() {
		return ["Tool 1", "Tool 2"];
	},

	onToolSelected:function(toolName) {
		console.log('Tool selected: ' + toolName);
	},

	isToolEnabled:function(toolName) {
		return true;
	},
	
	isToggleTool:function(toolName) {
		return toolName=="Tool 1";
	},

	buildToolTabContent:function(tabContainer) {

	},

	getSettings:function() {
		return null;
	}
});

es.upv.paellaEditor.test = new es.upv.paellaEditor.Test();

Class ("es.upv.paellaEditor.Test2", paella.editor.MainTrackPlugin,{
	
	checkEnabled:function(onSuccess) {
		onSuccess(true);
	},
	
	getIndex:function() {
		return 9000;
	},

	getName:function() {
		return "testTrackPlugin2";
	},

	getTrackName:function() {
		return "Track test 2";
	},

	getColor:function() {
		return "#AA2211";
	},

	getTextColor:function() {
		return "black";
	},

	getTrackItems:function() {
		var exampleTracks = [{id:1,s:10,e:550}];
		return exampleTracks;
	},

	allowResize:function() {
		return true;
	},

	allowDrag:function() {
		return false;
	},

	allowEditContent:function() {
		return false;
	},

	onTrackChanged:function(id,start,end) {
		//base.log.debug('Track changed: id=' + id + ", start: " + start + ", end:" + end);
		console.log("Track changed: s=" + start + ", e=" + end);
	},

	onTrackContentChanged:function(id,content) {
		//base.log.debug('Track content changed: id=' + id + ', new content: ' + content);
		
	},

	onSelect:function(trackItemId) {
		base.log.debug('Track list selected: ' + this.getTrackName());
	},

	onUnselect:function() {
		base.log.debug('Track list unselected: ' + this.getTrackName());
	},

	onDblClick:function(trackData) {
	},

	getTools:function() {
		return [];
	},

	onToolSelected:function(toolName) {
		//base.log.debug('Tool selected: ' + toolName);
		paella.events.trigger(paella.events.documentChanged);
	},

	isToolEnabled:function(toolName) {
		return true;
	},

	buildToolTabContent:function(tabContainer) {

	},

	getSettings:function() {
		return null;
	}
});

es.upv.paellaEditor.test2 = new es.upv.paellaEditor.Test2();