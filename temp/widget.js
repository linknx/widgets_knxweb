function CTemp(conf) {
  this.isResizable=false; // TODO ajouter un attribut pour garder le ration width/height lors du resize 
  //conf.setAttribute("x", 1);
  //conf.setAttribute("y", 1);
  
  //conf.setAttribute("width", '100');
  //conf.setAttribute("height", '100');
  
  this.init(conf);
  
  this.refreshHTML();
}

CTemp.type='temp';
UIController.registerWidget(CTemp);
CTemp.prototype = new CWidget();

// Refresh HTML from config
CTemp.prototype.refreshHTML = function() {
  
  this.mod=parseFloat(this.conf.getAttribute("mod"));
  if (!this.mod)
    this.mod = 0.01;
  
  this.decimal=parseFloat(this.conf.getAttribute("decimal"));
  if (!this.decimal)
    this.decimal = 2;
  
  this.scale=parseFloat(this.conf.getAttribute("scale"));
  if (!this.scale)
    this.scale = 100;
  
  this.tempinf=parseFloat(this.conf.getAttribute("tempinf"));
  if (!this.tempinf)
    this.tempinf = -99;

  this.tempsup=parseFloat(this.conf.getAttribute("tempsup"));
  if (!this.tempsup)
    this.tempsup = 99;

  this.tempmin=parseFloat(this.conf.getAttribute("tempmin"));
  if (!this.tempmin)
    this.tempmin = -99;

  this.tempmax=parseFloat(this.conf.getAttribute("tempmax"));
  if (!this.tempmax)
    this.tempmax = 99;

  //$(".icone",this.div).attr('style','width:100px; height: 100px;font-size:100%;');
  $(this.div).css('width',this.scale+'px;');
  $(this.div).css('height', this.scale+'px;');
  $(this.div).css('font-size', this.scale+'%;');
  $('.icone',this.div).attr('style','width:'+this.scale+'px; height: '+this.scale+'px;font-size:'+this.scale+'px;');
  $('.moins', this.div).hide();
  $('.plus', this.div).hide();

  this.value=0;
}

// Called by eibcommunicator when a feedback object value has changed
CTemp.prototype.updateObject = function(obj,value) {
  if (obj==this.conf.getAttribute("feedback-object"))
  {
    value = parseFloat(value);
    if(this.value!=0 && this.value != value) {
      if (this.value > value) {
        $('.moins', this.div).show();
        $('.plus', this.div).hide();
        $('.icone', this.div).attr("title", "last:"+this.value+" new:"+value);
      }
      if (this.value < value) {
        $('.moins', this.div).hide();
        $('.plus', this.div).show();
        $('.icone', this.div).attr("title", "last:"+this.value+" new:"+value);
      }
    }
    if (value >= this.tempsup) {
      $('.temperature', this.div).css("background","#C80000")
    }
    if (value > this.tempinf && value < this.tempsup) {
      $('.temperature', this.div).css("background","#00C800")
    }
    if (value <= this.tempinf) {
      $('.temperature', this.div).css("background","#0000C8")
    } 
    this.value = value;
    //value = Math.round(value*100)/100;
    //value = value -(value % this.mod); // 21.623456 -(21.123456 % 0.5) => 21.5  ( % = modulo )
    if (this.mod != 0.01) {
      mod = value % this.mod;
      value = value - mod;
    }
    
    var pourc = ((this.tempmax - value) * 100 ) / (this.tempmax - this.tempmin)
    
    $('.temperature', this.div).css("height", (100 - pourc)+"%");
    entier = Math.floor(value);
    if (value < 0) entier = entier + 1;
    
    if ( this.decimal == 1 ) { 
      decimal = Math.round((value - entier) *10);
      str_decimal = decimal;
    } else {
      decimal = Math.round((value - entier) *100);
      if (decimal < 0) decimal = decimal * -1;
      if ( decimal < 10 ) str_decimal = "0"+decimal; else str_decimal = decimal;
    }
 
    $('.entiers', this.div).text(entier);
    $('.decimales', this.div).text(str_decimal);
  }
};
