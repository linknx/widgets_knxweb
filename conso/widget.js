/*
 *
 * Calcul Conso object nécéssite le widget Charts
 *
 **/
// TODO conso élec téléinfo et conso eau / gaz

function CConso(conf) {
  this.isResizable=false;
  this.init(conf);

  $(this.div).click(function() {
    if (!_editMode)
    {
      if (this.owner.objects[0].id == '' ) {
        messageBox(tr("Nothing to do"), tr('Error'), 'alert');
        return false;
      }
      //calclconso(this.owner);
      $(".result_conso", this.owner.div).html("<tr><th>Object</th><th>Hours On</th><th>kWh</th><th>Cost</th></tr>" + calclconso(this.owner));
    }
  });
  
  this.refreshHTML();
  $(this.div).click();
}

CConso.type='conso';
UIController.registerWidget(CConso);
CConso.prototype = new CWidget();

// Called by eibcommunicator when a feedback object value has changed
CConso.prototype.updateObject = function(obj,value) {};
  
CConso.prototype.deleteWidget = function() {};

// Refresh HTML from config
CConso.prototype.refreshHTML = function() {
  $('div:first-child', this.div).css('background-image', 'url(' + tab_config.imageDir + this.conf.getAttribute("picture") + ')');
  //$(".result_conso", this.div).html("<tr><th>Object</th><th>Hours On</th><th>kWh</th><th>Cost</th></tr>");

  this.pricekWh=this.conf.getAttribute("pricekWh");

  // => si log de type "mysql"
  this.duration = this.conf.getAttribute("duration");
  this.periodicity = this.conf.getAttribute("periodicity");
  // => si log de type "file"
  this.nbenreg = this.conf.getAttribute("nbenreg");

  this.objects = []; // courbes à tracer

  // récupération des attributs de conf (= "control") pour le 1er object
  var object = {};
  object.id = this.conf.getAttribute("id");
  object.puiss = this.conf.getAttribute("puiss");

  object.libel = this.conf.getAttribute("libel");
  if (_editMode) {
    var libel = "";
    var id = object.id.replace(" ", "_");
    $('object[id=' + id + ']', _objects).each(function() {
      if (id == this.getAttribute('id')) libel = ((this.textContent!="")?this.textContent:this.getAttribute('id'));
    });
    this.conf.setAttribute('libel', libel );
    object.libel = libel;
  }
  if (!object.libel) object.libel = object.id;

  if (object.id != '') {
    this.objects.push(object);
  }

  var i = 1;
  for( i = 1; i < 5; i++) {
    var objectData = {};
    objectData.id = this.conf.getAttribute("id" + i);
    objectData.puiss = this.conf.getAttribute("puiss" + i);

    objectData.libel = this.conf.getAttribute("libel" + i);
    if (_editMode) {
      var libel = "";
      var id = objectData.id.replace(" ", "_");
      $('object[id=' + id + ']', _objects).each(function() {
        if (id == this.getAttribute('id')) libel = ((this.textContent!="")?this.textContent:this.getAttribute('id'));
      });
      this.conf.setAttribute('libel' + i, libel );
      objectData.libel = libel;
    }
    if (!objectData.libel) objectData.libel = objectData.id;

    if (objectData.id != '') {
      this.objects.push(objectData);
    }
  };
};

function calclconso(listConso) {
  var html;

  // chargement des données de chaque object
  for(var i=0;i<listConso.objects.length; i++) {
    var data2 = [];

    data2 = getdatajson_objectLog(listConso.objects[i].id, listConso.duration, listConso.periodicity, listConso.nbenreg);
    //console.log("listConso data "+ data2);

    console.log("Courbe de",listConso.objects[i].libel,"puissance consommée",listConso.objects[i].puiss);

    var index, value_prev = 0;
    var hour_prev = 0, hour_prevOff = 0;
    var conso_prev = data2[0][1];
    var cout, coutTot = 0, totHeureOn = 0, totHeureOff = 0, hour_last;
    for	(index = 0; index < data2.length; index++) {
      /*
      console.log("Hour / Val");
      console.log(data2[index][0] - hour_prev);
      console.log(data2[index][1]);
      */
      if (hour_prev == 0) hour_prev = data2[index][0];
      if ( data2[index][1] == 0 && value_prev == 1 ) {
        cout = (data2[index][0] - hour_prev ) / 3600000 * listConso.objects[i].puiss / 1000;
        totHeureOn+= ((data2[index][0] - hour_prev ) / 3600000);
        coutTot+= parseFloat(cout);
        hour_prev = data2[index][0];
      } else if ( data2[index][1] == 1 && value_prev == 0 ) {
        totHeureOff+= ((data2[index][0] - hour_prev ) / 3600000);
        hour_prev = data2[index][0];
      }
      value_prev = data2[index][1];
      hour_last =  data2[index][0];
    }
    console.log("coutTot : ", coutTot, "kWh soit *-=", Math.floor(parseFloat(coutTot * listConso.pricekWh )*100)/100, "Euro =-* pour On ", totHeureOn, " Heures et Off " , totHeureOff , " Heures sur ", ((hour_last - data2[0][0]) / 3600000 ) , "Heures Totales");
    //html = "Courbe de"+listConso.objects[i].libel+"puissance consommée"+listConso.objects[i].puiss +"<br /> coutTot : "+ coutTot+ "kWh soit *-="+ (Math.floor(parseFloat(coutTot * 0.14400)*100)/100 )+ "Euro =-* pour On "+ totHeureOn+ " Heures et Off " + totHeureOff + " Heures sur "+ ((hour_last - data2[0][0]) / 3600000 ) + "Heures Totales";
    html += "<tr><td>"+listConso.objects[i].libel+"</td><td>"+ (Math.floor(parseFloat(totHeureOn)*100)/100)+ "</td><td>"+ (Math.floor(parseFloat(coutTot)*100)/100)+ "</td><td>"+ (Math.floor(parseFloat(coutTot * listConso.pricekWh )*100)/100 )+ "</td></tr>";
  };

  return html;
}

function getdatajson_objectLog(id, duration, periodicity, nbenreg) {
  // idem function getdatajson_teleinfo dans le widget Charts

  var url = 'readfile.php?output=json&objectlog=' + id + '&duration=' + duration + '&periodicity=' + periodicity + '&nbenreg=' + nbenreg;
  // TODO modifier  readfile.php pour gérer duration et periodicity sur le mode : datejour - ( duration * periodicity ) comme date de début

  var data_json = [];

  jQuery.ajax({ type: "GET", url: url, dataType: "json", async : false,
			success: function(data) {
        var prev_val_0 = 0;
        $.each(data, function(key, val) {
          if (val[0] != prev_val_0) {
            data_json.push([ val[0], parseFloat(val[1])]);
          }
          prev_val_0 = val[0];
        });
      }
  });

  return data_json;
}

