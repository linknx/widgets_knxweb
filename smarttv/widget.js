function CSmarttv(conf) {
  this.isResizable=false;
  this.init(conf);
  var _this = this;
  $(".touch", this.div).click(function() 
  {
    $.ajax({
      type: "GET",
      url: "widgets/smarttv/samsungremote.php?key="+$(this).attr('id')+'&tvip='+_this.tvip+'&mymac='+_this.mymac,
      success: function(datas){
        if(datas == null) return false;
      }
    });
  }); 
  this.refreshHTML();
}

CSmarttv.type='smarttv';
UIController.registerWidget(CSmarttv);
CSmarttv.prototype = new CWidget();

// Refresh HTML from config
CSmarttv.prototype.refreshHTML = function() {
  
  this.ScreenColor=this.conf.getAttribute("ScreenColor");
  if (this.ScreenColor)
     $('.remote', this.div).css('background-color', this.ScreenColor);
  this.tvip = this.conf.getAttribute("tvip");   
  this.mymac = this.conf.getAttribute("mymac"); 
}