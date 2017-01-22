var _valueedit;

function CValueEdit(conf) {
	this.isResizable=true;

	this.init(conf);
	var g = this;

	$(".valueContent", this.div).focus(function(e) {
		$(e.target).attr("data-editMode", "true");
	});
	$(".valueContent", this.div).blur(function(e) {
		$(e.target).attr("data-editMode", "false");
		var value = $(e.target).text()
		var object = g.conf.getAttribute("object");
// 		console.log("BLUR: "+object+" = "+value);

		var regex = new RegExp(g.conf.getAttribute("pattern"));
		var m = value.match(regex);

// 		console.log("pattern=", g.conf.getAttribute("pattern"), regex, m);

		if (m)
		{
			console.log("setting value "+m[0]);
			EIBCommunicator.eibWrite(object, m[0]);
		}
	});
	this.refreshHTML();
}

CValueEdit.type='valueedit';
UIController.registerWidget(CValueEdit);
CValueEdit.prototype = new CWidget();

// Refresh HTML from config
CValueEdit.prototype.refreshHTML = function() {
	var c = $(".valueContent", this.div);
	c.attr('style',this.conf.getAttribute("style"));
	if (this.conf.getAttribute("size")!="") c.css('font-size', this.conf.getAttribute("size") + "px"); else c.css('size', '');
	if (this.conf.getAttribute("color")!="") c.css('color', this.conf.getAttribute("color")); else c.css('color', '');
	if (this.conf.getAttribute("bgcolor")!="") c.css('background-color', this.conf.getAttribute("bgcolor")); else c.css('background-color', '');
	if (this.conf.getAttribute("align")!="") c.css('text-align', this.conf.getAttribute("align")); else c.css('text-align', '');
	if (_editMode)
	{
		c.css({'border-width': '1px', 'border-style': 'dotted', 'border-color':'blue'});
		c.text(this.conf.getAttribute("text"));
	}
	else
		c.css({'border-width': '0px'});
}

// Called by eibcommunicator when a feedback object value has changed
CValueEdit.prototype.updateObject = function(obj,value) {
	if ($(".valueContent", this.div).attr("data-editMode") == "true")
	{
		return;
	}
	if (obj==this.conf.getAttribute("object"))
	{
		var regex = new RegExp(this.conf.getAttribute("pattern"));
		var m = value.match(regex);
		if (m)
			value = m[0].replace(regex, this.conf.getAttribute("text"));
		else
			value = '';
		$(".valueContent", this.div).text(value);
	}
};

