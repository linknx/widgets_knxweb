function CPolygon(conf) {

  $.fx.speeds._default = 1000;
  this.isResizable = true;
  this.init(conf);
  this.shapeMode = false;
  this.inEdition = false;
  this.isMoving = false;
  this.active = false;
  this.data = {};
  this.dataActive = {};
  this.coordsX = new Array();
  this.coordsY = new Array();
  this.x = parseInt(conf.getAttribute('x'));
  this.y = parseInt(conf.getAttribute('y'));
  this.width = parseInt(conf.getAttribute('width'));
  this.height = parseInt(conf.getAttribute('height'));
  this.shapeIndex = 0;

  if (_editMode) {
    if (typeof design !== 'undefined') this.zone = design.currentZone;
    else if (typeof subpages !== 'undefined') this.zone = subpages.currentSubPage;
  } else this.zone = design_view.currentZone;

  this.index = $("#shapes_" + this.zone).children("area[shape='poly']").length;
  $("#shapes_" + this.zone).append('<area id="poly_' + this.zone + this.index + '" shape="poly" coords="0,0">');

  if (_editMode) {

    this.newCoordsX = new Array();
    this.newCoordsY = new Array();
    this.newWidth = this.width;
    this.newHeight = this.height;

    // When the widget is double clicked
    $(this.div).dblclick(function(e) {
      var o = this.owner;
      // if this is a new polygon
      if (o.coordsX.length == 0) {
        // reset shape index
        o.shapeIndex = 0;
        // set shape edit mode
        o.shapeMode = true;
        // add the first point at cursor position
        o.coordsX[0] = Math.round(e.pageX - o.div.offset().left);
        o.coordsY[0] = Math.round(e.pageY - o.div.offset().top);
        // update coordinates on design properties and conf
        updateCoordinates(o);
        // add the first temporary segment from cursor position
        var coords = (o.coordsX[0] + o.x).toString() + "," + (o.coordsY[0] + o.y).toString();
        $("#shapes_" + o.zone).append('<area id="poly_' + o.zone + o.index + '_tmp' + o.shapeIndex + '" shape="poly" coords="' + coords + '">');
      } else {
        // if we are finishing a polygon
        if (o.shapeMode) {
          // build polygon
          buildPolygon(o);
          // unset shape mode
          o.shapeMode = false;
        }
        // enter in edit mode
        editPolygon(o);
      }
      // update ui
      updatePolygonState(o);
    });

    // If the widget is clicked
    $(this.div).click(function() {
      // in shape edit mode
      if (this.owner.shapeMode) {
        var o = this.owner;
        // update index
        o.shapeIndex++;
        // update coordinates on design properties and conf
        updateCoordinates(o);
        // add a new temporary segment from cursor position
        var coords = (o.coordsX[o.shapeIndex] + o.x).toString() + "," + (o.coordsY[o.shapeIndex] + o.y).toString();
        $("#shapes_" + o.zone).append('<area id="poly_' + o.zone + o.index + '_tmp' + o.shapeIndex + '" shape="poly" coords="' + coords + '">');
      }
    });

    // If the cursor mouse over the widget
    $(this.div).mousemove(function(e) {
      // in shape edit mode
      if (this.owner.shapeMode) {
        var o = this.owner;
        var x = Math.round(e.pageX - o.div.offset().left);
        var y = Math.round(e.pageY - o.div.offset().top);
        // skip event if mouse is over the widget resizer
        if ((x > o.width) || (y > o.height)) return;
        // update point at cursor position
        o.coordsX[o.shapeIndex + 1] = x;
        o.coordsY[o.shapeIndex + 1] = y;
        // update the current temporary segment based on cursor position
        var coords = (o.coordsX[o.shapeIndex] + o.x).toString() + "," + (o.coordsY[o.shapeIndex] + o.y).toString() + "," +
                     (o.coordsX[o.shapeIndex + 1] + o.x).toString() + "," + (o.coordsY[o.shapeIndex + 1] + o.y).toString();
        $("#poly_" + o.zone + o.index + "_tmp" + o.shapeIndex).attr("coords", coords);
        $("#poly_" + o.zone + o.index + "_tmp" + o.shapeIndex).data('maphilight', {alwaysOn: true}).trigger("alwaysOn.maphilight");
      }
    });

    // If widget is removed,
    $(this.div).on("remove", function() {
      var o = this.owner;
      // remove polygon area from map,
      $("#poly_" + o.zone + o.index).remove();
      // and force refresh map
      $("#bgImage_" + o.zone).maphilight();
    });

    var $poly = this;

    // Workaround to fix an issue when the design edit page is scrolled with the mainContent scrollbar
    // If so the containment area of internal resizers is no longer correct
    // To fix this issue we detect the stop of scrolling and we remove the resizers to force a refresh of the containment areas
    $("#mainContent").scroll(function() {
      clearTimeout($.data(this, 'scrollTimer'));
      $.data(this, 'scrollTimer', setTimeout(function() {
        if ($poly.inEdition) {
          exitPolygonEdit($poly);
          editPolygon($poly);
        }
      }, 250));
    });

  } else {

    var $poly = this;

    // Map area click (design view mode)
    $("#poly_" + this.zone + this.index).click(function() {
      var answer = true;
      var actions;
      if ($poly.active) {
        if ($poly.dataActive.neverOn) return;
        if ($poly.conf.getAttribute('active-goto') != "") {
          if ($poly.conf.getAttribute('confirm') == "true") answer = confirm(tr("confirm the command"));
          if (answer) gotoZone($poly.conf.getAttribute('active-goto'));
          return;
        }
        actions = $("actionlist[id=active-action]", $poly.conf);
      } else {
        if ($poly.data.neverOn) return;
        if ($poly.conf.getAttribute('inactive-goto') != "") {
          if ($poly.conf.getAttribute('confirm') == "true") answer = confirm(tr("confirm the command"));
          if (answer) gotoZone($poly.conf.getAttribute('inactive-goto'));
          return;
        }
        actions = $("actionlist[id=inactive-action]", $poly.conf);
      }
      //if (actions.children().length > 0) {
      if (actions.length>0) {
        if ($poly.conf.getAttribute('confirm') == "true") answer = confirm(tr("confirm the command"));
        if (answer)  EIBCommunicator.executeActionList(actions);
      }
    });

  }

  this.refreshHTML();

}


CPolygon.type = 'polygon';
UIController.registerWidget(CPolygon);
CPolygon.prototype = new CWidget();


// When the widget is inserted or selected
CPolygon.prototype.onSelect = function() {

  // in edit mode
  if (_editMode) {
    // if the widget is inserted on a subpage
    if (this.div.parent().attr("id") == "widgetsubpagediv") {
      // display a warning
      alert("This widget cannot be used on a subpage!");
      // and delete the widget
      subpages.deleteWidget(this);
    }
  }

}


// When the widget is no more selected
CPolygon.prototype.onDeSelect = function() {

  // exit polygon edit mode
  exitPolygonEdit(this);
  // and update design ui
  updatePolygonState(this);

}


// When the widget moving starts
CPolygon.prototype.onMoveStart = function(left, top) {

  // exit polygon edit mode
  exitPolygonEdit(this);
  // and set moving mode
  this.isMoving = true;

}


// When the widget moving is under process
CPolygon.prototype.onMove = function(left, top) {

  // update polygon position on ui
  updatePosition(this, left, top);

}


// When the widget moving stops
CPolygon.prototype.onMoveStop = function(left, top) {

  // unset moving mode
  this.isMoving = false;
  // and update polygon on ui
  updatePolygonState(this);

}


// When the widget resizing starts
CPolygon.prototype.onResizeStart = function(width, height) {

  // unset any previous edit mode
  exitPolygonEdit(this);
  // set edition mode
  this.inEdition = true;
  // reset coordinates
  this.newCoordsX.length = 0;
  this.newCoordsY.length = 0;

}


// When the widget resizing is under process
CPolygon.prototype.onResize = function(width, height) {

  // update polygon size
  updateSize(this, width, height);

}


// When the widget resizing stops
CPolygon.prototype.onResizeStop = function(width, height) {

  // unset edition mode
  this.inEdition = false;
  // keep new coordinates
  this.coordsX.length = 0;
  this.coordsY.length = 0;
  Array.prototype.push.apply(this.coordsX, this.newCoordsX);
  Array.prototype.push.apply(this.coordsY, this.newCoordsY);
  // update design ui
  updatePolygonState(this);
  // update polygon coordinates with newer values
  updateCoordinates(this);
  this.width = this.newWidth;
  this.height = this.newHeight;

}


// When the widget is loaded or a conf modification happens in edit mode
CPolygon.prototype.refreshHTML = function() {

  // Load settings for inactive state
  if (_editMode) {
    // Always display polygon in edit mode
    this.data.neverOn = false;
    this.data.alwaysOn = true;
  } else {
    this.data.neverOn = (this.conf.getAttribute("inactive-display") == "false") ? true : false;
    this.data.alwaysOn = (this.conf.getAttribute("inactive-alwayson") == "true") ? true : false;
    this.data.fade = (this.conf.getAttribute("inactive-fade") == "true") ? true : false;
  }
  this.data.fill = (this.conf.getAttribute("background-fill") == "true") ? true : false;
  var fillColor = this.conf.getAttribute("background-color");
  if (fillColor != "") this.data.fillColor = fillColor.substring(1, fillColor.length);
  var fillOpacity = parseFloat(this.conf.getAttribute("background-opacity"));
  if (!isNaN(fillOpacity) && (fillOpacity >= 0) && (fillOpacity <= 1)) this.data.fillOpacity = fillOpacity;
  this.data.stroke = (this.conf.getAttribute("stroke-display") == "true") ? true : false;
  var strokeColor = this.conf.getAttribute("stroke-color");
  if (strokeColor != "") this.data.strokeColor = strokeColor.substring(1, strokeColor.length);
  var strokeOpacity = parseFloat(this.conf.getAttribute("stroke-opacity"));
  if (!isNaN(strokeOpacity) && (strokeOpacity >= 0) && (strokeOpacity <= 1)) this.data.strokeOpacity = strokeOpacity;
  var strokeWidth = parseInt(this.conf.getAttribute("stroke-width"));
  if (!isNaN(strokeWidth) && (strokeWidth >= 0) && (strokeWidth <= 100)) this.data.strokeWidth = strokeWidth;
  this.data.shadow = (this.conf.getAttribute("shadow-display") == "true") ? true : false;
  var shadowX = this.conf.getAttribute("shadow-x");
  if (!isNaN(shadowX) && (shadowX >= 0) && (shadowX <= 100)) this.data.shadowX = shadowX;
  var shadowY = this.conf.getAttribute("shadow-y");
  if (!isNaN(shadowY) && (shadowY >= 0) && (shadowY <= 100)) this.data.shadowY = shadowY;
  var shadowRadius = this.conf.getAttribute("shadow-radius");
  if (!isNaN(shadowRadius) && (shadowRadius >= 0) && (shadowRadius <= 100)) this.data.shadowRadius = shadowRadius;
  var shadowColor = this.conf.getAttribute("shadow-color");
  if (shadowColor != "") this.data.shadowColor = shadowColor.substring(1, shadowColor.length);
  var shadowOpacity = parseFloat(this.conf.getAttribute("shadow-opacity"));
  if (!isNaN(shadowOpacity) && (shadowOpacity >= 0) && (shadowOpacity <= 1)) this.data.shadowOpacity = shadowOpacity;
  if (this.conf.getAttribute("shadow-position") == "outside") this.data.shadowPosition = "outside";
  else if (this.conf.getAttribute("shadow-position") == "inside") this.data.shadowPosition = "inside";
  else this.data.shadowPosition = "both";
  if (this.conf.getAttribute("shadow-from") == "stroke") this.data.shadowFrom = "stroke";
  else if (this.conf.getAttribute("shadow-from") == "fill") this.data.shadowFrom = "fill";
  else this.data.shadowFrom = false;

  // Load settings for active state
  if (_editMode) {
    // Always display polygon in edit mode
    this.dataActive.neverOn = false;
    this.dataActive.alwaysOn = true;
  } else {
    this.dataActive.neverOn = (this.conf.getAttribute("active-display") == "false") ? true : false;
    this.dataActive.alwaysOn = (this.conf.getAttribute("active-alwayson") == "true") ? true : false;
    this.dataActive.fade = (this.conf.getAttribute("active-fade") == "true") ? true : false;
  }
  this.dataActive.fill = (this.conf.getAttribute("background-active-fill") == "true") ? true : false;
  fillColor = this.conf.getAttribute("background-active-color");
  if (fillColor != "") this.dataActive.fillColor = fillColor.substring(1, fillColor.length);
  fillOpacity = parseFloat(this.conf.getAttribute("background-active-opacity"));
  if (!isNaN(fillOpacity) && (fillOpacity >= 0) && (fillOpacity <= 1)) this.dataActive.fillOpacity = fillOpacity;
  this.dataActive.stroke = (this.conf.getAttribute("stroke-active-display") == "true") ? true : false;
  strokeColor = this.conf.getAttribute("stroke-active-color");
  if (strokeColor != "") this.dataActive.strokeColor = strokeColor.substring(1, strokeColor.length);
  strokeOpacity = parseFloat(this.conf.getAttribute("stroke-active-opacity"));
  if (!isNaN(strokeOpacity) && (strokeOpacity >= 0) && (strokeOpacity <= 1)) this.dataActive.strokeOpacity = strokeOpacity;
  strokeWidth = parseInt(this.conf.getAttribute("stroke-active-width"));
  if (!isNaN(strokeWidth) && (strokeWidth >= 0) && (strokeWidth <= 100)) this.dataActive.strokeWidth = strokeWidth;
  this.dataActive.shadow = (this.conf.getAttribute("shadow-active-display") == "true") ? true : false;
  shadowX = this.conf.getAttribute("shadow-active-x");
  if (!isNaN(shadowX) && (shadowX >= 0) && (shadowX <= 100)) this.dataActive.shadowX = shadowX;
  shadowY = this.conf.getAttribute("shadow-active-y");
  if (!isNaN(shadowY) && (shadowY >= 0) && (shadowY <= 100)) this.dataActive.shadowY = shadowY;
  shadowRadius = this.conf.getAttribute("shadow-active-radius");
  if (!isNaN(shadowRadius) && (shadowRadius >= 0) && (shadowRadius <= 100)) this.dataActive.shadowRadius = shadowRadius;
  shadowColor = this.conf.getAttribute("shadow-active-color");
  if (shadowColor != "") this.dataActive.shadowColor = shadowColor.substring(1, shadowColor.length);
  shadowOpacity = parseFloat(this.conf.getAttribute("shadow-active-opacity"));
  if (!isNaN(shadowOpacity) && (shadowOpacity >= 0) && (shadowOpacity <= 1)) this.dataActive.shadowOpacity = shadowOpacity;
  if (this.conf.getAttribute("shadow-active-position") == "outside") this.dataActive.shadowPosition = "outside";
  else if (this.conf.getAttribute("shadow-active-position") == "inside") this.dataActive.shadowPosition = "inside";
  else this.dataActive.shadowPosition = "both";
  if (this.conf.getAttribute("shadow-active-from") == "stroke") this.dataActive.shadowFrom = "stroke";
  else if (this.conf.getAttribute("shadow-active-from") == "fill") this.dataActive.shadowFrom = "fill";
  else this.dataActive.shadowFrom = false;

  // Load common settings
  var x = parseInt(this.conf.getAttribute("x"));
  this.x = (isNaN(x)) ? this.x : x;
  var y = parseInt(this.conf.getAttribute("y"));
  this.y = (isNaN(y)) ? this.y : y;

  // if at least one point exists
  if (getCoordinates(this) > 0) {
    // set initial position of polygon from conf
    updatePosition(this, this.x, this.y);
  } else {
    // otherwise hide it
    $("#poly_" + this.zone + this.index).attr("coords", "0,0");
    // force refresh map
    $("#bgImage_" + this.zone).maphilight();
  }

  // Update size and coordinates in case of modification from design property tab
  if (_editMode) {
    var width = parseInt(this.conf.getAttribute("width"));
    this.newWidth = (isNaN(width) || (width < 0)) ? this.width : width;
    var height = parseInt(this.conf.getAttribute("height"));
    this.newHeight = (isNaN(height) || (height < 0)) ? this.height : height;
    // Update polygon dimensions if necessary
    if ((this.width != this.newWidth) || (this.height != this.newHeight)) {
      updateSize(this, this.newWidth, this.newHeight)
      this.width = this.newWidth;
      this.height = this.newHeight;
    }
    // Update coordinates on design properties and conf
    updateCoordinates(this);
  }

  // Initialize HTML
  updatePolygonState(this);

  // If we are in edit mode, leave polygon edition
  if (_editMode) exitPolygonEdit(this);
  // Hide the div in design view mode as it prevents to click on map area
  else $(this.div).hide();
}


// Called cyclically by eibcommunicator
CPolygon.prototype.updateObject = function(obj, value) {

  if (obj == this.conf.getAttribute("feedback-object")) {
    var val = value;
    var prevState = this.active;
    if (parseFloat(val)) val = parseFloat(value);
    var feedback_val = this.conf.getAttribute("feedback-value");
    if (parseFloat(feedback_val)) feedback_val = parseFloat(this.conf.getAttribute("feedback-value"));
    switch (this.conf.getAttribute("feedback-compare")) {
      case 'eq':
        this.active = (val == feedback_val);
        break;
      case 'neq':
        this.active = (val != feedback_val);
        break;
      case 'gt':
        this.active = (val > feedback_val);
        break;
      case 'lt':
        this.active = (val < feedback_val);
        break;
      case 'gte':
        this.active = (val >= feedback_val);
        break;
      case 'lte':
        this.active = (val<=feedback_val);
        break;
      default:
        this.active = false;
    }
    // Only update polygon state if required
    if (this.active != prevState) updatePolygonState(this);
  }

};


// Build polygon
function buildPolygon(o) {

  var coords = "";
  $(o.coordsX).each( function(index, item) {
    coords = coords + (item + o.x).toString() + "," + (o.coordsY[index] + o.y).toString() + ",";
  });
  coords = coords.substring(0, coords.length - 1);
  $("#poly_" + o.zone + o.index).attr("coords", coords);
  // remove temporary segments
  $("[id^=poly_" + o.zone + o.index + "_tmp]").remove();

}


// Exit resizing mode (called when user click outside a resizer)
function exitPolygonEdit(o) {

  $('.cornerResizers', o.div).remove();
  $('.medianResizers', o.div).remove();
  o.inEdition = false;
  // If we are in shape mode
  if (o.shapeMode) {
    // finish the polygon if the widget is deselected moved or resized
    $(o.div).click();
    // remove any temporary segments
    $("[id^=poly_" + o.zone + o.index + "_tmp]").remove();
    // remove unwanted point
    removePoint(o, o.shapeIndex + 1);
    // quit shape mode
    o.shapeMode = false;
  }

}


// Edit polygon by adding resizers to corner and median points
// Move of a corner resizer will move corner position
// Move of a median resizer will create a new corner
// New median resizers are added when a corner is created
// Right click on a corner resizer will delete it
function editPolygon(o) {

  // Set polygon resizing mode
  o.inEdition = true;

  $(o.coordsX).each( function(index, item) {

    var cornerDiv=$('<div id="corner_' + index + '" class="cornerResizers"></div>');
    var interDiv=$('<div id="inter_' + index + '" class="medianResizers"></div>');

    // Add resizers
    o.div.append(cornerDiv);
    o.div.append(interDiv);

    // Set and fix resizer dimensions if neeeded (only even values allowed)
    var cornerWidth = parseInt(cornerDiv.css('width').replace(/px$/,""));
    if (cornerWidth % 2 != 0) {
      cornerWidth++;
      cornerDiv.css('width', cornerWidth.toString() + 'px');
    }
    var cornerHeight = parseInt(cornerDiv.css('height').replace(/px$/,""));
    if (cornerHeight % 2 != 0) {
      cornerHeight++;
      cornerDiv.css('height', cornerHeight.toString() + 'px');
    }
    var interWidth = parseInt(interDiv.css('width').replace(/px$/,""));
    if (interWidth % 2 != 0) {
      interWidth++;
      interDiv.css('width', interWidth.toString() + 'px');
    }
    var interHeight = parseInt(interDiv.css('height').replace(/px$/,""));
    if (interHeight % 2 != 0) {
      interHeight++;
      interDiv.css('height', interHeight.toString() + 'px');
    }

    // Set corner resizer position
    cornerDiv.css('left', Math.round(item - (cornerWidth / 2) - 1) + 'px');
    cornerDiv.css('top', Math.round(o.coordsY[index] - (cornerHeight / 2) - 1) + 'px');

    // Set median resizer position
    if (index == (o.coordsX.length - 1)) {
      interDiv.css('left', Math.round(((item + o.coordsX[0]) / 2) - (interWidth / 2) - 1) + 'px');
      interDiv.css('top', Math.round(((o.coordsY[index] + o.coordsY[0]) / 2) - (interHeight / 2) - 1) + 'px');
    } else {
      interDiv.css('left', Math.round(((item + o.coordsX[index + 1]) / 2) - (interWidth / 2) - 1) + 'px');
      interDiv.css('top', Math.round(((o.coordsY[index] + o.coordsY[index + 1]) / 2) - (interHeight / 2) - 1) + 'px');
    }

    var grid = [1,1];

    // If more than one corner
    if (o.coordsX.length > 1) {

      // Set the dragging area for corner resizer
      var xc1 = Math.round(o.div.offset().left) - (cornerWidth / 2) - 1;
      var yc1 = Math.round(o.div.offset().top) - (cornerHeight / 2) - 1;
      var xc2 = Math.round(o.div.offset().left + o.div.width()) - (cornerWidth / 2);
      var yc2 = Math.round(o.div.offset().top + o.div.height()) - (cornerHeight / 2);
      // Setup dragging for corner resizer
      cornerDiv.draggable({
        containment: [xc1, yc1, xc2, yc2],
        scroll: false,
        opacity: 0.50,
        zIndex: 500,
        delay: 50,
        grid: grid,
        drag: function(e, ui) {
          // Get middle position of resizer
          var x = Math.round(ui.position.left) + (cornerWidth / 2) + 1;
          var y = Math.round(ui.position.top) + (cornerHeight / 2) + 1;
          // Update position of polygon point on ui
          updatePoint(o, index, x, y);
          // Update position of left median resizer (from inside polygon view)
          if (index == 0) {
            $("#inter_" + (o.coordsX.length - 1)).css('left', Math.round(((x + o.coordsX[o.coordsX.length - 1]) / 2) - (interWidth / 2) - 1) + 'px');
            $("#inter_" + (o.coordsY.length - 1)).css('top', Math.round(((y + o.coordsY[o.coordsY.length - 1]) / 2) - (interHeight / 2) - 1) + 'px');
          } else {
            $("#inter_" + (index - 1)).css('left', Math.round(((x + o.coordsX[index - 1]) / 2) - (interWidth / 2) - 1) + 'px');
            $("#inter_" + (index - 1)).css('top', Math.round(((y + o.coordsY[index - 1]) / 2) - (interHeight / 2) - 1) + 'px');
          }
          // Update position of right median resizer (from inside polygon view)
          if (index == (o.coordsX.length - 1)) {
            $("#inter_" + index).css('left', Math.round(((x + o.coordsX[0]) / 2) - (interWidth / 2) - 1) + 'px');
            $("#inter_" + index).css('top', Math.round(((y + o.coordsY[0]) / 2) - (interHeight / 2) - 1) + 'px');
          } else {
            $("#inter_" + index).css('left', Math.round(((x + o.coordsX[index + 1]) / 2) - (interWidth / 2) - 1) + 'px');
            $("#inter_" + index).css('top', Math.round(((y + o.coordsY[index + 1]) / 2) - (interHeight / 2) - 1) + 'px');
          }
        },
        stop: function(e, ui) {
          // Get cursor position relatively to the container div
          var cursorX = Math.round(e.pageX - o.div.offset().left);
          var cursorY = Math.round(e.pageY - o.div.offset().top);
          // Fix point position if the cursor is outside the container div
          fixPoint(o, index, cursorX, cursorY);
          // Get middle position of resizer
          var x = Math.round(ui.position.left) + (cornerWidth / 2) + 1;
          var y = Math.round(ui.position.top) + (cornerHeight / 2) + 1;
          // Fix a point position after dragging of the resizer if the cursor is outside the main div
          // In this case the polygon may not be properly aligned with the container div
          // Root cause: Approximations induced by the use of the round function
          fixPoint(o, index, x, y);
          // Update coordinates on design properties and conf
          updateCoordinates(o);
        }
      });

      // Catch right click on corner resizer and remove point
      cornerDiv.contextmenu(function() {
        var o = $(this).parent()[0].owner;
        removePoint(o, index);
        // Update coordinates on design properties and conf
        updateCoordinates(o);
        // Refresh resizers
        exitPolygonEdit(o);
        editPolygon(o);
        // Prevent menu displaying
        return false;
      });
    }

    // Set the dragging area for median resizer
    var xi1 = Math.round(o.div.offset().left) - (interWidth / 2) - 1;
    var yi1 = Math.round(o.div.offset().top) - (interHeight / 2) - 1;
    var xi2 = Math.round(o.div.offset().left + o.div.width()) - (interWidth / 2);
    var yi2 = Math.round(o.div.offset().top + o.div.height()) - (interHeight / 2);

    // Setup dragging for median resizer
    interDiv.draggable({
      containment: [xi1, yi1, xi2, yi2],
      scroll: false,
      opacity: 0.50,
      zIndex: 500,
      delay: 50,
      grid: grid,
      start: function(e, ui) {
        // Get middle position of resizer
        var x = Math.round(ui.position.left) + (interWidth / 2) + 1;
        var y = Math.round(ui.position.top) + (interHeight / 2) + 1;
        // Add a new point for the polygon
        o.coordsX.splice(index + 1, 0, x);
        o.coordsY.splice(index + 1, 0, y);
      },
      drag: function(e, ui) {
        // Get middle position of resizer
        var x = Math.round(ui.position.left) + (interWidth / 2) + 1;
        var y = Math.round(ui.position.top) + (interHeight / 2) + 1;
        // Update position of polygon point on ui
        updatePoint(o, index + 1, x, y);
      },
      stop: function(e, ui) {
        // Get cursor position relatively to the container div
        var x = Math.round(e.pageX - o.div.offset().left);
        var y = Math.round(e.pageY - o.div.offset().top);
        // Fix a point position after dragging of the resizer if the cursor is outside the main div
        // In this case the polygon may not be properly aligned with the container div
        fixPoint(o, index + 1, x, y);
        // Update coordinates on design properties and conf
        updateCoordinates(o);
        // Refresh resizers
        exitPolygonEdit(o);
        editPolygon(o);
      }
    });
  });

}


// Get coordinates from conf
function getCoordinates(o) {

  var coordsX = o.conf.getAttribute("x-coords").split(",");
  var coordsY = o.conf.getAttribute("y-coords").split(",");

  if ((coordsX[0].length == 0) || (coordsY[0].length == 0)) return 0;

  var i = 0;
  o.coordsX.length = 0;
  o.coordsY.length = 0;

  var nbCoords = (coordsX.length > coordsY.length) ? coordsX.length : coordsY.length;

  for (i = 0; i < nbCoords; i++) {
    var coordX = parseInt(coordsX[i]);
    var coordY = parseInt(coordsY[i]);
    // Set temporary value if coordinate is not set or not valid
    if (isNaN(coordX)) coordX = 0;
    if (isNaN(coordY)) coordY = 0;
    // Keep the polygon inside the widget in case user enter not in range coordinates
    if (coordX < 0) coordX = 0;
    else if (coordX > o.width) coordX = parseInt(o.width);
    if (coordY < 0) coordY = 0;
    else if (coordY > o.height) coordY = parseInt(o.height);
    // Add coordinates
    o.coordsX.push(coordX);
    o.coordsY.push(coordY);
  }

  // Return the number of points
  return nbCoords;

}


// Fix a point position after dragging of the resizer if the cursor is outside the main div
// In this case the polygon may not be properly aligned with the container div
function fixPoint(o, i, x, y) {

  var fixCoord = false;

  if ((o.coordsX[i] <= 0) || (x <= 0)) {
    o.coordsX[i] = 0;
    fixCoord = true;
  } else if ((o.coordsX[i] >= o.width) || (x >= o.width)) {
    o.coordsX[i] = o.width;
    fixCoord = true;
  }

  if ((o.coordsY[i] <= 0) || (y <= 0)) {
    o.coordsY[i] = 0;
    fixCoord = true;
  } else if ((o.coordsY[i] >= o.height) || (y >= o.height)) {
    o.coordsY[i] = o.height;
    fixCoord = true;
  }

  if (fixCoord) updatePoint(o, i, o.coordsX[i], o.coordsY[i]);

}


// Update coordinates after resizing
function updateCoordinates(o) {

  var coordX = "";
  var coordY = "";

  $(o.coordsX).each( function(index, item) {
    coordX = coordX + item + ",";
    coordY = coordY + o.coordsY[index] + ",";
  });
  coordX = coordX.substring(0, coordX.length - 1);
  coordY = coordY.substring(0, coordY.length - 1);

  // Update conf
  o.conf.setAttribute("x-coords", coordX);
  o.conf.setAttribute("y-coords", coordY);

  // Update design widget properties
  $("input[name='x-coords']", "#tab-design-widget-properties tbody").val(coordX);
  $("input[name='y-coords']", "#tab-design-widget-properties tbody").val(coordY);

}


// Update polygon position on first display or when dragging the widget
function updatePosition(o, x, y) {

  o.x = x;
  o.y = y;

  if (o.coordsX.length == 0) return;

  var coords = "";

  $(o.coordsX).each( function(index, item) {
    coords = coords + (x + item).toString() + "," + (y + o.coordsY[index]).toString() + ",";
  });
  coords = coords.substring(0, coords.length - 1);

  $("#poly_" + o.zone + o.index).attr("coords", coords);
  updatePolygonState(o);

}


// Remove a point on the polygon
function removePoint(o, i) {

  var coords = "";
  o.coordsX.splice(i, 1);
  o.coordsY.splice(i, 1);

  $(o.coordsX).each( function(index, item) {
    coords = coords + (item + o.x).toString() + "," + (o.coordsY[index] + o.y).toString() + ",";
  });
  coords = coords.substring(0, coords.length - 1);

  $("#poly_" + o.zone + o.index).attr("coords", coords);
  updatePolygonState(o)

}


// Update polygon point position (x, y) when internal resizer is used
function updatePoint(o, i, x, y) {

  var coords = "";
  o.coordsX[i] = x;
  o.coordsY[i] = y;

  $(o.coordsX).each( function(index, item) {
    coords = coords + (item + o.x).toString() + "," + (o.coordsY[index] + o.y).toString() + ",";
  });
  coords = coords.substring(0, coords.length - 1);

  $("#poly_" + o.zone + o.index).attr("coords", coords);
  updatePolygonState(o)

}


// Update polygon size when resizing the widget
function updateSize(o, w, h) {

  var coords = "";
  var ratioX = (o.width == 0) ? 0 : (w / o.width);
  var ratioY = (o.height == 0) ? 0 : (h / o.height);

  o.newWidth = w;
  o.newHeight = h;

  if (o.coordsX.length == 0) return;

  $(o.coordsX).each( function(index, item) {
    var coordX = Math.round(ratioX * item);
    var coordY = Math.round(ratioY * o.coordsY[index]);
    o.newCoordsX[index] = coordX;
    o.newCoordsY[index] = coordY;
    coords = coords + (coordX + o.x).toString() + "," + (coordY + o.y).toString() + ",";
  });
  coords = coords.substring(0, coords.length - 1);

  $("#poly_" + o.zone + o.index).attr("coords", coords);

  updatePolygonState(o);

}


function updatePolygonState(o) {

  // Minimal display in edit mode
  if (_editMode) {
    // If widget is under resizing or moving process
    if (o.inEdition || o.isMoving) {
      // Set the map area to default color settings to help alignment on background image (border with red color and background transparency)
      $("#poly_" + o.zone + o.index).data('maphilight', {alwaysOn: true}).trigger("alwaysOn.maphilight");
      return;
    }
    // Display active settings if required
    if (o.conf.getAttribute("editmode-display-active") == "true") $("#poly_" + o.zone + o.index).data('maphilight', o.dataActive).trigger("alwaysOn.maphilight");
    else $("#poly_" + o.zone + o.index).data('maphilight', o.data).trigger("alwaysOn.maphilight");
    return;
  }

  // Update map area based on status
  if (o.active) $("#poly_" + o.zone + o.index).data('maphilight', o.dataActive).trigger("alwaysOn.maphilight");
  else $("#poly_" + o.zone + o.index).data('maphilight', o.data).trigger("alwaysOn.maphilight");

  // Display pointer if actions exists
  var cursorPointer = false;
  if (o.active) {
    if (!o.dataActive.neverOn) {
      if (o.conf.getAttribute('active-goto') != "") cursorPointer = true;
      else {
        var actions = $("actionlist[id=active-action]", o.conf);
        if (actions.children().length > 0) cursorPointer = true;
      }
    }
  } else {
    if (!o.data.neverOn) {
      if (o.conf.getAttribute('inactive-goto') != "") cursorPointer = true;
      else {
        var actions = $("actionlist[id=inactive-action]", o.conf);
        if (actions.children().length > 0) cursorPointer = true;
      }
    }
  }
  if (cursorPointer) $("#poly_" + o.zone + o.index).css("cursor", "pointer");
  else $("#poly_" + o.zone + o.index).css("cursor", "default");

}
