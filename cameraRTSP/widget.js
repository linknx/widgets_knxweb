function CCameraRTSP(conf) {
	this.isResizable=true;
  this.init(conf);
  this.refreshHTML();
}

CCameraRTSP.type='cameraRTSP';
UIController.registerWidget(CCameraRTSP);
CCameraRTSP.prototype = new CWidget();

// Refresh HTML from config
CCameraRTSP.prototype.refreshHTML = function() {
  $("embed", this.div).attr("width", this.div.css('width'));
  $("embed", this.div).attr("height", this.div.css('height'));
  $("object", this.div).attr("width", this.div.css('width'));
  $("object", this.div).attr("height", this.div.css('height'));

	if (this.conf.getAttribute("url")!="") {
		$("embed", this.div).attr("target", this.conf.getAttribute("url"));
    $("object", this.div).attr("data", this.conf.getAttribute("url"));
    //$("param[name='movie']", this.div).value(this.conf.getAttribute("url"));
    $("param[name='movie']", this.div).attr("value", this.conf.getAttribute("url"));
		$("embed", this.div).show();
	} else $("embed", this.div).hide();
}