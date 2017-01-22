/*
 *
 * Charts with Highcharts / HighStock : highsoft software product is not free for commercial use lock at http://shop.highsoft.com/
 *
 **/

function CCharts_gauge(conf) {
  this.isResizable=false;
  //this.gauge = $(".container", this.div).get(0);
  this.start = 0;
  this.init(conf);
 
  this.refreshHTML();
}

CCharts_gauge.type='charts_gauge';
UIController.registerWidget(CCharts_gauge);
CCharts_gauge.prototype = new CWidget();

// Called by eibcommunicator when a feedback object value has changed
CCharts_gauge.prototype.updateObject = function(obj,value) {};

CCharts_gauge.prototype.deleteWidget = function() {};

// Refresh HTML from config
CCharts_gauge.prototype.refreshHTML = function() {
  this.min = parseFloat(this.conf.getAttribute("min"));
  this.max = parseFloat(this.conf.getAttribute("max"));
  this.unit = this.conf.getAttribute("unit");
  this.title = this.conf.getAttribute("title");
  this.object = this.conf.getAttribute("object");

  $('.container', this.div).highcharts({
    chart: {
      type: 'gauge',
      plotBackgroundColor: null,
      plotBackgroundImage: null,
      plotBorderWidth: 0,
      plotShadow: false
    },
    
    title: {
        text: this.title
    },
    
    pane: {
      startAngle: -150,
      endAngle: 150,
      background: [{
          backgroundColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                  [0, '#FFF'],
                  [1, '#333']
              ]
          },
          borderWidth: 0,
          outerRadius: '109%'
      }, {
          backgroundColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                  [0, '#333'],
                  [1, '#FFF']
              ]
          },
          borderWidth: 1,
          outerRadius: '107%'
      }, {
          // default background
      }, {
          backgroundColor: '#DDD',
          borderWidth: 0,
          outerRadius: '105%',
          innerRadius: '103%'
      }]
    },
       
    // the value axis
    yAxis: {
        min: this.min,
        max: this.max,
        
        minorTickInterval: 'auto',
        minorTickWidth: 1,
        minorTickLength: 10,
        minorTickPosition: 'inside',
        minorTickColor: '#666',

        tickPixelInterval: 30,
        tickWidth: 2,
        tickPosition: 'inside',
        tickLength: 10,
        tickColor: '#666',
        labels: {
            step: 2,
            rotation: 'auto'
        },
        title: {
            text: this.unit
        },
        plotBands: [{
            from: this.min,
            to: this.max - this.max * 40/100,
            color: '#55BF3B' // green
        }, {
            from: this.max - this.max * 40/100,
            to: this.max - this.max * 20/100,
            color: '#DDDF0D' // yellow
        }, {
            from: this.max - this.max * 20/100,
            to: this.max,
            color: '#DF5353' // red
        }]        
    },

    series: [{
        name: 'Value ',
        data: [ (this.min + this.max)/2 ],
        tooltip: {
            valueSuffix: ' ' + this.unit
        }
    }]
	
	}/*, 
	// Add some life
	function (chart) {
		if (!chart.renderer.forExport) {
		    setInterval(function () {
		        var point = chart.series[0].points[0],
		            newVal,
		            inc = Math.round((Math.random() - 0.5) * 20);
		        
		        newVal = point.y + inc;
		        if (newVal < 0 || newVal > 200) {
		            newVal = point.y - inc;
		        }
		        
		        point.update(newVal);
		        
		    }, 3000);
		}
	}*/);
  this.gauge = $('.container', this.div).highcharts();//$('.container', this.div);//.series[0].points[0]
};
// Called by eibcommunicator when a feedback object value has changed
CCharts_gauge.prototype.updateObject = function(obj,value) {

  if (obj==this.object)
  {
    var point = this.gauge.series[0].points[0];
    point.update(parseInt(value));
      
  }
};
