function CSendvalue(conf) {
  this.isResizable=true;
  this.init(conf);

  $(".sendvalueContent", this.div).get(0).owner = this;
  $(".sendvalueContent", this.div).click(function() {
    this.owner.displayValueDialog();
  });
  
  this.refreshHTML();
}

CSendvalue.type='sendvalue';
UIController.registerWidget(CSendvalue);
CSendvalue.prototype = new CWidget();

// Refresh HTML from config
CSendvalue.prototype.refreshHTML = function() {

  $(".sendvalueContent", this.div).css('background-image', 'url(' + getImageUrl(this.conf.getAttribute("picture")) + ')');
  
  $(".sendvalueContent", this.div).text(this.conf.getAttribute("text"));
  if (this.conf.getAttribute("size")!="") $('.sendvalueContent', this.div).css('font-size', this.conf.getAttribute("size") + "px"); else $('.sendvalueContent', this.div).css('size', '');
  if (this.conf.getAttribute("color")!="") $('.sendvalueContent', this.div).css('color', this.conf.getAttribute("color")); else $('.sendvalueContent', this.div).css('color', '');
  if (this.conf.getAttribute("align")!="") $('.sendvalueContent', this.div).css('text-align', this.conf.getAttribute("align")); else $('.sendvalueContent', this.div).css('text-align', '');
  if (this.conf.getAttribute("text-padding")!="") $('.sendvalueContent', this.div).css('padding-top', this.conf.getAttribute("text-padding")); else $('.sendvalueContent', this.div).css('padding-top', '0');
  
  this.commandObject = this.conf.getAttribute("command-object");
  this.confirm = this.conf.getAttribute('confirm') == "true";
}

CSendvalue.prototype.displayValueDialog = function() {
  var obj = this;
  var newdiv =  $(".editDiv", this.div);
  newdiv.html('');
  newdiv.show();

  var input_value = $("<input type='text'>");
  newdiv.append(input_value);
  var okBtn = $("<button>"+tr('Ok')+"</button>");
  okBtn.click(function() {
    if (obj.commandObject == "") {
      messageBox(tr("No Command Object defined"), tr('Error'), 'alert');
      newdiv.hide();
      return;
    }
    if (input_value.val() == "") {
      messageBox(tr("No value to Send"), tr('Error'), 'alert');
      newdiv.hide();
      return;
    }
    var answer = true
    if (obj.confirm) answer = confirm(tr("confirm the command"));
    if (answer) {
      var actions = $("<actionslist><action type='set-value' id='" + obj.commandObject + "' value='" + input_value.val() + "'></action></actionsList>");
      EIBCommunicator.executeActionList(actions);
      newdiv.hide();
    }
  });
  newdiv.append(okBtn);

  var closeBtn = $("<button>"+tr('Close')+"</button>");
  closeBtn.click(function() { newdiv.hide(); });
  newdiv.append(closeBtn);
};

// Called by eibcommunicator when a feedback object value has changed
CSendvalue.prototype.updateObject = function(obj,value) {
};
