var width = 500,
    height = 500,
    radius = Math.min(width, height) / 1.9,
    spacing = .09;
    

var formatSecond = d3.time.format("%-S seconds"),
    formatMinute = d3.time.format("%-M minutes"),
    formatHour = d3.time.format("%-H hours"),
    formatDay = d3.time.format("%A"),
    formatDate = function(d) { d = d.getDate(); switch (10 <= d && d <= 19 ? 10 : d % 10) { case 1: d += "st"; break; case 2: d += "nd"; break; case 3: d += "rd"; break; default: d += "th"; break; } return d; },
    formatMonth = d3.time.format("%B"),
    formatExtraMonths = function(d){d+=" month"; return d},
    formatYears = function(d){d+=" years"; return d}; 
    

var color = d3.scale.linear()
    .range(["hsl(-180,60%,50%)", "hsl(180,60%,50%)"])
    .interpolate(function(a, b) { var i = d3.interpolateString(a, b); return function(t) { return d3.hsl(i(t)); }; });

var arcBody = d3.svg.arc()
    .startAngle(0)
    .endAngle(function(d) { return d.value * 2 * Math.PI; })
    .innerRadius(function(d) { return d.index * radius; })
    .outerRadius(function(d) { return (d.index + spacing) * radius; })
    .cornerRadius(0);

var arcCenter = d3.svg.arc()
    .startAngle(0)
    .endAngle(function(d) { return d.value * 2 * Math.PI; })
    .innerRadius(function(d) { return (d.index + spacing / 2) * radius; })
    .outerRadius(function(d) { return (d.index + spacing / 2) * radius; });

var svg = d3.select("#PolarClock").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    .attr("margin", "auto");

var field = svg.selectAll("g")
    .data(fields)
  .enter().append("g");

field.append("path")
    .attr("class", "arc-body");

field.append("path")
    .attr("id", function(d, i) { return "arc-center-" + i; })
    .attr("class", "arc-center");

field.append("text")
    .attr("dy", ".35em")
    .attr("dx", ".75em")
    .style("text-anchor", "start")
  .append("textPath")
    .attr("startOffset", "50%")
    .attr("class", "arc-text")
    .attr("xlink:href", function(d, i) { return "#arc-center-" + i; });

tick();

d3.select(self.frameElement).style("height", height + "px");

function tick() {
  if (!document.hidden) field
      .each(function(d) { this._value = d.value; })
      .data(fields)
      .each(function(d) { d.previousValue = this._value; })
      .transition()
      .ease("elastic")
      .duration(500)
      .each(fieldTransition);

  setTimeout(tick, 1000 - Date.now() % 1000);
}

function fieldTransition() {
  var field = d3.select(this).transition();

  field.select(".arc-body")
      .attrTween("d", arcTween(arcBody))
      //.style("fill", function(d) { return color(d.value); });
        .style("fill", function(d) { return d.color; });

  field.select(".arc-center")
      .attrTween("d", arcTween(arcCenter));

  field.select(".arc-text")
      .text(function(d) { return d.text; })
      .style("color", function(d) { return d.color; });
}

function arcTween(arc) {
  return function(d) {
    var i = d3.interpolateNumber(d.previousValue, d.value);
    return function(t) {
      d.value = i(t);
      return arc(d);
    };
  };
}

function fields() {
  
  var birthday = new Date(1993, 02, 02, 1, 30, 00, 00);
  var now = new Date;
  return [
    //{index: .6, text: "AGE", value: 1},
    {index: .5, text: formatSecond(now), value: now.getSeconds() / 60},
    {index: .4, text: formatMinute(now), value: now.getMinutes() / 60},
    {index: .3, text: formatHour(now),   value: now.getHours() / 24},
    {index: .2, text: formatExtraMonths(now.getMonth() - birthday.getMonth()) , value: ((now.getMonth()-birthday.getMonth()) / 12)},   
    {index: .1, text:  formatYears(now.getYear() - birthday.getYear()),value:((now.getYear()-birthday.getYear()) / 70)},
  ];
}
