var widgetColorPickerInput=null;
var widgetColorPickerFarbtastic=null;
jQuery(function($) {
  // Create colorpicker dialog
  $("#widget-colorpicker-dialog").dialog( { 
    title: 'Color picker',
    width: 215,
    height: 320,
    autoOpen: false,
    modal: false, //true,
    resizable: false,
    buttons: [
      {
          text: "Ok",
          click: function() {
            widgetColorPickerInput.color = widgetColorPickerFarbtastic.color;
            widgetColorPickerInput.rgb = widgetColorPickerFarbtastic.rgb;
            widgetColorPickerInput.red = Math.round(widgetColorPickerFarbtastic.rgb[0] * 255);
            widgetColorPickerInput.green = Math.round(widgetColorPickerFarbtastic.rgb[1] * 255);
            widgetColorPickerInput.blue = Math.round(widgetColorPickerFarbtastic.rgb[2] * 255);
            widgetColorPickerInput.hsl = widgetColorPickerFarbtastic.hsl;
            //widgetColorPickerInput.refreshHTML(); 
            $(this).dialog("close"); 
          }
      },
      {
          text: "Cancel",
          click: function() { $(this).dialog("close"); }
      }
    ]
  });

  widgetColorPickerFarbtastic = $.farbtastic('#widget-colorpicker-dialog-picker');
  widgetColorPickerFarbtastic.linkTo('#widget-colorpicker-dialog-color');
  
});

// Open color picker
function openWidgetColorPicker(input) {
  widgetColorPickerInput=input;
  widgetColorPickerFarbtastic.owner = input;
  widgetColorPickerFarbtastic.linkTo(input.updateValue);
  $("#widget-colorpicker-dialog-color").val(input.color);
  widgetColorPickerFarbtastic.setColor(input.color);
  $("#widget-colorpicker-dialog").dialog("open");
}

function CColorPicker(conf) {
  this.isResizable=true;
  this.init(conf);
  
  this.color='#123456'; // #123456
  this.hsl=''; // [0.3, 0.4, 0.5]
  this.rgb = []; // rgb[0]*255 => this.red ...
  this.red=0; // 0 to 255
  this.green=0; // 0 to 255
  this.blue=0; // 0 to 255

  $(this.div).click(function() {
    openWidgetColorPicker(this.owner);
  });
  
  this.refreshHTML();
}

CColorPicker.type='colorpicker';
UIController.registerWidget(CColorPicker);
CColorPicker.prototype = new CWidget();

// Refresh HTML from config
CColorPicker.prototype.refreshHTML = function() {

  if (this.conf.getAttribute("border")=='true') 
    this.div.css('border', "1px solid " + this.conf.getAttribute("border-color")); 
  else
    this.div.css('border','');
    
  if (this.conf.getAttribute("picture")!="")
  {
    $('.picture', this.div).css('background-image', 'url(' + getImageUrl(this.conf.getAttribute("picture")) + ')');
    $('.picture', this.div).css('background-color', '');
  } else 
  {
    if (this.conf.getAttribute("color")!="") $('.picture', this.div).css('background-color', this.conf.getAttribute("color"));
    $('.picture', this.div).css('background-image', '');
  }

  if (this.color!="") {
    this.rgb = widgetColorPickerFarbtastic.unpack(this.color);
    this.hsl = widgetColorPickerFarbtastic.RGBToHSL(this.rgb);
    this.red = Math.round(this.rgb[0] * 255);
    this.green = Math.round(this.rgb[1] * 255);
    this.blue = Math.round(this.rgb[2] * 255);
  }

  // pour les tests :
  if (this.color!="") $('.picture', this.div).css('background-color', this.color);
  $('.picture', this.div).css('background-image', '');

}

// Called by eibcommunicator when a feedback object value has changed
CColorPicker.prototype.updateObject = function(obj,value) {

  if (obj==this.conf.getAttribute("feedback-color"))
  {
    this.color = value;
    this.rgb = widgetColorPickerFarbtastic.unpack(this.color);
    this.hsl = widgetColorPickerFarbtastic.RGBToHSL(this.rgb);
    this.red = Math.round(this.rgb[0] * 255);
    this.green = Math.round(this.rgb[1] * 255);
    this.blue = Math.round(this.rgb[2] * 255);
  }
  if (obj==this.conf.getAttribute("feedback-red"))
  {
    this.red = parseFloat(value);
    this.rgb[0] = this.red / 255;
    this.color = widgetColorPickerFarbtastic.pack(this.rgb);
    this.hsl = widgetColorPickerFarbtastic.RGBToHSL(this.rgb);
  }
  if (obj==this.conf.getAttribute("feedback-green"))
  {
    this.green = parseFloat(value);
    this.rgb[1] = this.green / 255;
    this.color = widgetColorPickerFarbtastic.pack(this.rgb);
    this.hsl = widgetColorPickerFarbtastic.RGBToHSL(this.rgb);
  }
  if (obj==this.conf.getAttribute("feedback-blue"))
  {
    this.blue = parseFloat(value);
    this.rgb[2] = this.blue / 255;
    this.color = widgetColorPickerFarbtastic.pack(this.rgb);
    this.hsl = widgetColorPickerFarbtastic.RGBToHSL(this.rgb);
  }
  if (obj==this.conf.getAttribute("feedback-HSL"))
  {
    this.hsl = value;
    this.rgb = widgetColorPickerFarbtastic.HSLToRGB(this.hsl);
    this.color = widgetColorPickerFarbtastic.pack(this.rgb);
    this.red = Math.round(this.rgb[0] * 255);
    this.green = Math.round(this.rgb[1] * 255);
    this.blue = Math.round(this.rgb[2] * 255);
  }
};

// Called by eibcommunicator when a feedback object value has changed
CColorPicker.prototype.updateValue = function(value) {
  console.log(this, this.owner);
  this.owner.color = value;
  this.owner.rgb = widgetColorPickerFarbtastic.unpack(this.owner.color);
  this.owner.hsl = widgetColorPickerFarbtastic.RGBToHSL(this.owner.rgb);
  this.owner.red = Math.round(this.owner.rgb[0] * 255);
  this.owner.green = Math.round(this.owner.rgb[1] * 255);
  this.owner.blue = Math.round(this.owner.rgb[2] * 255);
  $("#widget-colorpicker-dialog-color").css('background-color',this.owner.color);
  $('#widget-colorpicker-dialog-color').val(this.owner.color)

  //if (this.owner.conf.getAttribute("picture")=="")
  //{
    if (this.owner.color!="") $('.picture', this.owner.div).css('background-color', this.owner.color);
    $('.picture', this.owner.div).css('background-image', '');
  //}
  
  if (!_editMode)
  {
    var actions = $("actionlist[id=slidestop-action]", this.owner.conf);
    if (actions.length==0 || !actions.length) {
      var actions=this.owner.conf.ownerDocument.createElement('actionlist');
      actions.setAttribute('id', "slidestop-action");
      this.owner.conf.appendChild(actions);
      actions = $(actions);
    }
    if (this.owner.conf.getAttribute("command-color")!="") {
      var action = $("action[id=" + this.owner.conf.getAttribute("command-color") + "]", actions);
      if ( action.attr("type") == "set-value" ) {
        action.remove();
      } 
      actions.append($("<action type='set-value' id='" + this.owner.conf.getAttribute("command-color") + "' value='" + this.owner.color + "'></action>")[0]);
    }
    if (this.owner.conf.getAttribute("command-red")!="") {
      var action = $("action[id=" + this.owner.conf.getAttribute("command-red") + "]", actions);
      if ( action.attr("type") == "set-value" ) {
        action.remove();
      } 
      actions.append($("<action type='set-value' id='" + this.owner.conf.getAttribute("command-red") + "' value='" + this.owner.red + "'></action>")[0]);
    }
    if (this.owner.conf.getAttribute("command-blue")!="") {
      var action = $("action[id=" + this.owner.conf.getAttribute("command-blue") + "]", actions);
      if ( action.attr("type") == "set-value" ) {
        action.remove();
      } 
      actions.append($("<action type='set-value' id='" + this.owner.conf.getAttribute("command-blue") + "' value='" + this.owner.blue + "'></action>")[0]);
    }
    if (this.owner.conf.getAttribute("command-green")!="") {
      var action = $("action[id=" + this.owner.conf.getAttribute("command-green") + "]", actions);
      if ( action.attr("type") == "set-value" ) {
        action.remove();
      } 
      actions.append($("<action type='set-value' id='" + this.owner.conf.getAttribute("command-green") + "' value='" + this.owner.green + "'></action>")[0]);
    }
    /* TODO  a dupliquer pour les autres commadn-xxx */ 
    /*actions.append($("<action type='set-value' id='" + this.owner.conf.getAttribute("command-color") + "' value='" + this.owner.color + "'></action>")[0]);
    actions.append($("<action type='set-value' id='" + this.owner.conf.getAttribute("command-red") + "' value='" + this.owner.red + "'></action>")[0]);
    actions.append($("<action type='set-value' id='" + this.owner.conf.getAttribute("command-blue") + "' value='" + this.owner.blue + "'></action>")[0]);
    actions.append($("<action type='set-value' id='" + this.owner.conf.getAttribute("command-green") + "' value='" + this.owner.green + "'></action>")[0]);*/
    if (actions.length>0) EIBCommunicator.executeActionList(actions);
  }
};
