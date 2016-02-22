
Class ("paella.editor.UILayout", {
	paellaVideoContainer:null,
	sideBar:null,
	topContainer:null,
	timeLineBar:null,
	resizerH:null,
	resizerV:null,
	
	initialize:function() {
		var This = this;
		this.paellaVideoContainer = $('#paellaVideoContainer');
		this.sideBar = $('#sideBar');
		this.topContainer = $('#topContainer');
		this.timeLineBar = $('#timeLineBar');
		this.resizerH = $('#resizerH');
		this.resizerV = $('#resizerV');
		
		this.resizerH.setPosition = function(top) {
			var percentTop = top * 100 / $(window).height();
			var percentBottom = 100 - percentTop;
			This.topContainer.css({"height":percentTop + '%'});
			This.timeLineBar.css({"height":percentBottom + '%' });
			This.resizerH.css({"top":percentTop + '%' });
			paella.player.onresize();
		};
		
		
		
		this.resizerH.minY = 30;
		this.resizerH.maxY = 80;
		
		this.resizerH.setPosition($(window).height() * 0.6);
		this.resizerH.on("mousedown",function(evt) {
			$(document).on("mouseup",function(evt) {
				$(document).off("mouseup");
				$(document).off("mousemove");
			});
			$(document).on("mousemove",function(evt) {
				var minPercent = This.resizerH.minY;
				var minPx = $(window).height() * minPercent / 100;
				var maxPercent = This.resizerH.maxY;
				var maxPx = $(window).height() * maxPercent / 100;
				if (evt.clientY>=minPx && evt.clientY<=maxPx) {
					This.resizerH.setPosition(evt.clientY);
				}
			});
		});
		
		this.resizerV.setPosition = function(left) {
			var percentLeft = left * 100 / $(window).width();
			var percentRight = 100 - percentLeft;
			This.paellaVideoContainer.css({"width":percentLeft + '%'});
			This.sideBar.css({ "width":percentRight + '%' });
			This.resizerV.css({ "left":percentLeft + '%' });
			paella.player.onresize();
		};
		
		this.resizerV.minX = 30;
		this.resizerV.maxX = 90;
		
		this.resizerV.setPosition($(window).width() * 0.8);
		this.resizerV.on("mousedown",function(evt) {
			$(document).on("mouseup",function(evt) {
				$(document).off("mouseup");
				$(document).off("mousemove");
			});
			$(document).on("mousemove",function(evt) {
				var minPercent = This.resizerV.minX;
				var minPx = $(window).width() * minPercent / 100;
				var maxPercent = This.resizerV.maxX;
				var maxPx = $(window).width() * maxPercent / 100;
				if (evt.clientX>=minPx && evt.clientX<maxPx) {
					This.resizerV.setPosition(evt.clientX);
				}
			});
		});
	}
});

paella.$editor = {
	load:function() {
		this.uiLayout = new paella.editor.UILayout();
	}
};

(function() {
	var app = angular.module(paella.editor.APP_NAME);
	
	app.service("PaellaEditor", [ function() {
		this.tools = [];
		
		
	}]);
})();