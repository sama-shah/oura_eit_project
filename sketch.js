let sleepPeriodsFile;
let weightFile;
let allData = {};
let allDataArray = [];
let hrvRange = 0;
let hrvMin;
let dateCoordinates = [];
let filteredData = [];
let hrvAvgElement, sleepDurationAvgElement, weightAvgElement;
let hrvAvgText, sleepDurationAvgText, weightAvgText;

// Get the selected file when input changes
// document.getElementById("sleepperiods").addEventListener("change", (event) => {
// 	sleepPeriodsFile = event.target.files[0];
// });
// document.getElementById("weight").addEventListener("change", (event) => {
// 	weightFile = event.target.files[0];
// });

//arrays of our axis
var dates = [];
var HRV = [];
var deep = [];
var light = [];
var weight = [];

document.getElementById('start-date').addEventListener('change', draw);
document.getElementById('end-date').addEventListener('change', draw);

// Handle upload button click
document.getElementById("upload-button1").addEventListener("click", (e) => {
	e.preventDefault();

	const sleepPeriodsFile = document.getElementById("upload1").files[0];
	const weightFile = document.getElementById("upload2").files[0];

	if (!sleepPeriodsFile || !weightFile) {
		console.error("Please select both files before uploading.");
		return;
	}
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
			console.log("Weight data from sheet:", sheet);
        	console.log(result);
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
					if (result[i].day in allData) {
						var entry = allData[result[i].day];
						entry.weight = result[i].weight_lbs;
						entry.dosage = result[i].dosage;

					}

				}
				console.log("filteredData 1: ", filteredData);
				draw();
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


		};

	};

});

document.getElementById('start-date').addEventListener('change', draw);
document.getElementById('end-date').addEventListener('change', draw);

class DataEntry {
	constructor(date, deep, light, rem, awake, hrv) {
		this.date = date;
		this.deep = deep;
		this.light = light;
		this.rem = rem;
		this.awake = awake;
		this.hrv = hrv;
		this.sleep = parseInt(this.deep) + parseInt(this.light) + parseInt(this.rem) + parseInt(this.awake);
	}

	getDate() {
		return this.date;
	}
	getHRV() {
		return this.hrv;
	}
	getSleep() {
		return parseInt(this.deep) + parseInt(this.light) + parseInt(this.rem) + parseInt(this.awake);
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
	var canvas = createCanvas(1000, 500);
	canvas.parent("main-sketch-area");
	frameRate(60);
	noLoop();

	hoverBox = createDiv(''); // Create a new div element for the hover box
	hoverBox.style('background-color', 'rgba(255, 255, 255, 0.8)');
	hoverBox.style('padding', '5px');
	hoverBox.style('position', 'absolute');
	hoverBox.style('display', 'none'); // Initially hide the hover box

	// Get references to the HTML elements for displaying averages
    hrvAvgElement = document.getElementById('hrv-avg');
    sleepDurationAvgElement = document.getElementById('sleep-duration-avg');
    weightAvgElement = document.getElementById('weight-avg');

	hrvAvgText = document.getElementById('hrv-avg-text');
    sleepDurationAvgText = document.getElementById('sleep-duration-avg-text');
    weightAvgText = document.getElementById('weight-avg-text');
}

function draw() {

	const startDateInput = document.getElementById('start-date');
	const endDateInput = document.getElementById('end-date');

	let startDate = null;
	let endDate = null;

	if (startDateInput.value) {
		startDate = new Date(startDateInput.value);
	}

	if (endDateInput.value) {
		endDate = new Date(endDateInput.value);
	}

	filteredData = allDataArray;

	if (startDate && endDate) {
	  filteredData = allDataArray.filter(entry => {
		const entryDate = entry.getDate();
		return entryDate >= startDate && entryDate <= endDate;
	  });
	}

    // Calculate average HRV and sleep duration
	// console.log(entry instanceof DataEntry); // Should log true
	// console.log(entry); // Check what 'entry' contains

// 	const hrvValues = filteredData.map(entry => parseFloat(entry.getHRV()));
//   const hrvAverage = hrvValues.length > 0 ? hrvValues.reduce((sum, value) => sum + value, 0) / hrvValues.length : 0;
//   console.log("HRV Values:", hrvValues);

//     // const hrvValues = filteredData.map(entry => parseFloat(entry.getHRV()));
//     // const hrvAverage = hrvValues.reduce((sum, value) => sum + value, 0) / hrvValues.length;

//     const sleepDurationValues = filteredData.map(entry => entry.getSleep() / 3600);
//     const sleepDurationAverage = sleepDurationValues.reduce((sum, value) => sum + value, 0) / sleepDurationValues.length;

//     // Calculate average weight
// 	const weightValues = filteredData.map(entry => parseFloat(entry.weight));
//   const weightAverage = weightValues.length > 0 ? weightValues.reduce((sum, value) => sum + value, 0) / weightValues.length : 0;
//   console.log("Weight Values:", weightValues);

    // const weightValues = filteredData.map(entry => parseFloat(entry.weight)); // getWeight()???
    // const weightAverage = weightValues.reduce((sum, value) => sum + value, 0) / weightValues.length;

	const hrvValues = filteredData.map(entry => parseFloat(entry.getHRV())).filter(value => !isNaN(value));
	const hrvAverage = hrvValues.length > 0 ? hrvValues.reduce((sum, value) => sum + value, 0) / hrvValues.length : 0;
	
	// Calculate average sleep duration
	const sleepDurationValues = filteredData.map(entry => entry.getSleep() / 3600);
	const sleepDurationAverage = sleepDurationValues.reduce((sum, value) => sum + value, 0) / sleepDurationValues.length;
	
	// Filter out NaN values for weight
	const weightValues = filteredData.map(entry => parseFloat(entry.weight)).filter(value => !isNaN(value));
	const weightAverage = weightValues.length > 0 ? weightValues.reduce((sum, value) => sum + value, 0) / weightValues.length : 0;
	

	// format start and end dates
	// Format the start and end dates
    const startDateFormatted = startDate ? `${startDate.getMonth() + 1}/${startDate.getDate()}/${startDate.getFullYear()}` : 'N/A';
    const endDateFormatted = endDate ? `${endDate.getMonth() + 1}/${endDate.getDate()}/${endDate.getFullYear()}` : 'N/A';

    // Update HRV average
    hrvAvgElement.textContent = `${hrvAverage.toFixed(2)} ms`;
	hrvAvgText.textContent = `ON AVERAGE ${startDateFormatted} - ${endDateFormatted}`;


    // Update sleep duration average
    sleepDurationAvgElement.textContent = `${sleepDurationAverage.toFixed(2)} hrs`;
	sleepDurationAvgText.textContent = `ON AVERAGE ${startDateFormatted} - ${endDateFormatted}`;

    // Update weight average
    weightAvgElement.textContent = `${weightAverage.toFixed(2)} lbs`;
	weightAvgText.textContent = `ON AVERAGE ${startDateFormatted} - ${endDateFormatted}`;
	console.log("start date", startDateFormatted)

	background(255);

	stroke(128, 128, 128);
	strokeWeight(1);
	//x axis

	//starts at x = 90

	line(90, height - 50, width - 50, height - 50);
	// x aixs label
	// stroke(128, 128, 128);
	// strokeWeight(1);
	fill(0)
	textSize(16);
	textAlign(CENTER, TOP);

	noStroke()
	text("Date", width / 2, height - 20);


	//y axis 1
	stroke(128, 128, 128);
	strokeWeight(1);
	line(40, height - 50, 40, 50);
	// y axis 1 label
	stroke(128, 128, 128);
	strokeWeight(1);
	push();
	translate(0, height / 2);
	rotate(-HALF_PI);
	noStroke();
	fill("#388D36");
	text("HR Variability (ms)", 0, 0);
	pop();

	stroke(128, 128, 128);
	strokeWeight(1);
	//y axis 2
	line(90, height - 50, 90, 50);
	//y 2 label
	stroke(128, 128, 128);
	strokeWeight(1);
	push();
	translate(65, height / 2);
	rotate(-HALF_PI);
	noStroke();
	fill("#FF0000");
	text("Weight (lbs)", 0, -16);
	pop();

	//y axis 3 (on right)
	stroke(128, 128, 128);
	strokeWeight(1);
	line(width - 50, height - 50, width - 50, 50); // Adjusted the x-coordinate here
	// y 3 label
	stroke(128, 128, 128);
	strokeWeight(1);
	push();
	translate(width - 20, height / 2);
	rotate(-HALF_PI);
	noStroke();
	fill("#3268ba");
	text("Sleep Duration (s)", 0, 0);
	pop();

	

	console.log("filteredData length:", filteredData.length);
	//placing the date x axis
	//rotate(45);
	textAlign(LEFT, TOP);
	textSize(7);
	for (var i = 0; i < filteredData.length; i++) {
		push();
		noStroke();
		translate(95 + ((width - 50 - 90) / filteredData.length) * i, height - 50);
		rotate(QUARTER_PI);
		text((filteredData[i].getDate().getMonth()) + 1 + "/" + (filteredData[i].getDate().getDate()) + "/" + (filteredData[i].getDate().getFullYear()), 0, 0);
		//console.log(allDataArray[i].getDate());
		//console.log(90 + ((width - 50-90)/allDataArray.length)*i);
		pop();
	}

	var sleepMax = parseInt(filteredData[0].getSleep());

	for (var i = 0; i < filteredData.length; i++) {
		var currentSleep = parseInt(filteredData[i].getSleep());
		if (currentSleep > sleepMax) {
			sleepMax = currentSleep;
		}
	}

	 // Store the x-coordinates of the dates
	 for (let i = 0; i < filteredData.length; i++) {
		const x = 95 + ((width - 50 - 90) / filteredData.length) * i;
		const date = filteredData[i].getDate();
		dateCoordinates.push({ x, date });
	  }

	console.log("sleep max" + sleepMax);
	noStroke();
	fill(0);

	for (var i = 0; i < sleepMax / 2000; i++) {
		push();
		translate(0, height - 50 - ((height - 100) / (sleepMax / 2000)) * i);
		stroke(0);
		line(width-40, 0, width-50, 0);
		
		noStroke();
	fill(0);
		text(i * 2 + "00", 962, -3);
		pop();
	}

	stroke(0); // Set the stroke color to black (you can change this value)
	strokeWeight(1); // Set the stroke weight (thickness) of the bars
	noStroke();
	fill("#9cbbe8");
	for (var i = 0; i < filteredData.length; i++) {
		let x = 90 + ((width - 50 - 90) / filteredData.length) * i;
		let y = height - 50 - (((height - 100) / sleepMax) * (parseInt(filteredData[i].getSleep())));
		let barWidth = (width - 50 - 90) / filteredData.length; // Calculate the width of each bar
		let barHeight = (((height - 100) / sleepMax) * (parseInt(filteredData[i].getSleep()))); // Calculate the height of each bar

		if (document.getElementById('toggle-sleep').checked) {
			noStroke();
			fill("#9cbbe8");

			// Draw a rectangle for each bar
			rect(x, y, barWidth, barHeight);
		  }
		}

	//figruing out the min max of HRV


	var hrvMax = parseInt(filteredData[0].getHRV());
	var hrvMin = parseInt(filteredData[0].getHRV());

	for (var i = 0; i < filteredData.length; i++) {
		var currentHRV = parseInt(filteredData[i].getHRV());
		if (currentHRV < hrvMin) {
			hrvMin = currentHRV;

		}
		if (currentHRV > hrvMax) {
			hrvMax = currentHRV;

		}
	}

	hrvMin -= 3;

	var hrvRange = hrvMax - hrvMin + 1;
	// console.log("range: " + hrvRange);
	//placing the y axis
	//line(40, height - 50, 40, 50);
	for (var i = 0; i < hrvRange; i++) {
		push();
		translate(0, height - 50 - ((height - 100) / hrvRange) * i);
		stroke(0);
		line(30, 0, 40, 0);
		noStroke();
	fill(0);
		text(hrvMin + i, 20, -3);
		// console.log(hrvMin + i);
		pop();
	}

	//draw hrv data points 
	// for (var i = 0; i < allDataArray.length; i++) {
	// 	push();
	// 	circle(95 + ((width - 50 - 90) / allDataArray.length) * i, height - 50-(((height - 100) / hrvRange) * (parseInt(allDataArray[i].getHRV()) - hrvMin)) , 5);
	// 	pop();
	// }

// Draw HRV data if the checkbox is checked
if (document.getElementById('toggle-hrv').checked) {
	beginShape();
	noFill(); // This line ensures that there is no fill for the shape
	stroke("#388D36"); // Set the stroke color to black (you can change this value)
	strokeWeight(1);
	for (var i = 0; i < filteredData.length; i++) {
	  let x = 95 + ((width - 50 - 90) / filteredData.length) * i;
	  let y = height - 50 - (((height - 100) / hrvRange) * (parseInt(filteredData[i].getHRV()) - hrvMin));
	  vertex(x, y);
	}
	endShape();
  }
	// for(var i = 0 ; i < allDataArray.length ; i++){
	// 	circle(((width - 50-90)/allDataArray.length), allDataArray[i].getHRV(),10);
	// }
	noStroke();
	fill(0);
	var weightMax = parseInt(filteredData[0].weight);
	var weightMin = parseInt(filteredData[0].weight);
	// var weightMax = -Infinity;
	// var weightMin = Infinity;

	for (var i = 0; i < filteredData.length; i++) {
		var currentWeight = parseInt(filteredData[i].weight);
		if (currentWeight < weightMin) {
			weightMin = currentWeight;

		}
		if (currentWeight > weightMax) {
			weightMax = currentWeight;

		}
	}
	weightMin -= 3;
	var weightRange = weightMax - weightMin + 1;

	// console.log("weight range" + weightRange);

	for (var i = 0; i < weightRange; i++) {
		push();
		translate(0, height - 50 - ((height - 100) / weightRange) * i);
		stroke(0);
		line(80, 0, 90, 0);
		noStroke();
		fill(0);
		text(weightMin + i, 70, -3);
		pop();
	}

if (document.getElementById('toggle-weight').checked) {
	beginShape();
	noFill(); // This line ensures that there is no fill for the shape
	stroke("#FF0000"); // Set the stroke color to black (you can change this value)
	strokeWeight(1);
	for (var i = 0; i < filteredData.length; i++) {
		let x = 95 + ((width - 50 - 90) / filteredData.length) * i;
		let y = height - 50 - (((height - 100) / weightRange) * (parseInt(filteredData[i].weight) - weightMin));
		vertex(x, y);
	}

	endShape();
}

	// for (var i = 0; i < allDataArray.length; i++) {
	// 	if (parseInt(allDataArray[i].dosage) > 0) {
	// 	  push(); // Save the current canvas state
	// 	  translate(90 + ((width - 50 - 90) / allDataArray.length) * i, height - 50); // Translate to the center of the line
	// 	  rotate(HALF_PI); // Rotate the canvas by 90 degrees
	// 	  line(0, 5, -(height-100),5 ); // Draw the vertical line
	// 	  pop(); // Restore the canvas state
	// 	}
		
	// }
	for (var i = 0; i < filteredData.length; i++) {
		if (parseInt(filteredData[i].dosage) > 0) {
			let x = 95 + ((width - 50 - 90) / filteredData.length) * i; // X-coordinate for text
			let y = height - 50 - (height - 100); // Y-coordinate for text
	
			push(); // Save the current canvas state
			translate(x, height - 50); // Translate to the center of the line
			stroke(150); // Set stroke color to gray
			strokeWeight(1); // Set thickness of the line
			for (let yDash = 0; yDash < height - 100; yDash += 10) {
				line(0, -yDash, 0, -(yDash + 5)); // Draw dashed line segments with negative y values to move higher up
			}
	
			pop(); // Restore the canvas state
	
			// Draw text
			fill(0); // Set fill color to black
			noStroke(); // Remove stroke
			textAlign(CENTER, BOTTOM); // Align text horizontally to center and vertically to bottom
			text(filteredData[i].dosage+ " mg", x, y); // Draw dosage value
		}
	}
	
	


	// beginShape();
	// noFill(); // This line ensures that there is no fill for the shape
	// stroke(0); // Set the stroke color to black (you can change this value)
	// strokeWeight(1);
	// for (var i = 0; i < allDataArray.length; i++) {
	// 	let x = 95 + ((width - 50 - 90) / allDataArray.length) * i;
	// 	let y = height - 50 - (((height - 100) / sleepMax) * (parseInt(allDataArray[i].getSleep) ));
	// 	vertex(x, y);
	// }
	// endShape();


	// determine the min and max values for x and y axes

	let minX = min(filteredData.map(entry => entry.date.getTime()));
	let maxX = max(filteredData.map(entry => entry.date.getTime()));
	let minY = min(filteredData.map(entry => min(entry.deep, entry.light, entry.getHrv())));
	let maxY = max(filteredData.map(entry => max(entry.deep, entry.light, entry.getHrv())));

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

	// draw data points of HRV
	// for (let entry of allDataArray) {
	// 	let x = mapX(entry.date.getTime());
	// 	let y = mapY(entry.hrv);
	// 	point(x, y);
	// }
}

// line graph hover interaction:

// function mouseMoved() {
// 	mouseMovedOverGraph();
//   }
  
  function mouseMoved() {
	const summaryData = document.getElementById('summary-data');
	summaryData.innerHTML = ''; // Clear the previous data

	// Check if the mouse is over any of the date coordinates
	for (const { x, date } of dateCoordinates) {
		const distanceFromDate = dist(mouseX, mouseY, x, height - 50);
		if (distanceFromDate < 10) { // Adjust this value as needed
		const entry = filteredData[filteredData.findIndex(e => e.getDate().getTime() === date.getTime())];
		const hrv = entry.getHRV();
		const weight = entry.weight;
		const sleep = entry.getSleep();
		const dateStr = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
		const dataHTML = `
			<p><strong>Date:</strong> ${dateStr}</p>
			<p><strong>HRV:</strong> ${hrv}</p>
			<p><strong>Weight:</strong> ${weight}</p>
			<p><strong>Sleep:</strong> ${sleep}</p>
		`;
		summaryData.innerHTML = dataHTML;
		break;
		}
	}



	  
	// hoverBox.style('display', 'none'); // Initially hide the hover box
  
	// // Check if the mouse is over any of the date coordinates
	// for (const { x, date } of dateCoordinates) {
	//   const distanceFromDate = dist(mouseX, mouseY, x, height - 50);
	//   if (distanceFromDate < 10) { // Adjust this value as needed
	// 	const entry = allDataArray[allDataArray.findIndex(e => e.getDate().getTime() === date.getTime())];
	// 	const hrv = entry.getHRV();
	// 	const weight = entry.weight;
	// 	const sleep = entry.getSleep();
	// 	const dateStr = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
	// 	hoverBox.html(`Date: ${dateStr}<br>HRV: ${hrv}<br>Weight: ${weight}<br>Sleep: ${sleep}`);
	// 	hoverBox.position(mouseX + 10, mouseY + 10);
	// 	hoverBox.style('display', 'block');
	// 	break;
	//   }
  	//}
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

	scale.domain = function (x) {
		if (!arguments.length) return domain;
		domain = x.map(Number);
		return scale;
	}

	scale.range = function (x) {
		if (!arguments.length) return range;
		range = x.map(Number);
		return scale;
	}

	scale.clamp = function (x) {
		if (!arguments.length) return clamp;
		clamp = x;
		return scale;
	}

	return scale;
}
