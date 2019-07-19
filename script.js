/*Heat Map visualization project*/

//Source Dataset -https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json

//Font Awesome CSS - https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css
//Bootstrap CSS - https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css
//Bootstrap JS - https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min.js
//D3 Datavisualization Library - https://d3js.org/d3.v5.min.js
//Testing JS - https://cdn.freecodecamp.org/testable-projects-fcc/v1/bundle.js

document.addEventListener('DOMContentLoaded',function() {
  var url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
  req=new XMLHttpRequest();
  req.open("GET",url,true);
  req.send();
  req.onload=function(){
	  
	  
	var json=JSON.parse(req.responseText);		//Read file data
	
	
/* Expected format: JSON Array with these object pairs
{
  "baseTemperature": 8.66,
  "monthlyVariance": [
    {
      "year": 1753,
      "month": 1,
      "variance": -1.366
}]}*/

	var baseTemperature = json.baseTemperature;
	var dataset = json.monthlyVariance;
	
	
	//We will make the time and year JS date objects, All the other fields can be interpretted as text
	var timeData=[];
	var date;
	for (var i = 0; i<dataset.length; ++i)
	{
		date = new Date(dataset[i].year,dataset[i].month-1);
		timeData.push(date);			//Store time here
		//console.log(dataset[i].year + "-" +dataset[i].month + " = " + timeData[i].toISOString());	//Test output for correct time conversion
	}
	
	const fullwidth = 1000;
    const fullheight = 600;
	const padding = 65;

	const width = fullwidth - 2*padding;
    const height = fullheight - 2*padding;

	//Get the range we want to display on X axis
	var maxX = d3.max(timeData, (d) => d);
	var minX = d3.min(timeData, (d) => d);
	//console.log("MaxYear: " + maxX + " MinYear: " + minX);	//Test X range
	document.getElementById("description").innerHTML = minX.getFullYear() + "-" + maxX.getFullYear() + " : Base Temperature = " + baseTemperature + "  &degC";		//Set description
	
	//Get the range we want to display on Y axis
	var maxY = new Date (1970,0,0);
	var minY = new Date (1970,11, 31);
	//console.log("MaxTime: " + maxY.toISOString() + " MinTime: " + minY.toISOString());	//Test Y range
	
	//Define the X Scale
	var xScale = d3.scaleTime()
		.domain([minX, maxX])
		.rangeRound([padding, width]) ;
		//.nice();	

	//Define the Y Scale	
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];	
	var monthsBackwards = months.slice();
	monthsBackwards.reverse(); 
	var yScale = d3.scaleBand()
		.domain(monthsBackwards)			//We make the scale in reverse so the graph appears to go from January down to December
		.rangeRound([height, padding]);
		//.nice(); 	*/
		
   // Define the y and x axis
	var yAxis = d3.axisLeft(yScale);

	var xAxis = d3.axisBottom(xScale);			
		
	
	//Create toolTips DIV
	var toolTips = d3.select("body").append("div")
	  .attr("class", "tooltip")
	  .attr("id", "tooltip")
	  .style("background", "Beige")
	  .style("color", "Black")
	  .style("opacity", 0);	//Hide until mouseover
		
	//Create SVG
	var svg = d3.select("#graph")
		.append("svg")
		.attr("width", fullwidth)
		.attr("height", fullheight);

	// Draw y axis
	svg.append("g")
		.attr("transform", "translate("+padding+",0)")
		.attr("id", "y-axis")
		.call(yAxis
			//.tickFormat(d3.utcFormat('%B'))		//Specify showing of time as Full Name of the Month
			.tickPadding(10)
		);


	// Draw x axis 
	svg.append("g")
		.attr("class", "xaxis")   
		.attr("id", "x-axis")
		.attr("transform", "translate(0," + (height) + ")")
		.call(xAxis
			.tickFormat(d3.utcFormat('%Y'))		//Specify showing of time as Full Year
			.tickPadding(10)		
		);

	//Use this to add height and width of cells
	var oneMonth = height / 12;
	var oneYear = (width-200) / (maxX.getFullYear() - minX.getFullYear());
			
	//Setup Color Scale
	var minVariance = baseTemperature + d3.min(dataset, (d) => d.variance);
	var maxVariance = baseTemperature +  d3.max(dataset, (d) => d.variance);
	var	stepVariance = (Math.abs(maxVariance) - Math.abs(minVariance))/10;
	//console.log("minVariance: " + minVariance + " maxVariance: " + maxVariance);	//Test Variance range
	var colorPallete= [ "midnightblue", "indigo", "darkslateblue","blue", "green", "greenyellow", "yellow", "orange", "red", "maroon"];
	var colorSteps=[minVariance, minVariance + 1*stepVariance, minVariance + 2*stepVariance, minVariance + 3*stepVariance, minVariance + 4*stepVariance, minVariance + 5*stepVariance, minVariance + 6*stepVariance, minVariance + 7*stepVariance, minVariance + 8*stepVariance, minVariance + 9*stepVariance, maxVariance];
	var colorScale = d3.scaleLinear()
		.domain(colorSteps)
		.range(colorPallete);
	//console.log("One Year: " + xScale(oneYear) +  " One Month: "+ yScale(oneMonth));
	
	
	//Draw data points
	svg.append("g")
		.selectAll("rect")
		.data(dataset)
		.enter().append("rect")
			.attr("x", (d,i) => xScale(new Date(timeData[i].getFullYear(),0)))
			//.attr("y", (d,i) => yScale(new Date(1970, timeData[i].getMonth()))-1)
			.attr("y", (d,i) => yScale(months[timeData[i].getMonth()]))
			//.attr("y", (d,i) => yScale(timeData[i].getMonth()))
			.attr("width", (d,i) => oneYear)
			//.attr("height", (d,i) => oneMonth)			
			.attr("height", (d,i) => yScale.bandwidth())			
			.attr("class", "cell")   			
			.attr("data-year", (d,i) => timeData[i].getFullYear())   	
			.attr("data-month", (d,i) =>  timeData[i].getMonth())   				
			.attr("data-temp", (d,i) =>  baseTemperature + d.variance)   			
			.style("fill",(d,i) => colorScale( baseTemperature + d.variance))
			//Tooltip DIV control
			.on("mouseover", function(d,i) {
				 d3.select(this).attr("stroke", "black")
					.attr("stroke-width", 0.5);
				toolTips.attr("data-year", timeData[i].getFullYear())
					.html(timeData[i].getFullYear() + " - " + timeData[i].getMonth() +  "<br/>" + (baseTemperature + d.variance) + " &degC<br/>" + d.variance + " &degC")
					.style("left", (d3.event.pageX + 15) + "px")
					.style("top", (d3.event.pageY - 50) + "px")
					.style("opacity", .9)
					.style("background",  colorScale( baseTemperature + d.variance));
			})
			.on("mouseout", function(d) {
				 d3.select(this).attr("stroke", "none");
				toolTips.style("opacity", 0);
			})
			.style("opacity", .8);
	
	
	//Add legend element
	var legend = svg.selectAll(".legend")
	    .data(dataset)
		.enter().append("g")
		.attr("class", "legend")
		.attr("id", "legend");
		
	
	//Add colored rectangles to legend
	var legendSize = 25;
	for (var i =0; i< colorPallete.length; ++i)
	{
		legend.append("rect")
				.attr("stroke", "black")
				.attr("stroke-width", 1.5)
				.attr("x", 0.1 * fullwidth+i*(legendSize*2+1))
				.attr("y", fullheight - padding)
				.attr("width", legendSize*2)
				.attr("height", legendSize)
				.attr("fill", colorPallete[i]);
	}

	//Add text to legend
	for (var j=0; j< colorSteps.length; ++j)
	{
		legend.append("text")
			.attr("x", 0.1 * fullwidth +j*(legendSize*2+1))
			.attr("y", fullheight - padding - legendSize*0.5)
			.text(Math.round(colorSteps[j] * 100) / 100);
	}
	
  };		
		
});
	
	