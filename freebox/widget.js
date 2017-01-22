var _freeboxImg = 0;

var canSend = true;
var boitier, code, version;
var key, isKeyPressed, keyPressTimeout, scrollWhellTimeout;
var directPress = ['vol_inc', 'vol_dec', 'prgm_inc', 'prgm_dec', 'up', 'down', 'left', 'right'];

function CFreebox(conf) {
  this.isResizable=true;
  this.init(conf);

  //$(this.div).keydown = doKeyDown;
  //$(this.div).keyup   = keyUp;
  $(this.div).mousewheel = $(this.div).mousewheel = doOnMouseScroll;

  //$('area', this.div).get(0).owner = this;
  var $this = this;
  $('area', this.div).each(function() { 
    this.owner = this;
  }) 
  $('area', this.div).mouseover(function(){ 
    $('#' + this.owner.version + '-bodyBackground', this.owner.div).css('cursor', 'pointer'); 
  }).mouseout(function(){ 
    $('#' + this.owner.version + '-bodyBackground', this.owner.div).css('cursor', 'default'); 
  });
  _freeboxImg++;
  this.freeboxImg = _freeboxImg;
  
  $('img', this.div).each(function() {
    this.setAttribute('usemap', this.getAttribute('usemap') + _freeboxImg);
  })
  $('map', this.div).each(function() {
    this.setAttribute('name', this.getAttribute('name') + _freeboxImg);
  })
  this.refreshHTML();
}

CFreebox.type='freebox';
UIController.registerWidget(CFreebox);
CFreebox.prototype = new CWidget();

// Refresh HTML from config
CFreebox.prototype.refreshHTML = function() {
  
  this.boitier = this.conf.getAttribute("boitier");
  if(!this.boitier || this.boitier=='') this.boitier = 1;
  this.version = this.conf.getAttribute("version");
  $('img', this.div ).hide();
  $('map', this.div ).hide();
  $('#' + this.version + '-remoteURLmap', this.div).show();
  var $img = $('#' + this.version + '-bodyBackground', this.div);
  $img.show();
  this.div.width($img.attr('originalWidth')).height($img.attr('originalHeight'));
  this.code = this.conf.getAttribute("code");
  
  var enable = this.conf.getAttribute("title") == "yes";
  $('area', this.div).each(function(){
    var self = $(this);
    if(enable) self.attr('title', self.attr('title_bak'));
    else self.removeAttr('title');
  });
  
  this.zoom = this.conf.getAttribute("zoom");
  if(isNaN(this.zoom) || Number(this.zoom)<200) this.zoom = 500;
  
  var $img = $('#' + this.version + '-bodyBackground', this.div);
  if(this.zoom!=$img.attr('originalHeight') && this.zoom!=$img.attr('zoom')) {
    $img.attr('zoom', this.zoom);
    var zoom = this.zoom/$img.attr('originalHeight');
    var newWidth = Math.round($img.attr('originalWidth')*zoom);
    $img.width(newWidth);
    $img.height(this.zoom);
    this.div.width(newWidth).height(this.zoom);
    $('#' + this.version + '-remoteURLmap area', this.div).each(function() {
      var coords = $(this).attr('coords').split(',');
      for(var j=0; coord=coords[j]; j++) {
        coords[j] = coord*zoom;
      }
      $(this).attr('coords', coords.join(','));
    });
  }

  /*
   * avec ces variable on ne peux pas gérer plusieurs télécomandes ... TODO à améliorer si besoin ...
   */
  boitier = this.boitier;
  code = this.code;
  version = this.version;
}

function contains(array, element) {
  for(var i = 0; i < array.length; i++) {
    if(array[i]==element) return true;
  }
  return false;
}
function pressKey(keyPressed){
  isKeyPressed = true;
  key = keyPressed;
  keyPressTimeout = setTimeout('sendKey(' + (!contains(directPress, keyPressed)) + ');', 500);
}
function keyUp(){
  isKeyPressed = false;
  clearTimeout(keyPressTimeout);
  sendKey();
}
function sendKey(longPress, repeat){

  if(key && canSend && code) {
    $.ajax({
        url: 'http://hd' + boitier + '.freebox.fr/pub/remote_control'
      , cache: false
      , data: 'code=' + code + '&key=' + key + (longPress ? '&long=true' : '') + (repeat ? '&repeat=' + repeat : '')
      , beforeSend: function(){ canSend = !isKeyPressed; }
      , complete:   function(){ canSend = true; }
    });
  }
  if((!repeat || repeat==1) && isKeyPressed && contains(directPress, key)) {
    keyPressTimeout = setTimeout('sendKey();', 100);
  } else key = void(0);
}
function doOnMouseScroll(event){
  var wheelDelta = window.event.wheelDelta;
  if(wheelDelta) {
    clearTimeout(scrollWhellTimeout);
    scrollWhellTimeout = setTimeout('pressKey(\'' + (wheelDelta>0 ? 'vol_inc' : 'vol_dec') + '\');keyUp();', 0);
  }
}