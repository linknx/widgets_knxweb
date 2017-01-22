function CFoscam(conf) {
	this.isResizable=true;
  this.init(conf);
  
  $(".line1_cmd_foscam", this.div).append('<img src="pictures/32x32_vide.png" alt="">');
  var cmd_up = $('<img src="pictures/32x32_flecheUp2.png" alt="">');
  cmd_up.get(0).owner = this;
  cmd_up.mouseup( function(){
  // http://<IP_CAM>/decoder_control.cgi?command=30&user=<user>&pwd=<pass>
    $.get("http://" + this.owner.url + "/decoder_control.cgi?command=1&user=" + this.owner.user + "&pwd=" + this.owner.pwd);  
  });
  cmd_up.mousedown( function(){
    $.get("http://" + this.owner.url + "/decoder_control.cgi?command=0&user=" + this.owner.user + "&pwd=" + this.owner.pwd);
  });
  $(".line1_cmd_foscam", this.div).append(cmd_up);
    
  var cmd_left = $('<img src="pictures/32x32_flecheLeft2.png" alt="">');
  cmd_left.get(0).owner = this;
  cmd_left.mouseup( function(){
    $.get("http://" + this.owner.url + "/decoder_control.cgi?command=5&user=" + this.owner.user + "&pwd=" + this.owner.pwd);
  });
  cmd_left.mousedown( function(){
    $.get("http://" + this.owner.url + "/decoder_control.cgi?command=4&user=" + this.owner.user + "&pwd=" + this.owner.pwd);
  });
  $(".line2_cmd_foscam", this.div).append(cmd_left);
  
  var cmd_center = $('<img src="pictures/32x32_plus.png" title="Center" alt="">');
  cmd_center.get(0).owner = this;
  cmd_center.click( function(){
    $.get("http://" + this.owner.url + "/decoder_control.cgi?command=25&user=" + this.owner.user + "&pwd=" + this.owner.pwd);
  });
  $(".line2_cmd_foscam", this.div).append(cmd_center);
  
  var cmd_right = $('<img src="pictures/32x32_flecheRight2.png" alt="">');
  cmd_right.get(0).owner = this;
  cmd_right.mouseup( function(){
    $.get("http://" + this.owner.url + "/decoder_control.cgi?command=7&user=" + this.owner.user + "&pwd=" + this.owner.pwd);  
  });
  cmd_right.mousedown( function(){
    $.get("http://" + this.owner.url + "/decoder_control.cgi?command=6&user=" + this.owner.user + "&pwd=" + this.owner.pwd);
  });
  $(".line2_cmd_foscam", this.div).append(cmd_right);
  
  $(".line3_cmd_foscam", this.div).append('<img src="pictures/32x32_vide.png" alt="">');
  var cmd_down = $('<img src="pictures/32x32_flecheDown2.png" alt="">');
  cmd_down.get(0).owner = this;
  cmd_down.mouseup( function(){
    $.get("http://" + this.owner.url + "/decoder_control.cgi?command=3&user=" + this.owner.user + "&pwd=" + this.owner.pwd);
  });
  cmd_down.mousedown( function(){
    $.get("http://" + this.owner.url + "/decoder_control.cgi?command=2&user=" + this.owner.user + "&pwd=" + this.owner.pwd);
  });
  $(".line3_cmd_foscam", this.div).append(cmd_down);

  this.refreshHTML();
}

CFoscam.type='foscam';
UIController.registerWidget(CFoscam);
CFoscam.prototype = new CWidget();

// Refresh HTML from config
CFoscam.prototype.refreshHTML = function() {
  this.user = this.conf.getAttribute("user");
  this.pwd = this.conf.getAttribute("pwd");
  this.url = this.conf.getAttribute("url");
  this.ext_url = this.conf.getAttribute("ext_url");
  this.resolution = this.conf.getAttribute("resolution");
  this.rate = this.conf.getAttribute("rate");

  url_cam = "http://" + this.url + "/" + this.conf.getAttribute("url_type") + ".cgi?user=" + this.user + "&pwd=" + this.pwd + "&resolution=" + this.resolution + "&rate=" + this.rate;
  
  $(".cmde_foscam", this.div).show();  

	if (this.url!="") {
		$(".img_foscam", this.div).attr("src",url_cam); 
		$(".img_foscam", this.div).show();
	} else $(".img_foscam", this.div).hide();
}