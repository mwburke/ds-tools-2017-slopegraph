
d3.json('data.json', function(error, data) {
	if (error) throw error;

	// Label each point as increasing/decreasing above thresholds
	// or just little to no change
	var arrayLength = data.length;
	for (var i = 0; i < arrayLength; i++) {
	    change = data[i]['After'] - data[i]['Before'];
	    if (change < -3) {
	    	data[i]['Change'] = 'negative';
	    } else if (change > 5) {
	    	data[i]['Change'] = 'positive';
	    } else {
	    	data[i]['Change'] = 'neutral';
	    }
	}

	var opts = {
		width: 600,
		height: 500,
		margin: {top: 20, right: 100, bottom: 30, left: 150}
	};

	// Calculate area chart takes up out of entire svg
	var chartHeight = opts.height - opts.margin.top - opts.margin.bottom;
	var chartWidth = opts.width - opts.margin.left - opts.margin.right;


	var svg = d3.select('#chart')
		.append('svg')
		.attr('width', opts.width)
		.attr('height', opts.height);

	// Create scale for positioning data correctly in chart
	var vertScale = d3.scaleLinear().domain([6, 53]).range([opts.margin.bottom, chartHeight]);

	// Labels overlap, need to precompute chart height placement
	// and adjust to avoid label overlap

	// First, calculate the right and left side chart placements
	for (var i = 0; i < arrayLength; i++) {
		data[i]['AfterY'] = vertScale(data[i]['After']);
		data[i]['BeforeY'] = vertScale(data[i]['Before']);
	}

	// Next, use a basic heuristic to pull labels up or down
	// If next item is too close to next one, move label up
	// If next item is too close and item above has been moved up, keep the same value,
	// and move next value down

	data.sort(function(a, b) {
		return b.Before-a.Before;
	})

	

	for (var i = 1; i < (arrayLength - 1); i++) {
		if ((data[i]['BeforeY']-data[i+1]['BeforeY']) < 15) {
			if ((data[i-1]['BeforeY']-data[i]['BeforeY']) < 15) {
				data[i+1]['BeforeY'] = data[i+1]['BeforeY'] - 10;
			} else {
				data[i]['BeforeY'] = data[i]['BeforeY'] + 10;
			}
		}
	}

	data.sort(function(a, b) {
		return b.After-a.After;
	})

	console.log(data);

	for (var i = 1; i < (arrayLength - 1); i++) {

		if ((data[i]['AfterY']-data[i+1]['AfterY']) < 15) {
			if ((data[i-1]['AfterY']-data[i]['AfterY']) < 15) {
				data[i+1]['AfterY'] = data[i+1]['AfterY'] - 10;
			} else {
				data[i]['AfterY'] = data[i]['AfterY'] + 10;
			}
		} else if ((data[i-1]['AfterY']-data[i]['AfterY']) < 15) {
			data[i]['AfterY'] = data[i]['AfterY'] - 10;
		} 
	}

	data.sort(function(a, b) {
		return b.Before-a.Before;
	})

	// Create slopegraph labels
	svg.selectAll('text.labels')
		.data(data)
		.enter()
		.append('text')
		.text(function(d) {
			return d.Tool
		})
		.attr('class', function(d) {
			return 'label ' + d.Change;
		})
		.attr('text-anchor', 'end')
		.attr('x', opts.margin.left * .6)
		.attr('y', function(d) { 
			return opts.margin.top + chartHeight - d.BeforeY;
		})
		.attr('dy', '.35em');
	
	// Create slopegraph left value labels
	svg.selectAll('text.leftvalues')
		.data(data)
		.enter()
		.append('text')
		.attr('class', function(d) {
			return d.Change;
		})
		.text(function(d) {
			return Math.round(d.Before) + '%'
		})
		.attr('text-anchor', 'end')
		.attr('x', opts.margin.left * .85)
		.attr('y', function(d) { 
			return opts.margin.top + chartHeight - d.BeforeY;
		})
		.attr('dy', '.35em');

	// Create slopegraph left value labels
	svg.selectAll('text.rightvalues')
		.data(data)
		.enter()
		.append('text')
		.attr('class', function(d) {
			return d.Change;
		})
		.text(function(d) {
			return Math.round(d.After) + '%'
		})
		.attr('text-anchor', 'start')
		.attr('x', chartWidth + opts.margin.right)
		.attr('y', function(d) { 
			return opts.margin.top + chartHeight - d.AfterY;
		})
		.attr('dy', '.35em');

	// Create slopegraph lines
	svg.selectAll('line.slope-line')
		.data(data)
		.enter()
		.append('line')
		.attr('class', function(d) {
			return 'slope-line ' + d.Change;
		})
		.attr('x1', opts.margin.left)
		.attr('x2', chartWidth + opts.margin.right * 0.75)
		.attr('y1', function(d) { 
			return opts.margin.top + chartHeight - vertScale(d.Before);
		})
		.attr('y2', function(d) { 
			return opts.margin.top + chartHeight - vertScale(d.After);
		});
	
	// Create slopegraph left circles
	svg.selectAll('line.left-circle')
		.data(data)
		.enter()
		.append('circle')
		.attr('class', function(d) {
			return d.Change;
		})
		.attr('cx', opts.margin.left)
		.attr('cy', function(d) { 
			return opts.margin.top + chartHeight - vertScale(d.Before);
		})
		.attr('r', 6);

	// Create slopegraph right circles
	svg.selectAll('line.left-circle')
		.data(data)
		.enter()
		.append('circle')
		.attr('class', function(d) {
			return d.Change;
		})
		.attr('cx',chartWidth + opts.margin.right * 0.75)
		.attr('cy', function(d) { 
			return opts.margin.top + chartHeight - vertScale(d.After);
		})
		.attr('r', 6);

	// Create bottom area denoting years
	svg.append("line")
		.attr('x1', opts.margin.left)
		.attr('x2', opts.margin.left)
		.attr('y1', opts.height - opts.margin.bottom)
		.attr('y2', opts.height - opts.margin.bottom * 0.7)
		.attr('stroke', 'grey')
		.attr('stroke-width', '2px');

	svg.append("line")
		.attr('x1', chartWidth + opts.margin.right * 0.75)
		.attr('x2', chartWidth + opts.margin.right * 0.75)
		.attr('y1', opts.height - opts.margin.bottom)
		.attr('y2', opts.height - opts.margin.bottom * 0.7)
		.attr('stroke', 'grey')
		.attr('stroke-width', '2px');

	svg.append("line")
		.attr('x1', opts.margin.left)
		.attr('x2', chartWidth + opts.margin.right * 0.75)
		.attr('y1', opts.height - opts.margin.bottom * 0.7)
		.attr('y2', opts.height - opts.margin.bottom * 0.7)
		.attr('stroke', 'grey')
		.attr('stroke-width', '2px');

	svg.append('text')
		.text('2016')
		.attr('class', 'neutral')
		.attr('x', opts.margin.left)
		.attr('y', opts.height - opts.margin.bottom * 0.05)
		.attr('text-anchor', 'start');

	svg.append('text')
		.text('2017')
		.attr('class', 'neutral')
		.attr('x', chartWidth + opts.margin.right * 0.75)
		.attr('y', opts.height - opts.margin.bottom * 0.05)
		.attr('text-anchor', 'end');

	// Get y values of notes and add notes to viz
	var pythonY = data.filter(function (ind) {
		return ind.Tool == 'Python';
	});

	var rapidMinerY = data.filter(function (ind) {
		return ind.Tool == 'RapidMiner';
	});

	var tensorflowY = data.filter(function (ind) {
		return ind.Tool == 'Tensorflow';
	});

	svg.selectAll('text-comments')
		.data(data)
		.enter()
		.append('text')
		.text(function(d) {
			return d.Comments;
		})
		.attr('class', 'neutral')
		.attr('text-anchor', 'start')
		.attr('x', chartWidth + opts.margin.right)
		.attr('y', function(d) {
			return opts.margin.top + chartHeight - d.AfterY;
		})
		.attr('dy', '.25em')
		.call(wrap, opts.margin.right);

	function wrap(text, width) {
	  text.each(function() {
	    var text = d3.select(this),
	        words = text.text().split(/\s+/).reverse(),
	        word,
	        line = [],
	        lineNumber = 0,
	        lineHeight = 1.1, // ems
	        y = text.attr("y"),
	        dy = parseFloat(text.attr("dy")),
	        tspan = text.text(null).append("tspan").attr("x", chartWidth + opts.margin.left).attr("y", y).attr("dy", dy + "em");
	    while (word = words.pop()) {
	      line.push(word);
	      tspan.text(line.join(" "));
	      if (tspan.node().getComputedTextLength() > width) {
	        line.pop();
	        tspan.text(line.join(" "));
	        line = [word];
	        tspan = text.append("tspan").attr("x", chartWidth + opts.margin.left).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
	      }
	    }
	  });
	}
});


function round10(x) {
    return Math.round(x / 10) * 10;
}



