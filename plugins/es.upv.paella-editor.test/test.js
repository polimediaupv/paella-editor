

Class ("es.upv.paellaEditor.TestPlugin", {
	initialize: function() {
		console.log(base.dictionary.translate("test"));
	}
});

es.upv.paellaEditor.testPlugin = new es.upv.paellaEditor.TestPlugin();
