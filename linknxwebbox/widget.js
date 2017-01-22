function CLinknxwebbox(conf) {
	this.isResizable=false;
  this.init(conf);
  
  var refresh = $(".refresh", this.div);
  refresh.get(0).owner = this;
  
  refresh.click(function (){
    console.log(this, this.owner);
    this.owner.refreshHTML();
  });
  
  this.refreshHTML();
}

CLinknxwebbox.type='linknxwebbox';
UIController.registerWidget(CLinknxwebbox);
CLinknxwebbox.prototype = new CWidget();

// Refresh HTML from config
CLinknxwebbox.prototype.refreshHTML = function() {
  $(".linknxwebbox", this.div).addClass(this.conf.getAttribute("class"));
  
  this.program1 = this.conf.getAttribute("program1");
  this.program2 = this.conf.getAttribute("program2");
  this.program3 = this.conf.getAttribute("program3");
  this.program4 = this.conf.getAttribute("program4");
  this.program5 = this.conf.getAttribute("program5");
  this.program6 = this.conf.getAttribute("program6");
  
  var url = 'widgets/linknxwebbox/linknxwebbox.php?program1=' + this.program1 + '&program2=' + this.program2 + '&program3=' + this.program3 + '&program4=' + this.program4 + '&program5=' + this.program5 + '&program6=' + this.program6 + '&output=json';

  var linknxwebbox = this;
  
  $(".program1", this.div).html('');
  $(".program2", this.div).html('');
  $(".program3", this.div).html('');
  $(".program4", this.div).html('');
  $(".program5", this.div).html('');
  $(".program6", this.div).html('');
  
  jQuery.ajax({ type: "GET", url: url, dataType: "json", async : false, 
			success: function(data) {
        var html = "";
        $.each(data, function(key, val) {
          if (val[0] == "taille" ) {
            linknxwebbox.taille = val[1];
          }
          if (val[0] == "occupe" ) {
            linknxwebbox.occupe = val[1];
          }
          if (val[0] == "dispo" ) {
            linknxwebbox.dispo = val[1];
          }
          if (val[0] == "pourc_use" ) {
            linknxwebbox.pourc_use = val[1];
          }
          var html = "";
          
          if (val[0] == "program1" ) {
            if (val[1] == "true") html = '<span class="ok"></span>'; else html = '<span class="ko"></span>';
            $(".program1", linknxwebbox.div).html(html + "<span>" + linknxwebbox.program1 + "</span>");
          }   
          if (val[0] == "program2" ) {
            if (val[1] == "true") html = '<span class="ok"></span>'; else html = '<span class="ko"></span>';
            $(".program2", linknxwebbox.div).html(html + "<span>" + linknxwebbox.program2 + "</span>");
          }
          if (val[0] == "program3" ) {
            if (val[1] == "true") html = '<span class="ok"></span>'; else html = '<span class="ko"></span>';
            $(".program3", linknxwebbox.div).html(html + "<span>" + linknxwebbox.program3 + "</span>");
          }
          if (val[0] == "program4" ) {
            if (val[1] == "true") html = '<span class="ok"></span>'; else html = '<span class="ko"></span>';
            $(".program4", linknxwebbox.div).html(html + "<span>" + linknxwebbox.program4 + "</span>");
          }
          if (val[0] == "program5" ) {
            if (val[1] == "true") html = '<span class="ok"></span>'; else html = '<span class="ko"></span>';
            $(".program5", linknxwebbox.div).html(html + "<span>" + linknxwebbox.program5 + "</span>");
          }
          if (val[0] == "program6" ) {
            if (val[1] == "true") html = '<span class="ok"></span>'; else html = '<span class="ko"></span>';
            $(".program6", linknxwebbox.div).html(html + "<span>" + linknxwebbox.program6 + "</span>");
          }
        });
        $(".disk", linknxwebbox.div).html('<span class="disk"></span><span>'+ linknxwebbox.occupe + '/' + linknxwebbox.taille + ' => ' + linknxwebbox.pourc_use + ' utilisé</span>');
      }
  });

}

// Called by eibcommunicator when a feedback object value has changed
CLinknxwebbox.prototype.updateObject = function(obj,value) {};