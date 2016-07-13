
// Redefine paella.AccessControl to allow write in debug mode
Class ("paella.AccessControl", {
	canRead:function() {
		return paella_DeferredResolved(true);
	},

	canWrite:function() {
		return paella_DeferredResolved(base.parameters.get("write")=="true");
	},

	userData:function() {
		return paella_DeferredResolved({
			username: 'anonymous',
			name: 'Anonymous',
			avatar: paella.utils.folders.resources() + '/images/default_avatar.png',
			isAnonymous: true
		});
	},

	getAuthenticationUrl:function(callbackParams) {
		var authCallback = this._authParams.authCallbackName && window[this._authParams.authCallbackName];
		if (!authCallback && paella.player.config.auth) {
			authCallback = paella.player.config.auth.authCallbackName && window[paella.player.config.auth.authCallbackName];
		}

		if (typeof(authCallback)=="function") {
			return authCallback(callbackParams);
		}
		return "";
	}
});