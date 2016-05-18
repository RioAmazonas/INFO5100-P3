window.onerror = function(errorMsg, url, lineNumber) {
	alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber);
}
var w = $(window).width() * 0.8,
		h = window.screen.height * 0.5,
		padding = 25,
		dataset = [];
		// dataset = [
		// 		[10, 10],
		// 		[20, 50],
		// 		[30, 40],
		// 		[40, 80],
		// 		[50, 90],
		// 		[60, 50],
		// 		[70, 70],
		// 		[80, 60],
		// 		[90, 10],
		// 		[100, 50],
		// 		[110, 40],
		// 		[120, 70],
		// 		[130, 20],
		// 		[140, 40],
		// 		[150, 30]
		// ]

d3.csv("../data/globalTemperature.csv", function(error,data) {
	for(var i =0; i < data.length; i++) {
		dataset.push([Number(data[i]["Year"]) , Number(data[i]["Annual_Mean"]) ]);
	}
	console.log("Dataset is: ");
	console.log(dataset);
	var xScale = d3.scale.linear()
		.domain([1880, 2013])
		.range([padding, w - padding]);

	/*y scale*/
	var yScale = d3.scale.linear()
			.domain([d3.min(dataset, d => d[1]), d3.max(dataset, d => d[1])])
			.range([h - padding, padding]);

	/*x axis*/
	var xAxis = d3.svg.axis()
			.scale(xScale)
			.tickValues(xScale.domain())
			.tickFormat(d3.format("d"))
			.orient('bottom');

	/*append x axis*/
	svg.append('g')
			.attr({
					'class': 'xaxis',
					'transform': 'translate(0, '+(h - padding)+')'
			})
			.call(xAxis)

	/*y axis*/
	var yAxis = d3.svg.axis()
			.scale(yScale)
			.orient('left')

	/*append y axis*/
	svg.append('g')
			.attr({
					'class': 'yaxis',
					'transform': 'translate('+padding+', 0)'
			})
			.call(yAxis)

	/*define line*/
	var lines = d3.svg.line()
			.x(d => xScale(d[0]))
			.y(d => yScale(d[1]))
			.interpolate('monotone')

	/*append line*/
	 // var path = svg.append('path')
		// 	.attr({
		// 			'd': lines(dataset),
		// 			'class': 'lineChart'
		// 	});
	// var totalLength = path.node().getTotalLength();
 //    path
 //      .attr("stroke-dasharray", totalLength + " " + totalLength)
 //      .attr("stroke-dashoffset", totalLength)
 //      .transition()
 //        .duration(3000)
 //        .ease("linear")
 //        .attr("stroke-dashoffset", 0);

	svg.select('.lineChart')
			.style('opacity', 0)
			.transition()
			.duration(500)
			.delay(1000)
			.style('opacity', 1)

	/*add points*/
	var points = svg.selectAll('circle')
			.data(dataset)
			.enter()
			.append('circle')
			.call(drag)

	/*point attributes*/
	points.attr('cy', 0)
			.transition()
			.duration(100)
			.delay((d, i) => (i * 10))
			.ease('elastic')
			.attr({
					'cx': d => xScale(d[0]),
					'cy': d => yScale(d[1]),
					'r': 3,
					'class': 'datapoint',
					'id': (d, i) => i
			})
			.style('opacity', 1)

	var xMax = d3.max(dataset, d => d[0]),
			yMax = d3.max(dataset, d => d[1])

})

/*create svg element*/
var svg = d3.select('#main-div')
		.append('svg')
		.attr('width', w)
		.attr('height', h)
		.attr('id', 'chart')

var drag = d3.behavior.drag()
		.on("dragstart", dragstarted)
		.on("drag", dragged)
		.on("dragend", dragended)

/*x scale*/

function dragstarted() {
		d3.event.sourceEvent.stopPropagation()
		d3.select(this).classed("dragging datapoint", true)
}

function dragged() {
		d3.select(this)
				.attr({
						'cx': Math.max(padding, Math.min(d3.event.x, w - padding)),
						'cy': Math.max(padding, Math.min(d3.event.y, h - padding))
				})
}

function dragended() {
		d3.select(this).classed("datapoint", true)
				// get id of dragged point 		
		var id = d3.select(this).attr('id'),
				// get new absolute position coordinates of the point 				
				xPos = d3.select(this).attr('cx'),
				yPos = h - d3.select(this).attr('cy')

		// convert absolute position coordinates relative to scales
		xPos = (xPos - padding) * (xMax / (w - (padding * 2)))
		yPos = (yPos - padding) * (yMax / (h - (padding * 2)))
		dataset[id][0] = xPos
		dataset[id][1] = yPos

		// update line
		svg.select('.lineChart')
				.transition()
				.duration(500)
				.attr('d', lines(dataset))
}