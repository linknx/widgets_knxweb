var _thermostatmode;

function CThermostatmode(conf) {
	this.isResizable=true;
	this.init(conf);

	this.mode="";

	this.mode_dict = {};
	this.mode_names = ["frost", "night", "standby", "comfort", "auto"];
	for (var i = 0; i < this.mode_names.length; i++)
	{
		var picattrib = this.conf.getAttribute("picture-"+this.mode_names[i]);
		if ( picattrib != "" && picattrib != null)
			this.mode_dict[this.mode_names[i]] = getImageUrl(picattrib);
	}

	$(this.div).click(function() {
		if (!_editMode)
		{
			var idx = this.owner.mode_names.indexOf(this.owner.mode);
			this.owner.mode
			if (++idx == Object.keys(this.owner.mode_dict).length)
				idx = 0;
			this.owner.mode = this.owner.mode_names[idx];
			var modeobject = this.owner.conf.getAttribute("mode-object");
			if (modeobject)
			{
				EIBCommunicator.eibWrite(modeobject, this.owner.mode);
			}
		}
	});
	this.refreshHTML();
}

CThermostatmode.type='thermostatmode';
UIController.registerWidget(CThermostatmode);
CThermostatmode.prototype = new CWidget();

// Refresh HTML from config
CThermostatmode.prototype.refreshHTML = function() {

	var c = $(".buttonContent", this.div);

	if ( this.mode != "" )
		c.css('background-image', 'url(' + (this.mode_dict[this.mode]) + ')');

	if (_editMode)
	{
		c.css({'border-width': '1px', 'border-style': 'dotted', 'border-color':'blue'});
		c.text(this.conf.getAttribute("text"));
	}
	else
		c.css({'border-width': '0px'});
}

// Called by eibcommunicator when a feedback object value has changed
CThermostatmode.prototype.updateObject = function(obj,value) {
	if (obj==this.conf.getAttribute("mode-object"))
	{
		this.mode = value;
		this.refreshHTML();
	}
};
