function CObjecthistory(conf) {
  this.isResizable=false;
  this.init(conf);
  
  this.refreshHTML();
}

CObjecthistory.type='objecthistory';
UIController.registerWidget(CObjecthistory);
CObjecthistory.prototype = new CWidget();

// Called by eibcommunicator when a feedback object value has changed
CObjecthistory.prototype.updateObject = function(obj,value) {
  if (obj==this.conf.getAttribute("feedback-object"))
  {
    if (value != this.dern_value) {
      this.dern_value = value;
      var now = new Date();
      // 2012-2-7 20:43:18
      var now_string = now.getFullYear() + '-' + ((now.getMonth()<9)?'0'+(now.getMonth() + 1):(now.getMonth() + 1)) + '-' ;
      now_string = now_string + ((now.getDate()<10)? '0':'') + now.getDate() + ' ' ;
      now_string = now_string + ((now.getHours()<10)? '0':'') + now.getHours() + ':';
      now_string = now_string + ((now.getMinutes()<10)? '0':'') + now.getMinutes() + ':';
      now_string = now_string + ((now.getSeconds()<10)? '0':'') + now.getSeconds();
      $('tbody', this.div).prepend('<tr><th>' + now_string + '</th><td>' + value + '</td></tr>');
      $("tbody tr:gt(" + ( this.nbenreg - 1 ) + ")", this.div).remove(); 
    }
  }
};

// Refresh HTML from config
CObjecthistory.prototype.refreshHTML = function() {
  //$('div:first-child', this.div).css('background-image', 'url(' + tab_config.imageDir + this.conf.getAttribute("picture") + ')');
  //$('tbody', this.div).empty();
  $('tbody', this.div).html('');
  //$('tbody', this.div).prepend('<tr><th> Date heure </th><td>val</td></tr>');
  var title = this.conf.getAttribute("title");
  $('.title', this.div).text(title);
  
  this.nbenreg = this.conf.getAttribute("nbenreg");

  var url = 'readfile.php?objectlog=' + this.conf.getAttribute("feedback-object") + '&nbenreg=' + this.conf.getAttribute("nbenreg") + '&output=html';
  if (!this.conf.getAttribute("feedback-object")) {
    $('tbody', this.div).append('<tr><th> NO </th><td> DATA </td></tr>');
  } else {
    if (!title) $('.title', this.div).text(this.conf.getAttribute("feedback-object"));
    var dern_value;
    var tabledata = $('tbody', this.div);
    
    req = jQuery.ajax({ type: 'post', url: url, dataType: 'html', async: false, 
      success: function(responseHTML, status) 
      {
        var tableau = responseHTML.split('<br />');
        for (var i=0; i<tableau.length; i++) {
          var elem = tableau[i].split(' > ');    // &gt;
          dern_value = elem[1]; 
          if (elem[1]) tabledata.prepend('<tr><th>' +  elem[0] + '</th><td>' + elem[1] + '</td></tr>');
        }
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        messageBox(tr("Error Unable to load: ")+textStatus, 'Erreur', 'alert');
      }
    });
    this.dern_value = dern_value;
  }
};