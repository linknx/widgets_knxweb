function CReqhttp(conf) {
  this.isResizable=true;
  this.init(conf);
  this.active=false;
  
  $(this.div).click(function() {
    //if (!_editMode)
    //{
      this.owner.sendRequest();
    //}
  });
  
  this.sendRequest = function() {
    var urldata = '';
    var datas = this.conf.getAttribute("datas");
    if (datas && datas != '') {
      urldata += this.conf.getAttribute("datas");
    }
    for(i=1; i<6; i++) {
      var code=this.conf.getAttribute("code"+i);
      var data_object=this.conf.getAttribute("data"+i+"_object");
      
      if (code && code != '') {
        if (data_object && data_object != '') { 
          var ret = queryLinknx('<read><object id="'+data_object+'"/></read>');
/*
ou 
<read><objects><object id='teleinfo_IINST'/><object id='teleinfo_papp'/></objects></read>
mais réponse :
<read status="success">
	<objects>
		<object id="teleinfo_IINST" value="3" />
		<object id="teleinfo_papp" value="690" />
	</objects>
</read>

*/
          if (ret != "false" ) urldata += code + "=" + ret.textContent + "&";
        } else {
          urldata += code + "=" + this.conf.getAttribute("data"+i) + "&";
        }
      } 
    }
                
    var _this = this;
    if (this.server == "no") {
      $.ajax({
        type: this.method,
        url: this.full_url,
        data: urldata,
        success: function(datas){
          if(datas == null) return false;
          $(".datas", _this.div).html(datas);
        }
      });
    } else {
      // appel de : reqhttp.php pour que le serveur envoi lui-même la requête
      $.ajax({
        type: "POST",
        url: "widgets/reqhttp/reqhttp.php?full_url=" + this.full_url + "&method=" + this.method,
        data: urldata,
        success: function(datas){
          if(datas == null) return false;
          $(".datas", _this.div).html(datas);
        }
      });
    }
  };
  
  this.refreshHTML();
}

CReqhttp.type='reqhttp';
UIController.registerWidget(CReqhttp);
CReqhttp.prototype = new CWidget();

// Refresh HTML from config
CReqhttp.prototype.refreshHTML = function() {
  var displaypicture = this.conf.getAttribute("display-picture");
  if (_editMode && displaypicture == "yes")
    $(".buttonContent", this.div).css('background-image', 'url(' + getImageUrl(this.conf.getAttribute("picture-active")) + ')');
  else
  $(".buttonContent", this.div).css('background-image', 'url(' + getImageUrl(this.conf.getAttribute("picture")) + ')');
  
  $(".buttonContent", this.div).text(this.conf.getAttribute("text"));
  if (this.conf.getAttribute("size")!="") $('.buttonContent', this.div).css('font-size', this.conf.getAttribute("size") + "px"); else $('.buttonContent', this.div).css('size', '');
  if (this.conf.getAttribute("color")!="") $('.buttonContent', this.div).css('color', this.conf.getAttribute("color")); else $('.buttonContent', this.div).css('color', '');
  if (this.conf.getAttribute("align")!="") $('.buttonContent', this.div).css('text-align', this.conf.getAttribute("align")); else $('.buttonContent', this.div).css('text-align', '');
  if (this.conf.getAttribute("text-padding")!="") $('.buttonContent', this.div).css('padding-top', this.conf.getAttribute("text-padding")); else $('.buttonContent', this.div).css('padding-top', '0');
  
/*
protocol://user:pwd@url:port/page
http://knxweb:motdepass@localhost:80/test.php
*/
  this.protocol = this.conf.getAttribute("protocol");
  this.user = this.conf.getAttribute("user");
  this.pwd = this.conf.getAttribute("pwd");

  this.url = this.conf.getAttribute("url");
  this.port = this.conf.getAttribute("port");
  this.page = this.conf.getAttribute("page");

  this.method = this.conf.getAttribute("method");
  this.server = this.conf.getAttribute("server");

  //this.url = "http://" + this.user + ":" + this.pwd + "@" + this.conf.getAttribute("url") + ((this.conf.getAttribute("port") != '')?":" + this.conf.getAttribute("port")) + "/" + this.conf.getAttribute("page");
  this.full_url = '';
  this.full_url += this.protocol + "://";
  if (this.user != '') this.full_url += this.user + ":" + this.pwd + "@"
  this.full_url += this.conf.getAttribute("url");
  if (this.port != '') this.full_url += ":" + this.port;
  this.full_url += "/" + this.page;
  
}

CReqhttp.prototype.updateObject = function(obj,value) {
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

    var picture=((this.active)?this.conf.getAttribute("picture-active"):this.conf.getAttribute("picture"));
    if (picture!="") $(".buttonContent", this.div).css('background-image','url(' + getImageUrl(picture) + ')');
      
  }
};
