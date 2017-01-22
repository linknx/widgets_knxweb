function CBpupdown(conf) {
	this.isResizable = true;
	this.init(conf);

	$(this.div).mousedown(function () {
		if (!_editMode) {
			this.owner.buttonPosition='down';
			this.owner.refreshHTML();
			var actions = $("actionlist[id=down-action]", this.owner.conf);
			if (actions.length > 0) EIBCommunicator.executeActionList(actions);
		}
	});

	$(this.div).mouseup(function () {
		if (!_editMode) {
			this.owner.buttonPosition='up';
			this.owner.refreshHTML();
			var actions = $("actionlist[id=up-action]", this.owner.conf);
			if (actions.length > 0) EIBCommunicator.executeActionList(actions);
		}
	});

	this.refreshHTML();
}

CBpupdown.type = 'bpupdown';
UIController.registerWidget(CBpupdown);
CBpupdown.prototype = new CWidget();
CBpupdown.prototype.buttonPosition = 'up';
CBpupdown.prototype.setGraphic = function (attr,csss,deflt) {
	if (this.conf.getAttribute(attr) != '') $('.bpupdownContent', this.div).css(csss, this.conf.getAttribute(attr));
	else $('.bpupdownContent', this.div).css(csss, deflt);
};
// Refresh HTML from config
CBpupdown.prototype.refreshHTML = function () {
	$('.bpupdownContent', this.div).css('background-image', 'url(' + getImageUrl(this.conf.getAttribute(this.buttonPosition+"-picture")) + ')');
	$('.bpupdownContent', this.div).text(this.conf.getAttribute("text"));
	this.setGraphic('size','font-size','');
	this.setGraphic('color','color','');
	this.setGraphic('align','text-align','');
	this.setGraphic('text-padding','padding-top',0);
	this.setGraphic('text-padding-leftg','padding-left',0);
};

// Called by eibcommunicator when a feedback object value has changed
CBpupdown.prototype.updateObject = function (obj, value) { };
