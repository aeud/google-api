angular.module('google', [])
.controller('MainController', function($scope, $http) {
	$scope.selectedCalendar = null;
	$scope.accessToken = null;
	$scope.events;
	var params = {}, queryString = location.hash.substring(1),
	    regex = /([^&=]+)=([^&]*)/g, m;
	while (m = regex.exec(queryString)) {
	  params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
	}
	console.log(params);
	if (params.access_token) {
		$scope.accessToken = params.access_token;
		$http({
			'url': 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
			'headers': {
				'Authorization': 'Bearer '+params.access_token
			}
		}).success(function(data){
			console.log(data);
			$scope.calendars = data.items;
		})
	}
	$scope.selectCalendar = function(calendar){
		$scope.selectedCalendar = calendar;
		$http({
			'url': 'https://www.googleapis.com/calendar/v3/calendars/'+calendar.id+'/events',
			'params': {
				'timeMin': new Date('2014-01-01').toISOString(),
				'timeMax': new Date('2015-01-01').toISOString(),
				'orderBy': 'startTime',
				'singleEvents': true
			},
			'headers': {
				'Authorization': 'Bearer '+params.access_token
			}
		}).success(function(data){
			var events = data.items;
			$scope.events = events;
			var days = {};
			var start = new Date('2014-01-01');
			var end = new Date('2015-01-01');
			while (start < end) {
				days[start.toISOString().slice(0,10)] = 0;
				start.setDate(start.getDate()+1)
			}
			console.log(days)
			for (var i = 0; i < events.length; i++) {
				var d = events[i];
				var start = d.start.date ? new Date(d.start.date) : new Date(d.start.dateTime);
				var end = d.end.date ? new Date(d.end.date) : new Date(d.end.dateTime);
				while (start <= end) {
					days[start.toISOString().slice(0,10)] = days[start.toISOString().slice(0,10)] + 1; 
					start.setDate(start.getDate()+1);
				}
			}
			test(days)
		})
	}
	
	function test(data) {
		var width = 960,
		    height = 136,
		    cellSize = 17; // cell size

		var day = d3.time.format("%w"),
		    week = d3.time.format("%U"),
		    percent = d3.format(".1%"),
		    format = d3.time.format("%Y-%m-%d");

		var color = d3.scale.quantize()
		    .domain([-5, 5])
		    .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));
		d3.select("#test").selectAll("svg").remove()
		var svg = d3.select("#test").selectAll("svg")
		    .data(d3.range(2014, 2015))
			.enter().append("svg")
		    .attr("width", width)
		    .attr("height", height)
		    .attr("class", "RdYlGn")
			.append("g")
		    .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

		svg.append("text")
		    .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
		    .style("text-anchor", "middle")
		    .text(function(d) { return d; });

		var rect = svg.selectAll(".day")
		    .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
			.enter().append("rect")
		    .attr("class", "day")
		    .attr("width", cellSize)
		    .attr("height", cellSize)
		    .attr("x", function(d) { return week(d) * cellSize; })
		    .attr("y", function(d) { return day(d) * cellSize; })
		    .datum(format);

		rect.append("title")
		    .text(function(d) { return d; });

		svg.selectAll(".month")
		    .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
		  .enter().append("path")
		    .attr("class", "month")
		    .attr("d", monthPath);

  		  rect.filter(function(d) { return d in data; })
  		      .attr("class", function(d) { return "day " + color(data[d]); })
  		    .select("title")
  		      .text(function(d) { return d + ": " + percent(data[d]); });

		function monthPath(t0) {
		  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
		      d0 = +day(t0), w0 = +week(t0),
		      d1 = +day(t1), w1 = +week(t1);
		  return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
		      + "H" + w0 * cellSize + "V" + 7 * cellSize
		      + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
		      + "H" + (w1 + 1) * cellSize + "V" + 0
		      + "H" + (w0 + 1) * cellSize + "Z";
		}

		d3.select(self.frameElement).style("height", "2910px");
	
	}
	
})