/*!
 * jquery.drawPieChart.js
 * Version: 0.3(Beta)
 * Inspired by Chart.js(http://www.chartjs.org/)
 *
 * Copyright 2013 hiro
 * https://github.com/githiro/drawPieChart
 * Released under the MIT license.
 *
 * Modified by Madara Uchiha for non-jQuery environment.
 */
;(function() {

  function extend(){
    for(var i=1; i<arguments.length; i++)
      for(var key in arguments[i])
        if(arguments[i].hasOwnProperty(key))
          arguments[0][key] = arguments[i][key];
    return arguments[0];
  }

  function firstElementFromHtmlString(string) {
    var div = document.createElement('div');
    div.innerHTML = string;
    return div.childNodes[0];
  }

  window.drawPieChart = function(data, options) {
      var W = this.clientWidth,
        H = this.clientHeight,
        y = 0;

    if (options.legend) {
        var legend = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        legend.classList.add("legend");
        data.forEach(function (cData) {
            var c = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute("width", "10");
            rect.setAttribute("height", "10");
            c.setAttribute("transform", "translate(0," + (150 + (y += 20)) + ")");
            var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.innerHTML = cData.title;
            text.setAttribute("y", 11);
            text.setAttribute("x", 20);

            rect.setAttribute("fill", cData.color);

            c.appendChild(rect);
            c.appendChild(text);
            legend.appendChild(c);
        });
        H -= y;
    }

    var centerX = W/2,
      centerY = H/2,
      cos = Math.cos,
      sin = Math.sin,
      PI = Math.PI,
      settings = extend({
        segmentShowStroke : true,
        segmentStrokeColor : "#fff",
        segmentStrokeWidth : 1,
        baseColor: "#fff",
        baseOffset: 15,
        edgeOffset: 30,//offset from edge of this
        pieSegmentGroupClass: "pieSegmentGroup",
        pieSegmentClass: "pieSegment",
        lightPiesOffset: 12,//lighten pie's width
        lightPiesOpacity: .3,//lighten pie's default opacity
        lightPieClass: "lightPie",
        animation : true,
        animationSteps : 90,
        animationEasing : "easeInOutExpo",
        tipOffsetX: 0,
        tipOffsetY: -50,
        tipClass: "pieTip",
        beforeDraw: function(){  },
        afterDrawed : function(){  },
        onPieMouseenter : function(e,data){  },
        onPieMouseleave : function(e,data){  },
        onPieClick : function(e,data){  },
        legend: false
      }, options),
      animationOptions = {
        linear : function (t){
          return t;
        },
        easeInOutExpo: function (t) {
          var v = t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t;
          return (v>1) ? 1 : v;
        }
      },
      requestAnimFrame = function(){
        return window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.oRequestAnimationFrame ||
          window.msRequestAnimationFrame ||
          function(callback) {
            window.setTimeout(callback, 1000 / 60);
          };
      }();

    var wrapper = firstElementFromHtmlString('<svg width="' + W + '" height="' + (H + y) + '" viewBox="0 0 ' + W + ' ' + (H + y) + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"></svg>');
    this.appendChild(wrapper);

    var groups = [],
        pies = [],
        lightpies = [],
        easingFunction = animationOptions[settings.animationEasing],
        pieRadius = Min([H/2,W/2]) - settings.edgeOffset,
        segmentTotal = 0;

    //Draw base circle
    var drawBasePie = function(){
      var base = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      wrapper.appendChild(base);
      base.classList.add("pie");
      base.setAttribute("cx", centerX);
      base.setAttribute("cy", centerY);
      base.setAttribute("r", pieRadius+settings.baseOffset);
      base.setAttribute("fill", settings.baseColor);
    }();

    if (options.legend) {
        legend.setAttribute("transform", "translate(0," + pieRadius  + ")");
    }

    //Set up pie segments wrapper
    var pathGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    pathGroup.setAttribute("opacity",0);
    wrapper.appendChild(pathGroup);

    //Set up tooltip
    var tip = document.createElement('div');
    if (settings.tipClass) { tip.classList.add(settings.tipClass); }
    tip.style.transition = 'opacity 0.2s';
    document.body.appendChild(tip);
    tip.style.opacity = 0;
      var tipW = tip.clientWidth,
      tipH = tip.clientHeight;

    for (var i = 0, len = data.length; i < len; i++){
      segmentTotal += data[i].value;
      var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      // Firefox only has the .dataset property on HTMLElements. This is an Element.
      // Adding minimal shim.
      if (typeof g.dataset === 'undefined') {
        g.dataset = {};
      }
      g.dataset.order = i;
      g.setAttribute("class", settings.pieSegmentGroupClass);
      groups[i] = g;
      pathGroup.appendChild(g);
      groups[i].addEventListener("mouseenter", pathMouseEnter);
      groups[i].addEventListener("mouseleave", pathMouseLeave);
      groups[i].addEventListener("mousemove", pathMouseMove);
      groups[i].addEventListener("click", pathClick);

      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute("stroke-width", settings.segmentStrokeWidth);
      p.setAttribute("stroke", settings.segmentStrokeColor);
      p.setAttribute("stroke-miterlimit", 2);
      p.setAttribute("fill", data[i].color);
      p.setAttribute("class", settings.pieSegmentClass);
      pies[i] = p;
      groups[i].appendChild(p);

      if (options.legend) {
        wrapper.appendChild(legend);
      }

      var lp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      lp.setAttribute("stroke-width", settings.segmentStrokeWidth);
      lp.setAttribute("stroke", settings.segmentStrokeColor);
      lp.setAttribute("stroke-miterlimit", 2);
      lp.setAttribute("fill", data[i].color);
      lp.setAttribute("opacity", settings.lightPiesOpacity);
      lp.setAttribute("class", settings.lightPieClass);

      lp.style.transition = 'opacity .1s';
      lightpies[i] = lp;
      groups[i].appendChild(lp);
    }

    settings.beforeDraw.call(this);
    //Animation start
    triggerAnimation();

    function pathMouseEnter(e){
      var index = this.dataset.order;
      tip.textContent = data[index].title + ": " + data[index].value;
      tip.style.opacity = 1;
      if (groups[index].getAttribute("data-active") !== "active"){
        lightpies[index].style.opacity = .8;
      }
      settings.onPieMouseenter.apply(this,[e,data]);
    }
    function pathMouseLeave(e){
      var index = this.dataset.order;
      tip.style.opacity = 0;
      if (groups[index].getAttribute("data-active") !== "active"){
        lightpies[index].style.opacity = settings.lightPiesOpacity;
      }
      settings.onPieMouseleave.apply(this,[e,data]);
    }
    function pathMouseMove(e){
        tip.style.top = (e.pageY + settings.tipOffsetY) + "px";
        tip.style.left = (e.pageX - tip.clientWidth / 2 + settings.tipOffsetX) + "px";
    }
    function pathClick(e){
      var index = this.dataset.order;
      var targetGroup = groups[index];
      for (var i = 0, len = data.length; i < len; i++){
        if (i === index) continue;
        groups[i].setAttribute("data-active","");
        lightpies[i].style.opacity = settings.lightPiesOpacity;
      }
      if (targetGroup.getAttribute("data-active") === "active"){
        targetGroup.setAttribute("data-active","");
        lightpies[index].style.opacity = .8;
      } else {
        targetGroup.setAttribute("data-active","active");
        lightpies[index].style.opacity = 1;
      }
      settings.onPieClick.apply(this,[e,data]);
    }
    function drawPieSegments (animationDecimal){
      var startRadius = -PI/2,//-90 degree
          rotateAnimation = 1;
      if (settings.animation) {
        rotateAnimation = animationDecimal;//count up between0~1
      }

      pathGroup.setAttribute("opacity",animationDecimal);

      //draw each path
      for (var i = 0, len = data.length; i < len; i++){
        var segmentAngle = rotateAnimation * ((data[i].value/segmentTotal) * (PI*2)),//start radian
            endRadius = startRadius + segmentAngle,
            largeArc = ((endRadius - startRadius) % (PI * 2)) > PI ? 1 : 0,
            startX = centerX + cos(startRadius) * pieRadius,
            startY = centerY + sin(startRadius) * pieRadius,
            endX = centerX + cos(endRadius) * pieRadius,
            endY = centerY + sin(endRadius) * pieRadius,
            startX2 = centerX + cos(startRadius) * (pieRadius + settings.lightPiesOffset),
            startY2 = centerY + sin(startRadius) * (pieRadius + settings.lightPiesOffset),
            endX2 = centerX + cos(endRadius) * (pieRadius + settings.lightPiesOffset),
            endY2 = centerY + sin(endRadius) * (pieRadius + settings.lightPiesOffset);
        var cmd = [
          'M', startX, startY,//Move pointer
          'A', pieRadius, pieRadius, 0, largeArc, 1, endX, endY,//Draw outer arc path
          'L', centerX, centerY,//Draw line to the center.
          'Z'//Cloth path
        ];
        var cmd2 = [
          'M', startX2, startY2,
          'A', pieRadius + settings.lightPiesOffset, pieRadius + settings.lightPiesOffset, 0, largeArc, 1, endX2, endY2,//Draw outer arc path
          'L', centerX, centerY,
          'Z'
        ];
        pies[i].setAttribute("d",cmd.join(' '));
        lightpies[i].setAttribute("d", cmd2.join(' '));
        startRadius += segmentAngle;
      }
    }

    var animFrameAmount = (settings.animation)? 1/settings.animationSteps : 1,//if settings.animationSteps is 10, animFrameAmount is 0.1
        animCount =(settings.animation)? 0 : 1;
    function triggerAnimation(){
      if (settings.animation) {
        requestAnimFrame(animationLoop);
      } else {
        drawPieSegments(1);
      }
    }
    function animationLoop(){
      animCount += animFrameAmount;//animCount start from 0, after "settings.animationSteps"-times executed, animCount reaches 1.
      drawPieSegments(easingFunction(animCount));
      if (animCount < 1){
        requestAnimFrame(arguments.callee);
      } else {
        settings.afterDrawed.call(this);
      }
    }
    function Max(arr){
      return Math.max.apply(null, arr);
    }
    function Min(arr){
      return Math.min.apply(null, arr);
    }
    return this;
  };
})();
