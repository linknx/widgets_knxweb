function CAudioalert(conf) {
	this.isResizable=true;
	this.init(conf);
	var soundfile = getImageUrl(this.conf.getAttribute("sound-file"));
	this.audioElement = document.createElement('audio');
	if (soundfile != '' && soundfile != undefined)
		this.audioElement.setAttribute('src', soundfile);
	this.oldvalue = false;
	this.active=false;
	this.refreshHTML();
}

CAudioalert.type='audioalert';
UIController.registerWidget(CAudioalert);
CAudioalert.prototype = new CWidget();

// Refresh HTML from config
CAudioalert.prototype.refreshHTML = function() {
	if (_editMode)
		$(".buttonContent", this.div).css('background-image', 'url(' + getImageUrl("32x32_sonPlus.png") + ')');
}

CAudioalert.prototype.updateObject = function(obj,value) {
	if (obj==this.conf.getAttribute("feedback-object"))
	{
		var val = value;
		if (parseFloat(val)) val = parseFloat(value);
		var feedback_val = this.conf.getAttribute("feedback-value");
		if (parseFloat(feedback_val)) feedback_val = parseFloat(this.conf.getAttribute("feedback-value"));
		switch (this.conf.getAttribute("feedback-compare")) {
			case 'eq':
				this.active=(val==feedback_val);
				break;
			case 'neq':
				this.active=(val!=feedback_val);
				break;
			case 'gt':
				this.active=(val>feedback_val);
				break;
			case 'lt':
				this.active=(val<feedback_val);
				break;
			case 'gte':
				this.active=(val>=feedback_val);
				break;
			case 'lte':
				this.active=(val<=feedback_val);
				break;
			default:
				this.active=false;
		}
		if (this.active)
		{
			if (this.oldvalue == false)
				this.audioElement.play()

		}
		else if (this.oldvalue == true)
		{
			this.audioElement.pause()
		}
		this.oldvalue = this.active
	}
};
