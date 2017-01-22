var _string_day = Array('', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi','Dimanche');
var Valeur_Mode=['frost','standby','night','comfort'];
setInterval (function(){
  UpdateDate();
},5000);

function CThermostat(conf) {
  $.fx.speeds._default = 1000;
  this.isResizable=false; 
  this.init(conf);
  var _this = this;
  this.DivSelect="mode";
  this.ConsigneValue=0;
//gestion des commande automatique de thermostat

  this.idrule='';
  this.nextexec='';
  this.modenextexec='';
  this.ruleactive=false;
  this.rule='';
  this.reload = false;
  this.RulesNbParam= 0;
$(".alarmmode",this.div).click(function() 
	{
	if (!_editMode)
		{
		$("#ThEditRule",_this.div).css('display','block');
		}
	});
$("#ThEditRuleCancel", this.div).click(function() 
	{
	$("#ThEditRule",_this.div).css('display','none');
	});  
$("#ThEditRuleOk", this.div).click(function() 
	{
	if (_this.TypeRules == "Mode")
		{
		for(var i=0;i<=3;i++) 
			{ 
			var idmode=_this.idrule+"_"+Valeur_Mode[i];
			var xml = ValidRulesThMode(idmode,i,_this);
			if (xml!=false)
				queryLinknx('<write><config><rules>' + xml + '</rules></config></write>');
			}
		}
	else
		{
		ValidRulesThConsigne(_this);
		}
	$("#ThEditRule",_this.div).css('display','none');
	_this.refreshHTML();
	});

$(".addRules", this.div).live('click',function() 
	{	
	var selectParam=$(this).attr('id');
	_this.RulesNbParam=_this.RulesNbParam+1;
	var HtmlCode=AfficheParamRule('', '', '00', '00',_this);
	$("#Rule_"+selectParam,_this.div).after('<div id="Rule_'+_this.RulesNbParam+'">'+HtmlCode+'</div>');
	});
$(".removeRules", this.div).live('click',function() 
	{	
	var selectParam=$(this).attr('id');
	$("#Rule_"+selectParam, _this.div).remove();
	}); 
//gestion des fenetres parametrable
  $(".top", this.div).click(function() 
  {
    _this.DivSelect="mode";
    $('.top', _this.div).css('border-color',"#3AC7FF");
    $('.middle', _this.div).css('border-color',"#000000");
    $('.bottom', _this.div).css('border-color',"#000000");
  });
  $(".middle", this.div).click(function() 
  {
    _this.DivSelect="";
    $('.top', _this.div).css('border-color',"#000000");
    $('.middle', _this.div).css('border-color',"#3AC7FF");
    $('.bottom', _this.div).css('border-color',"#000000");
  });
  $(".bottom", this.div).click(function() 
  {
    _this.DivSelect="consigne";
    $('.top', _this.div).css('border-color',"#000000");
    $('.middle', _this.div).css('border-color',"#000000");
    $('.bottom', _this.div).css('border-color',"#3AC7FF");
  });
 //gestion clavier parametre
  $("#descente", this.div).click(function() 
  {
    if (_this.DivSelect=="mode")
      NewMode("down", _this);
    if (_this.DivSelect=="consigne")
      NewConsigne("down", _this);
  });  
  $("#montee", this.div).click(function() 
  {
    if (_this.DivSelect=="mode")
      NewMode("up", _this);
    if (_this.DivSelect=="consigne")
      NewConsigne("up", _this);
  });  

  this.refreshHTML();
}

CThermostat.type='thermostat';
UIController.registerWidget(CThermostat);
CThermostat.prototype = new CWidget();
// Refresh HTML from config
CThermostat.prototype.refreshHTML = function() {
  UpdateDate(this);
    
  $(".status", this.div).removeClass('active');
  $(".status", this.div).removeClass('notactive');
  
  this.TypeRules = this.conf.getAttribute("TypeRules");
  this.idrule=this.conf.getAttribute("Idthermostat");
  if (this.idrule)
	{
    this.reload = false;
	this.RulesNbParam=0;
	$('#Rules', this.div).remove();
	$(".dwv", this.div).after('<div class="Rules" id="Rules"></div>');
	if (this.TypeRules == "Mode")
		{
		for (var i=0;i<4;i++)
			{
			loadRuleStatusThermostat(this.idrule+"_"+Valeur_Mode[i],i,this);
			}
		}
	else
		{
		for (var i=1;i<=10;i++)
			{
			loadRuleStatusThermostat(this.idrule+"_"+i,i,this);
			}
		}
	if (this.RulesNbParam ==0)
		{
		this.RulesNbParam=this.RulesNbParam+1;	
		var HtmlCode=AfficheParamRule('', '', '', '',this);
		$(".Rules",this.div).append('<div id="Rule_'+this.RulesNbParam+'">'+HtmlCode+'</div>');
		}
	}
  if (this.nextexec) 
	{ //"2012-1-16 8:30:0"
    $(".alarmmode",this.div).attr("title","Mode : "+this.modenextexec+" Next execution : "+this.nextexec);
    var elem = this.nextexec.split(' ');
    var adate = elem[0].split('-');
    var ahour = elem[1].split(':');  
    $(".hour", this.div).text(ahour[0]);
    if (ahour[1] < 10) ahour[1] = "0"+ahour[1];
    $(".minute", this.div).text(ahour[1]);
    if (adate[1] < 10) adate[1]="0"+adate[1];
    var ladate=new Date(adate[0],adate[1]-1,adate[2],0,0,0); //new Date(année, mois, jour, heures, minutes, secondes[, millisecondes]) 
    $(".date", this.div).text(_string_day[ladate.getDay()]+" "+ adate[2]+"/"+adate[1]);
	}
    
  this.ModeValue="frost";
  this.ConsigneOffset = parseFloat(this.conf.getAttribute("consigne-offset"));

  this.ScreenColor=this.conf.getAttribute("ScreenColor");
  if (!this.ScreenColor)
    this.ScreenColor = "#3AC7FF";
  $('.ecran', this.div).css('background-color', this.ScreenColor);
  
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

  if (_editMode) {
    UpdateThermometre("reel",25 * Math.random(), this);
    UpdateThermometre("consigne",20 * Math.random(), this);
    UpdateThermometre("ext",10 * Math.random(), this);
  } else {
    $('.moins', this.div).hide();
    $('.plus', this.div).hide();
  }

}

// Called by eibcommunicator when a feedback object value has changed
CThermostat.prototype.updateObject = function(obj,value) {

  if (obj==this.conf.getAttribute("reel-object"))
  {  
    UpdateThermometre("reel",value, this);
  }
  if (obj==this.conf.getAttribute("consigne-object"))
  {
    UpdateThermometre("consigne",value, this);
    this.ConsigneValue=parseFloat(value);
  }
  if (obj==this.conf.getAttribute("ext-object"))
  {
    UpdateThermometre("ext",value, this);
  }
  if (obj==this.conf.getAttribute("mode-object"))
  {
    this.ModeValue=value;
    UpdateMode(this);
  }
};

function UpdateDate(_this)
  {
    var dateDuJour, heures, minutes,secondes;
    dateDuJour = new Date();
    heures = (dateDuJour.getHours() < 10) ? "0"+dateDuJour.getHours() : dateDuJour.getHours();
    minutes = (dateDuJour.getMinutes() < 10) ? "0"+dateDuJour.getMinutes() : dateDuJour.getMinutes();
    if (!_this) $('.HeureLive', ".thermostat").text(heures+":"+minutes); // si _this non définit on met a jour l'heure sur tous les widget "thermostat"
    else $('.HeureLive').text(heures+":"+minutes);
    // $('.JoursLive', _this.div).val($.format.date(dateDuJour,"dd/MM/YYYY"));
  }

function UpdateMode(_this)
  {
    UpdateDate(_this);
    $('#mode', _this.div).text(_this.ModeValue);
    $('#icone_mode', _this.div).html('<img width="20" src="widgets/thermostat/Pictures/'+_this.ModeValue+'.png"/>'); 
  }
  
function NewConsigne(methode, _this)
  {
    UpdateDate(_this);
    var value = _this.ConsigneValue;
    var offset = _this.ConsigneOffset;
    if (methode == "up")
    {
      //value++;
      value = value + offset;
    } else {
      //value--;
      value = value - offset;
    }
    UpdateThermometre("consigne",value, _this);

    //Envoi de la nouvel valeur sur le bus
    //if (!_editMode)
    //{
      var actions = $("actionlist[id=send-consigne]", _this.conf);
      if (actions.length==0 || !actions.length) {
        actions = $('<actionlist id="send-consigne" ></actionlist>');
        _this.conf.appendChild(actions.get(0));
      }
      var action = $("action[id='" + _this.conf.getAttribute("consigne-object") + "']", actions);
      if ( action.attr("type") == "set-value" ) {
        action.remove();
      } 
      actions.append($("<action type='set-value' id='" + _this.conf.getAttribute("consigne-object") + "' value='" + value + "'></action>")[0]);
      if (actions.length>0) EIBCommunicator.executeActionList(actions);
    //}
  }
function NewMode(methode, _this)
  {
    UpdateDate(_this);
    if (_this.ModeValue == 'auto')
    {
      _this.ModeValue='standby';
    } else {
      var IndexMode=Valeur_Mode.indexOf(_this.ModeValue);
      if (methode == "up")
        {
        if (IndexMode ==3)
        IndexMode=0;
        else
        IndexMode++;
        }
      else
        {
        if (IndexMode ==0)
        IndexMode=3;
        else 
        IndexMode--;
        }
      _this.ModeValue=Valeur_Mode[IndexMode];
    }
    UpdateMode(_this);
    
    //Envoi de la nouvel valeur sur le bus
    //if (!_editMode)
    //{
      var actions = $("actionlist[id=send-mode]", _this.conf);
      if (actions.length==0 || !actions.length) {
        actions = $('<actionlist id="send-mode" ></actionlist>');
        _this.conf.appendChild(actions.get(0));
      }
      var action = $("action[id='" + _this.conf.getAttribute("mode-object") + "']", actions);
      if ( action.attr("type") == "set-value" ) {
        action.remove();
      } 
      actions.append($("<action type='set-value' id='" + _this.conf.getAttribute("mode-object") + "' value='" + _this.ModeValue + "'></action>")[0]);
      if (actions.length>0) EIBCommunicator.executeActionList(actions);
    //}
  }
function UpdateThermometre(thermometre,value, _this)
  {
    $("#temperature_"+thermometre, _this.div).attr("title","Thermometre : "+thermometre);
    value = parseFloat(value);
    if (thermometre == "reel") {
      if(_this.valuereel!=0 && _this.valuereel != value) {
        if (_this.valuereel > value) {
          $("#temperature_"+thermometre + ' .moins', _this.div).show();
          $("#temperature_"+thermometre + ' .plus', _this.div).hide();
          $("#temperature_"+thermometre, _this.div).attr("title", "last:"+_this.valuereel+" new:"+value);
        }
        if (_this.valuereel < value) {
          $("#temperature_"+thermometre + ' .moins', _this.div).hide();
          $("#temperature_"+thermometre + ' .plus', _this.div).show();
          $("#temperature_"+thermometre, _this.div).attr("title", "last:"+_this.valuereel+" new:"+value);
        }
      }
    }
    if (thermometre == "ext") {
      if(_this.valueext!=0 && _this.valueext != value) {
        if (_this.valueext > value) {
          $("#temperature_"+thermometre + ' .moins', _this.div).show();
          $("#temperature_"+thermometre + ' .plus', _this.div).hide();
          $("#temperature_"+thermometre, _this.div).attr("title", "last:"+_this.valueext+" new:"+value);
        }
        if (_this.valueext < value) {
          $("#temperature_"+thermometre + ' .moins', _this.div).hide();
          $("#temperature_"+thermometre + ' .plus', _this.div).show();
          $("#temperature_"+thermometre, _this.div).attr("title", "last:"+_this.valueext+" new:"+value);
        }
      }
    }
    if (value >= _this.tempsup) {
      $("#temperature_"+thermometre + ' .temperature', _this.div).css("background","#C80000")
    }
    if (value > _this.tempinf && value < _this.tempsup) {
      $("#temperature_"+thermometre + ' .temperature', _this.div).css("background","#00C800")
    }
    if (value <= _this.tempinf) {
      $("#temperature_"+thermometre + ' .temperature', _this.div).css("background","#0000C8")
    } 

    //value = Math.round(value*100)/100;
    //value = value -(value % _this.mod); // 21.623456 -(21.123456 % 0.5) => 21.5  ( % = modulo )
    if (_this.mod != 0.01) {
      mod = value % _this.mod;
      value = value - mod;
    }
    var pourc = ((_this.tempmax - value) * 100 ) / (_this.tempmax - _this.tempmin)
    
    $("#temperature_"+thermometre + ' .temperature', _this.div).css("height", (100 - pourc)+"%");
    entier = Math.floor(value);
    if (value < 0) entier = entier + 1;
    
    if ( _this.decimal == 1 ) { 
      decimal = Math.round((value - entier) *10);
      str_decimal = decimal;
    } else {
      decimal = Math.round((value - entier) *100);
      if (decimal < 0) decimal = decimal * -1;
      if ( decimal < 10 ) str_decimal = "0"+decimal; else str_decimal = decimal;
    }
 
    $("#temperature_"+thermometre + ' .entiers', _this.div).text(entier);
    $("#temperature_"+thermometre + ' .decimales', _this.div).text(str_decimal);
  }
function loadRuleStatusThermostat(idmode,NbRule,_this) 
	{
	var NextExecMode = '';
	var responseXML=queryLinknx('<read><status></status></read>');
	if (responseXML!=false)
		{
		// ex : <task type="timer" trigger="true" next-exec="2012-1-16 8:30:0" owner="alarmmode" />
		if ($('task[owner="' + idmode + '"]',responseXML)[0])
			{
			var NextExecModeParse = new Date($('task[owner="' + idmode + '"]',responseXML)[0].getAttribute("next-exec"));
			if (NextExecMode >= NextExecModeParse && NextExecModeParse >= new Date() || NextExecMode == '')
				{
				NextExecMode=NextExecModeParse;
				_this.nextexec=$('task[owner="' + idmode + '"]',responseXML)[0].getAttribute("next-exec");
				var RuleModeParse = $('rule[id="' + idmode + '"]', responseXML)[0];
				$('action[type="set-value"]', RuleModeParse).each(function() 
					{
				_this.modenextexec=this.getAttribute('value');
					});
				if ($('rule[id="' + idmode + '"]',responseXML)[0])
				_this.ruleactive = $('rule[id="' + idmode + '"]',responseXML)[0].getAttribute("active");
				
				$("#alarmmodeactive").removeAttr('checked');
				if (_this.ruleactive != "false") 
					{
					$("#alarmmodeactive").attr('checked','1');
					$(".status", _this.div).addClass('active');
					} 
				else 
					{
					$(".status", _this.div).addClass('notactive');
					}
				} 
			}
		} else return false;
	  
	var responseXML=queryLinknx('<read><config><rules></rules></config></read>');
	if (responseXML!=false)
		{
		if ($('rule[id="' + idmode + '"]', responseXML)[0])
			{
			var ConditionValue='';
			var RuleModeParse = $('rule[id="' + idmode + '"]', responseXML)[0];
			$('action[type="set-value"]', RuleModeParse).each(function() 
				{
			ConditionValue=this.getAttribute('value');
				});
			$('condition[type="timer"]', RuleModeParse).each(function() 
				{
				$(this).children("at").each(function () 
					{	
					_this.RulesNbParam=_this.RulesNbParam+1;
					var HtmlCode=AfficheParamRule(ConditionValue, this.getAttribute('wdays'), this.getAttribute('hour'), this.getAttribute('min'),_this);
					$(".Rules",_this.div).append('<div id="Rule_'+_this.RulesNbParam+'">'+HtmlCode+'</div>');
					});
				});
			}
		} 
	else 
		return false;
	}

function ConditionTimer(NbParam,_this) 
	{
	var wdays='';
	for(var j=1;j<=7;j++) 
		{
		if ($('#day_'+NbParam+'_'+j).attr('checked')) 	
			{
			wdays+=j;
			}
		}
	var hour=$('#day_hour_' + NbParam+' option:selected', _this.div).val();
	var min=$('#day_min_' + NbParam+ '  option:selected', _this.div).val();
	var xml= '<condition type="timer" trigger="true"><at hour="'+hour+'" min="'+min+'" wdays="'+wdays+'" /></condition>';
	return xml;
	}
function ValidRulesThConsigne(_this) 
	{
	if (_this.RulesNbParam>0 )
		{
		var RuleConsigneCreate=[];
		for(var i=1;i<=_this.RulesNbParam;i++) 
			{ 
			var Consigne=$('#mode_' + i, _this.div).val();
			if (RuleConsigneCreate.indexOf(Consigne)<0)
				{
				RuleConsigneCreate.push(Consigne);
				var idmode=_this.idrule+"_"+RuleConsigneCreate.length;
				//var idmode=_this.idrule+"_"+Consigne+"deg";
				var xml = '<rule id="'+idmode+'">';
				xml+='<condition type="and" ><condition type="object" id="'+_this.conf.getAttribute("mode-object")+'" op="ne" value="frost" trigger="true"/>';
				//<condition trigger="true" type="timer"><at hour="08" min="20" wdays="1"></at></condition>
				xml+='<condition type="or" >';
				for(var j=1;j<=_this.RulesNbParam;j++) 
					{ 
					if ($('#mode_' + j, _this.div).val()==Consigne)
						{		
						xml+=ConditionTimer(j,_this);
						}
					}
				xml+='</condition>'; 
				xml+='</condition>'; 
				if (!$("actionlist[id=active-action]", _this.conf).get(0)) 
					{
					xml+='<actionlist><action type="set-value" id="'+_this.conf.getAttribute("consigne-object")+'" value="'+Consigne+'"/></actionlist>';			
					}
				else 
					{
					var actions=$("actionlist[id=active-action]", _this.conf).get(0).childNodes;
					if (actions.length>0)
						{
						xml+='<actionlist>';
						for(i=0; i<actions.length; i++)
							{
							var action=actions[i];
							xml+=serializeXmlToString(actions[i]);
							}
						xml+='</actionlist>';
						}
					}
				xml+='</rule>';
				if (xml!=false)
					queryLinknx('<write><config><rules>' + xml + '</rules></config></write>');	
				}
			}	
		for(var i=RuleConsigneCreate.length+1;i<=10;i++) 
			{ 
			var idmode=_this.idrule+"_"+i;
			var responseXML=queryLinknx('<read><config><rules></rules></config></read>');
			if (responseXML!=false)
				{
				if ($('rule[id="' + idmode + '"]', responseXML)[0])
					{
					queryLinknx('<write><config><rules><rule id="'+idmode+'" delete="true"/></rules></config></write>');	
					}
				}	
			}
		}
	else
		return false;
	}
function ValidRulesThMode(idmode,PosRuleActivDiv,_this) 
	{
	var RuleActivDiv="#Rule_"+PosRuleActivDiv;
	if (_this.RulesNbParam>0 )
		{
		var xml = '<rule id="'+idmode+'">';
		xml+='<condition type="and" ><condition type="object" id="'+_this.conf.getAttribute("mode-object")+'" op="ne" value="frost" trigger="true"/>';
		if (_this.RulesNbParam>1)
			xml+='<condition type="or" >';
		//<condition trigger="true" type="timer"><at hour="08" min="20" wdays="1"></at></condition>

		for(var NbParam=1;NbParam<=_this.RulesNbParam;NbParam++) 
			{ 
			if ($('#mode_' + NbParam+' option:selected', _this.div).val() == Valeur_Mode[PosRuleActivDiv])
				{
				xml+=ConditionTimer(NbParam,_this);
				}
			}
		if (_this.RulesNbParam>1)		
			xml+='</condition>'; 	
		xml+='</condition>'; 
		if (!$("actionlist[id=active-action]", _this.conf).get(0)) 
			{
			xml+='<actionlist><action type="set-value" id="'+_this.conf.getAttribute("mode-object")+'" value="'+Valeur_Mode[PosRuleActivDiv]+'"/></actionlist>';
			}
		else 
			{
			var actions=$("actionlist[id=active-action]", _this.conf).get(0).childNodes;
			if (actions.length>0)
				{
				xml+='<actionlist>';
				for(i=0; i<actions.length; i++)
					{
					var action=actions[i];
					xml+=serializeXmlToString(actions[i]);
					}
				xml+='</actionlist>';
				}
			}
		xml+='</rule>';
		return xml;
		}
	else
		return false;
	}
function AfficheParamRule(value, wdays, hour, min,_this) 
	{
	var HTMLgen='<table><tr>';

	for(var j=1;j<=7;j++) 
		{
		HTMLgen+='<td>'+_string_day[j].substr(0,3)+'</td>';
		}

	HTMLgen+='</td><td rowspan="3">';
	HTMLgen+='<div id="'+_this.RulesNbParam+'" class="addRules"><img src="images/add.png"/></div>';
	HTMLgen+='<div id="'+_this.RulesNbParam+'" class="removeRules"><img src="images/remove.png"/></div>';
	HTMLgen+='</tr><tr>';
	for(var j=1;j<=7;j++) 
		{
		HTMLgen+='<td><input ';
		if (wdays.indexOf(j)>=0)
			HTMLgen+='checked ';
		HTMLgen+='id="day_'+_this.RulesNbParam+'_'+j+'" type="checkbox"/></td>';
		}
	HTMLgen+='</tr><tr>';
	HTMLgen+='<td colspan="7"><select id="day_hour_'+_this.RulesNbParam+'">';
	for(var j=0;j<24;j++) 
		{
		HTMLgen+='<option';
		if (hour==j) 
			HTMLgen+=' selected';
		if (j<10) 
			HTMLgen+=' value="' + j + '">0' + j + '</option>'; 
		else
			HTMLgen+=' value="' + j + '">' + j + '</option>';
		}
	HTMLgen+='</select>';
	HTMLgen+='<select id="day_min_'+_this.RulesNbParam+'">';
	for(var j=0;j<60;j+=5) 
		{
		HTMLgen+='<option';
		if (min==j) 
			HTMLgen+=' selected';
		if (j<10) 
			HTMLgen+=' value="' + j + '">0' + j + '</option>'; 
		else
			HTMLgen+=' value="' + j + '">' + j + '</option>';		}
	HTMLgen+='</select>';
	
	if (_this.TypeRules == "Mode") 
		{	
		HTMLgen+='<select id="mode_' + _this.RulesNbParam + '">';
		for(var j=0;j<4;j++) 
			{

			HTMLgen+='<option';
			if (value==Valeur_Mode[j]) 
			 HTMLgen+=' selected';
			HTMLgen+=' value="' + Valeur_Mode[j] + '">' + Valeur_Mode[j] + '</option>'; 

			}
		HTMLgen+='</select>';
		}
	else
		HTMLgen+='<input  id="mode_' + _this.RulesNbParam + '" value="'+value+'" />';
	HTMLgen+='</td></tr></table>';
	return HTMLgen;
	}