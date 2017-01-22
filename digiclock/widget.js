var digiclock;
function CDigiclock(conf) {
  this.isResizable=false;
  this.init(conf);
  this.refreshHTML();
}

CDigiclock.type='digiclock';
UIController.registerWidget(CDigiclock);
CDigiclock.prototype = new CWidget();

// Refresh HTML from config
CDigiclock.prototype.refreshHTML = function() {
  var _conf = this.conf;
  this.div.empty();
digiclock = this.div; 
  this.div.jdigiclock({
    weatherLocationCode : _conf.getAttribute("weatherLocationCode"),
    lang : _conf.getAttribute("lang"),
  });
}