let sleepPeriodsFile;
let weightFile;
let allData = {};
let allDataArray = [];

// Get the selected file when input changes
document.getElementById("sleepperiods").addEventListener("change", (event) => {
	sleepPeriodsFile = event.target.files[0];
});
document.getElementById("weight").addEventListener("change", (event) => {
	weightFile = event.target.files[0];
});
//arrays of our axis
var dates = [];
var HRV = [];
var deep = [];
var light = [];
var weight = [];


// Handle upload button click
document.getElementById("upload-button").addEventListener("click", (e) => {
	e.preventDefault();

	let fileReader = new FileReader();

	// Read the selected file as binary string
	fileReader.readAsBinaryString(sleepPeriodsFile);

	// Process the file data when it's loaded
	fileReader.onload = (event) => {
		let fileData = event.target.result;

		// Read the Excel workbook
		let workbook = XLSX.read(
			fileData,
			{ type: "binary" },
			{ dateNF: "mm/dd/yyyy" }
		);

		// Change each sheet in the workbook to json
		workbook.SheetNames.forEach(async (sheet) => {
			const result = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], {
				raw: false,
			});
			for (var i = 0; i < result.length; i++) {

				var dateArray = result[i].day.split("/");
				var dateObject = new Date(dateArray);
				var DE = new DataEntry(dateObject, result[i].deep_sleep_duration, result[i].light_sleep_duration, result[i].rem_sleep_duration, result[i].awake_time, result[i].average_hrv);

				allData[result[i].day] = DE;
				allDataArray.push(DE);


			}
			// console.log(allData);

		});



		//let fileReader = new FileReader();

		// Read the selected file as binary string
		fileReader.readAsBinaryString(weightFile);

		// Process the file data when it's loaded
		fileReader.onload = (event) => {
			let fileData = event.target.result;

			// Read the Excel workbook
			let workbook = XLSX.read(
				fileData,
				{ type: "binary" },
				{ dateNF: "mm/dd/yyyy" }
			);

			// Change each sheet in the workbook to json
			workbook.SheetNames.forEach(async (sheet) => {
				const result = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], {
					raw: false,
				});
				for (var i = 0; i < result.length; i++) {
					//console.log("day: " + result[i].day + ", deep sleep: " + result[i].deep_sleep_duration + ", light sleep: " + result[i].light_sleep_duration + ", rem sleep: " + result[i].rem_sleep_duration + ", awake: " + result[i].awake_time + ", HRV: " + result[i].average_hrv);

					var dateArray = result[i].day.split("/");
					var dateObject = new Date(dateArray);
					//console.log(result[i]);
					if(result[i].day in allData){
						var entry = allData[result[i].day];
						entry.weight = result[i].weight_lbs;


					}

				}
				 console.log(allDataArray);
			});


			var AVGHRV = [];
			for (var i = 0; i < dates.length; i++) {
				AVGHRV.push({
					x: dates[i],
					y: parseInt(HRV[i])
				});

			}

			var AVGDEEP = [];
			for (var i = 0; i < dates.length; i++) {
				AVGDEEP.push({
					x: dates[i],
					y: parseInt(deep[i])
				});
			}

			var AVGLIGHT = [];
			for (var i = 0; i < dates.length; i++) {
				AVGLIGHT.push({
					x: dates[i],
					y: parseInt(light[i])
				});
			}

			var chart = new CanvasJS.Chart("chartContainer", {
				title: {
					text: "Oura HRV, Sleep Chart"
				},
				axisY: [{
					title: "Deep Sleep",
					lineColor: "#C24642",
					tickColor: "#C24642",
					labelFontColor: "#C24642",
					titleFontColor: "#C24642",
					includeZero: true,
					suffix: "",
				},
				{
					title: "HRV",
					lineColor: "#369EAD",
					tickColor: "#369EAD",
					labelFontColor: "#369EAD",
					titleFontColor: "#369EAD",
					includeZero: true,
					suffix: ""
				}],
				axisY2: {
					title: "Light Sleep",
					lineColor: "#7F6084",
					tickColor: "#7F6084",
					labelFontColor: "#7F6084",
					titleFontColor: "#7F6084",
					includeZero: true,
					prefix: "",
					suffix: ""
				},
				toolTip: {
					shared: true
				},
				legend: {
					cursor: "pointer",
					itemclick: toggleDataSeries
				},
				data: [{
					type: "line",
					name: "HRV",
					color: "#369EAD",
					showInLegend: true,
					axisYIndex: 1,
					dataPoints: AVGHRV
				},
				{
					type: "line",
					name: "Deep Sleep",
					color: "#C24642",
					axisYIndex: 0,
					showInLegend: true,
					dataPoints: AVGDEEP
				},
				{
					type: "line",
					name: "Light Sleep",
					color: "#7F6084",
					axisYType: "secondary",
					showInLegend: true,
					dataPoints: AVGLIGHT
				}]
			});
			chart.render();

			function toggleDataSeries(e) {
				if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
					e.dataSeries.visible = false;
				} else {
					e.dataSeries.visible = true;
				}
				e.chart.render();
			}
		};

	};

});

class DataEntry {
	constructor(date, deep, light, rem, awake, hrv) {
		this.date = date;
		this.deep = deep;
		this.light = light;
		this.rem = rem;
		this.awake = awake;
		this.hrv = hrv;
	}
}



//drawing the graph
// function setup(){
// 	draw();
// }

// function draw(){
// 	beginShape();
// 	for(var i = 0; i < allDataArray.length; i++){
// 		vertex(x,y);
// 	}
// 	endShape();
// }

function setup() {
	var canvas = createCanvas(800, 400);
	canvas.parent("main-sketch-area");
	frameRate(60);
	noLoop();
}

function draw() {
	background(255);

	stroke(128, 128, 128);
	strokeWeight(2);
	//x axis
	line(90, height - 50, width - 50, height - 50);
	// x aixs label
	stroke(128, 128, 128);
	strokeWeight(1);
	textSize(16);
	textAlign(CENTER, TOP);
	text("x-axis label", width / 2, height - 20);

	//y axis 1
	stroke(128, 128, 128);
	strokeWeight(2);
	line(40, height - 50, 40, 50);
	// y axis 1 label
	stroke(128, 128, 128);
	strokeWeight(1);
	push();
	translate(15, height / 2);
	rotate(-HALF_PI);
	text("y-axis label 1", 0, 0);
	pop();

	stroke(128, 128, 128);
	strokeWeight(2);
	//y axis 2
	line(90, height - 50, 90, 50);
	//y 2 label
	stroke(128, 128, 128);
	strokeWeight(1);
	push();
	translate(65, height / 2);
	rotate(-HALF_PI);
	text("y-axis label 2", 0, 0);
	pop();

	//y axis 3 (on right)
	stroke(128, 128, 128);
	strokeWeight(2);
	line(750, height - 50, 750, 50);
	//y 3 label
	stroke(128, 128, 128);
	strokeWeight(1);
	push();
	translate(765, height / 2);
	rotate(-HALF_PI);
	text("y-axis label 3", 0, 0);
	pop();


	// determine the min and max values for x and y axes
	let minX = min(allDataArray.map(entry => entry.date.getTime()));
	let maxX = max(allDataArray.map(entry => entry.date.getTime()));
	let minY = min(allDataArray.map(entry => min(entry.deep, entry.light, entry.hrv)));
	let maxY = max(allDataArray.map(entry => max(entry.deep, entry.light, entry.hrv)));

	// map data points to canvas coordinates
	let mapX = scaleLinear()
	  .domain([minX, maxX])
	  .range([50, width - 50]);

	let mapY = scaleLinear()
	  .domain([minY, maxY])
	  .range([height - 50, 50]);

	// draw x and y axes
	// line(50, height - 50, width - 50, height - 50);
	// line(50, height - 50, 50, 50);

	// draw data points
	for (let entry of allDataArray) {
	  let x = mapX(entry.date.getTime());
	  let y = mapY(entry.hrv);
	  point(x, y);
	}
  }

  // function to find the minimum value in an array
  function min(arr) {
	return Math.min(...arr.filter(value => !isNaN(value)));
  }

  // function to find the maximum value in an array
  function max(arr) {
	return Math.max(...arr.filter(value => !isNaN(value)));
  }

  // Helper function for linear scaling
function scaleLinear() {
	let domain = [0, 1];
	let range = [0, 1];
	let clamp = false;

	function scale(x) {
	  let res = range[0] + (x - domain[0]) * (range[1] - range[0]) / (domain[1] - domain[0]);
	  return clamp ? Math.min(range[1], Math.max(range[0], res)) : res;
	}

	scale.domain = function(x) {
	  if (!arguments.length) return domain;
	  domain = x.map(Number);
	  return scale;
	}

	scale.range = function(x) {
	  if (!arguments.length) return range;
	  range = x.map(Number);
	  return scale;
	}

	scale.clamp = function(x) {
	  if (!arguments.length) return clamp;
	  clamp = x;
	  return scale;
	}

	return scale;
  }