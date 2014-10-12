$(document).ready(function(){
  // todos for this file
  // make it OO
  drawChartAjaxCall();
});

function draw(response) {
  function UserShowTempChartSvg(response) {
        this.w = window.innerWidth;
        this.h = 450;
        this.maxDataPointsForDots = 500;
        this.transitionDuration = 1000;
        this.violations = 0;
        this.margin = 40;
        this.circleRadius = 4;
        this.data = this.setData(response);
        this.max = d3.max(this.data, function(d) { return Math.max( d.temp, d.outdoor_temp ) }) + 1;
        this.min = this.setMin();
        this.x = d3.time.scale().range([0, this.w - this.margin * 2]).domain([this.data[0].date, this.data[this.data.length - 1].date]);
        this.y = d3.scale.linear().range([this.h - this.margin * 2, 0]).domain([this.min, this.max]);
        // this.xAxis = d3.svg.axis().scale(this.x).tickSize(this.h - this.margin * 2).tickPadding(0).ticks(this.data.length);
        // this.yAxis = d3.svg.axis().scale(this.y).orient('left').tickSize(-this.w + this.margin * 2).tickPadding(0).ticks(5);
        // this.strokeWidth = this.w / this.data.length;
        this.svg = this.setSvg();
        this.t = this.setT();
        // this.yAxisGroup = null;
        // this.xAxisGroup = null;
        this.dataCirclesGroup = null;
        // this.dataLinesGroup = this.setDataLinesGroup();
        // this.dataLines = this.setDataLines();
        this.line = null;
        // this.garea = null;
        // this.$fillArea = null;
        this.circles = null;
      }

  // // Date constants
  // UserShowTempChartSvg.prototype.DAYS = [ 'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday' ];
  // UserShowTempChartSvg.prototype.MONTHS = [ "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  //   "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER" ];

  UserShowTempChartSvg.prototype.setData = function(dataArrWithObjs) {
    var self = this;
    dataArrWithObjs.forEach(function(obj){
      obj.date = new Date(obj.created_at);
      obj.isDay = obj.date.getHours() >= 6 && obj.date.getHours() <= 22;
      if(/live_update/.test(document.URL)){
        obj.violation = true;
      }
      if( obj.violation ){ self.violations += 1; }
    });
    return dataArrWithObjs;
  };

  UserShowTempChartSvg.prototype.setMin = function() {
    if ( d3.min(this.data, function(d) { return d.outdoor_temp }) ){
      return d3.min(this.data, function(d) { return Math.min( d.temp ) }) - 5;
    } else {
      return d3.min(this.data, function(d) { return Math.min( d.temp, d.outdoor_temp ) }) - 10;
    }
  };

  UserShowTempChartSvg.prototype.setSvg = function(){
    return d3.select('#d3-chart')
      .append('svg:svg')
      .attr('width', this.w)
      .attr('height', this.h)
      .attr('class', 'viz')
      .append('svg:g')
      .attr('transform', 'translate(' + this.margin + ',' + this.margin + ')');
  };

  UserShowTempChartSvg.prototype.setT = function(){
    return this.svg.transition().duration(this.transitionDuration);
  };

// creates the svg
  var chartProperties = new UserShowTempChartSvg(response);

// area is placed first behind all other elements
  var testGroupArea = new UserShowTempChartAreaGroup(chartProperties);
  testGroupArea.addToChart();

// x ticks and labels gets placed first
// x ticks and labels
  var testXGroup = new UserShowTempChartXAxisGroup(chartProperties);
  testXGroup.addToChart();

// y ticks and labels gets placed second
// y ticks and labels
  var testYGroup = new UserShowTempChartYAxisGroup(chartProperties);
  testYGroup.addToChart();

// lines and labels gets placed third
// Draw the lines
  var testDataLinesGroup = new UserShowTempChartLine(chartProperties, {
    hasTransitions: true, transitionDuration: this.transitionDuration 
  });
  testDataLinesGroup.addToChart();




  function UserShowTempChartToolTips(callingObj){}
  UserShowTempChartToolTips.prototype.DAYS = [ 'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday' ];
  UserShowTempChartToolTips.prototype.MONTHS = [ "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER" ];

  UserShowTempChartToolTips.prototype._legalMinimumFor = function(reading){
    if(reading.isDay === true){
      return '68';
    } else {
      return '55';
    }
  };

  UserShowTempChartToolTips.prototype._getCivilianTime = function(reading){
    if (reading.getHours() > 12){
      return (reading.getHours() - 12) + ":"
        + (reading.getMinutes() >= 10 ?
          reading.getMinutes() : "0" + reading.getMinutes())
        + " PM";
    } else {
      return reading.getHours() + ":"
        + (reading.getMinutes() >= 10 ?
          reading.getMinutes() : "0" + reading.getMinutes())
        + " AM";
    }
  };

  UserShowTempChartToolTips.prototype.addToChart = function(){
    var self = this;
    $('svg circle').tipsy({
      gravity: 's',
      html: true,
      topOffset: 2.8,
      leftOffset: 0.3,
      opacity: 1,
      title: function() {
        var circleDatum = this.__data__,
          circleDate = circleDatum.date;
        return circleDate.getDate() + ' '
          + self.MONTHS[circleDate.getMonth()] + ' '
          + circleDate.getFullYear() + '<br>'
          + self.DAYS[ circleDate.getDay() ] + ' at '
          + self._getCivilianTime(circleDate) + '<br>'
          + '<i>Temperature in Violation</i><br>'
          + '<br>Temperature in Apt: ' + circleDatum.temp + '°'
          + '<br>Temperature Outside: ' + circleDatum.outdoor_temp + '°'
          + '<br>Legal minimum: ' + self._legalMinimumFor(circleDatum) + '°';
      }
    });
  }



  function addViolationCountToLegend() {
    $("#violations span").text($("#violations span")
      .text().replace(/\d+/, chartProperties.violations));
  }
  addViolationCountToLegend();

  function UserShowTempChartCircles(svgObj, optionsObj){
    this.data = svgObj.data;
    this.svg = svgObj.svg;
    this.x = svgObj.x;
    this.y = svgObj.y;
    this.hasViolations = optionsObj.hasViolations || true;
    this.circleRadius = optionsObj.circleRadius || 4;
    this.hasTransitions = optionsObj.hasTransitions || false;
    this.transitionDuration = optionsObj.transitionDuration || 1000;
    this.hasToolTips = optionsObj.hasToolTips || false;
    this.dataCirclesGroup = this.setDataCirclesGroup();
    this.dataCircles = this.setDataCircles();
  };

  UserShowTempChartCircles.prototype.setDataCirclesGroup = function(){
    return this.svg.append('svg:g');
  };

  UserShowTempChartCircles.prototype.setDataCircles = function(){
    return this.dataCirclesGroup
      .selectAll('.data-point')
      .data(this.data);
  };

  UserShowTempChartCircles.prototype.addCirclesWithTransitions = function(){
    var self = this;
    self.dataCircles.enter()
      .append('svg:circle')
      .attr('class', 'data-point')
      .style('opacity', 1)
      .attr('cx', function(d) { return self.x(d.date) })
      .attr('cy', function() { return self.y(0) })
      .attr('r', function(d) {
        return d.violation ? self.circleRadius : 0;
      })
      .transition()
      .duration(self.transitionDuration)
      .style('opacity', 1)
      .attr('cx', function(d) { return self.x(d.date) })
      .attr('cy', function(d) { return self.y(d.temp) });
  };

  UserShowTempChartCircles.prototype.addCirclesWithoutTransitions = function(){
    var self = this;
    self.dataCircles.enter()
      .append('svg:circle')
      .attr('class', 'data-point')
      .attr('cx', function(d) { return self.x(d.date) })
      .attr('cy', function(d) { return self.y(d.temp) })
      .attr('r', function(d) {
        return d.violation ? self.circleRadius : 0;
      });
  };

  UserShowTempChartCircles.prototype.addToolTips = function(){
    if ( this.hasToolTips ) {
      var toolTips = new UserShowTempChartToolTips;
      toolTips.addToChart();
    }
  };

  UserShowTempChartCircles.prototype.addToChart = function (){
    if ( this.hasViolations ) {
      if ( this.hasTransitions ) {
        this.addCirclesWithTransitions();
      } else {
        this.addCirclesWithoutTransitions();
      }
      this.addToolTips();
    }
  };

  var testCircles = new UserShowTempChartCircles(chartProperties, {
    hasViolations: true,
    circleRadius: 4,
    transitionDuration: 1000,
    hasTransitions: true,
    hasToolTips: true
  });
  testCircles.addToChart();


}

function drawChartBasedOnScreenSize(chartData){
  if ( $('#live-update') !== undefined ) {
    $('.temp-num').html(chartData[chartData.length - 1].temp + '°')
  }

  if (window.innerWidth < 450) {
    var quarterReadings = chartData.slice(119, 167);
    $("#d3-chart").html("")
    draw(quarterReadings);
  }else if(window.innerWidth < 720){
    var halfReadings = chartData.slice(71, 167);
    $("#d3-chart").html("")
    draw(halfReadings);
  }else if(window.innerWidth < 1080){
    var threeQuarterReadings = chartData.slice(23, 167);
    $("#d3-chart").html("")
    draw(threeQuarterReadings);
  } else {
    $("#d3-chart").html("")
    draw(chartData);
  }
}

function drawChartAjaxCall(){
  if($("#d3-chart").length > 0){
    if(/collaborations/.test(document.URL)){
      var URL = /\/users\/\d+\/collaborations\/\d+/.exec(document.URL)[0];
      // returns /user/11/collaborations/35
    } else if ( /live_update/.test(document.URL) ){
      var URL = /\/users\/\d+\/live_update/.exec(document.URL)[0];
      //returns /user/13/live_update
    } else {
      var URL = /\/users\/\d+/.exec(document.URL)[0];
    }
    $.ajax({
      url: URL,
      dataType: "JSON",
      success: function(response){
        if( response.length > 0 ){
          drawChartBasedOnScreenSize(response);
          var resizeTimer = 0;
          window.onresize = function(){
            if (resizeTimer){
              clearTimeout(resizeTimer);
            }
            resizeTimer = setTimeout(function(){
              drawChartBasedOnScreenSize(response);
            }, 50);
          };
        }
      },
      error: function(response){
        console.log("error");
        console.log(response);
      }
    });
  }
}
