let sleepPeriodsFile;
let weightFile;
let allData = {};
let allDataArray = [];
let hrvRange;
let hrvMin;

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


					}

				}
				console.log(allDataArray);
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

class DataEntry {
	constructor(date, deep, light, rem, awake, hrv) {
		this.date = date;
		this.deep = deep;
		this.light = light;
		this.rem = rem;
		this.awake = awake;
		this.hrv = hrv;
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
	var canvas = createCanvas(800, 400);
	canvas.parent("main-sketch-area");
	frameRate(60);
	noLoop();

	hoverBox = createDiv(''); // Create a new div element for the hover box
	hoverBox.style('background-color', 'rgba(255, 255, 255, 0.8)');
	hoverBox.style('padding', '5px');
	hoverBox.style('position', 'absolute');
	hoverBox.style('display', 'none'); // Initially hide the hover box
}

function draw() {
	background(255);

	stroke(128, 128, 128);
	strokeWeight(2);
	//x axis

	//starts at x = 90

	line(90, height - 50, width - 50, height - 50);
	// x aixs label
	stroke(128, 128, 128);
	strokeWeight(1);
	textSize(16);
	textAlign(CENTER, TOP);
	text("date", width / 2, height - 20);

	//y axis 1
	stroke(128, 128, 128);
	strokeWeight(2);
	line(40, height - 50, 40, 50);
	// y axis 1 label
	stroke(128, 128, 128);
	strokeWeight(1);
	push();
	translate(0, height / 2);
	rotate(-HALF_PI);
	text("HRV", 0, 0);
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
	text("Weight", 0, -16);
	pop();

	//y axis 3 (on right)
	stroke(128, 128, 128);
	strokeWeight(2);
	line(750, height - 50, 750, 50);
	//y 3 label
	stroke(128, 128, 128);
	strokeWeight(1);
	push();
	translate(785, height / 2);
	rotate(-HALF_PI);
	text("Sleep", 0, 0);
	pop();

	console.log(allDataArray.length);
	//placing the date x axis
	//rotate(45);
	textAlign(LEFT, TOP);
	textSize(7);
	for (var i = 0; i < allDataArray.length; i++) {
		push();
		translate(95 + ((width - 50 - 90) / allDataArray.length) * i, height - 50);
		rotate(QUARTER_PI);
		text((allDataArray[i].getDate().getMonth()) + 1 + "/" + (allDataArray[i].getDate().getDate()) + "/" + (allDataArray[i].getDate().getFullYear()), 0, 0);
		//console.log(allDataArray[i].getDate());
		//console.log(90 + ((width - 50-90)/allDataArray.length)*i);
		pop();
	}
	var sleepMax = parseInt(allDataArray[0].getSleep());

	for (var i = 0; i < allDataArray.length; i++) {
		var currentSleep = parseInt(allDataArray[i].getSleep());
		if (currentSleep > sleepMax) {
			sleepMax = currentSleep;
		}
	}

	console.log("sleep max" + sleepMax);
	noStroke();
	fill(0);

	for (var i = 0; i < sleepMax / 2000; i++) {
		push();
		translate(0, height - 50 - ((height - 100) / (sleepMax / 2000)) * i);
		stroke(0);
		line(750, 0, 760, 0);
		
		noStroke();
	fill(0);
		text(i * 2 + "00", 765, -3);
		pop();
	}

	stroke(0); // Set the stroke color to black (you can change this value)
	strokeWeight(1); // Set the stroke weight (thickness) of the bars
	noStroke();
	fill(200);
	for (var i = 0; i < allDataArray.length; i++) {
		let x = 90 + ((width - 50 - 90) / allDataArray.length) * i;
		let y = height - 50 - (((height - 100) / sleepMax) * (parseInt(allDataArray[i].getSleep())));
		let barWidth = (width - 50 - 90) / allDataArray.length; // Calculate the width of each bar
		let barHeight = (((height - 100) / sleepMax) * (parseInt(allDataArray[i].getSleep()))); // Calculate the height of each bar

		// Draw a rectangle for each bar
		rect(x, y, barWidth, barHeight);
	}
	noStroke();
	fill(0);

	//figruing out the min max of HRV


	var hrvMax = parseInt(allDataArray[0].getHRV());
	var hrvMin = parseInt(allDataArray[0].getHRV());

	for (var i = 0; i < allDataArray.length; i++) {
		var currentHRV = parseInt(allDataArray[i].getHRV());
		if (currentHRV < hrvMin) {
			hrvMin = currentHRV;

		}
		if (currentHRV > hrvMax) {
			hrvMax = currentHRV;

		}
	}

	hrvMin -= 3;

	var hrvRange = hrvMax - hrvMin + 1;
	console.log("range: " + hrvRange);
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
		console.log(hrvMin + i);
		pop();
	}

	//draw hrv data points 
	// for (var i = 0; i < allDataArray.length; i++) {
	// 	push();
	// 	circle(95 + ((width - 50 - 90) / allDataArray.length) * i, height - 50-(((height - 100) / hrvRange) * (parseInt(allDataArray[i].getHRV()) - hrvMin)) , 5);
	// 	pop();
	// }

	beginShape();
	noFill(); // This line ensures that there is no fill for the shape
	stroke(0); // Set the stroke color to black (you can change this value)
	strokeWeight(1);
	for (var i = 0; i < allDataArray.length; i++) {
		let x = 95 + ((width - 50 - 90) / allDataArray.length) * i;
		let y = height - 50 - (((height - 100) / hrvRange) * (parseInt(allDataArray[i].getHRV()) - hrvMin));
		vertex(x, y);
	}
	endShape();
	// for(var i = 0 ; i < allDataArray.length ; i++){
	// 	circle(((width - 50-90)/allDataArray.length), allDataArray[i].getHRV(),10);
	// }
	noStroke();
	fill(0);
	var weightMax = parseInt(allDataArray[0].weight);
	var weightMin = parseInt(allDataArray[0].weight);

	for (var i = 0; i < allDataArray.length; i++) {
		var currentWeight = parseInt(allDataArray[i].weight);
		if (currentWeight < weightMin) {
			weightMin = currentWeight;

		}
		if (currentWeight > weightMax) {
			weightMax = currentWeight;

		}
	}
	weightMin -= 3;
	var weightRange = weightMax - weightMin + 1;

	console.log("weight range" + weightRange);
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

	beginShape();
	noFill(); // This line ensures that there is no fill for the shape
	stroke(0); // Set the stroke color to black (you can change this value)
	strokeWeight(1);
	for (var i = 0; i < allDataArray.length; i++) {
		let x = 95 + ((width - 50 - 90) / allDataArray.length) * i;
		let y = height - 50 - (((height - 100) / weightRange) * (parseInt(allDataArray[i].weight) - weightMin));
		vertex(x, y);
	}
	endShape();




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

	// draw data points of HRV
	for (let entry of allDataArray) {
		let x = mapX(entry.date.getTime());
		let y = mapY(entry.hrv);
		point(x, y);
	}
}

// line graph hover box interaction:

function mouseMoved() {
	mouseMovedOverGraph();
  }
  
function mouseMovedOverGraph() {
// Check if the mouse is over the graph area
if (mouseX > 90 && mouseX < width - 50 && mouseY > 50 && mouseY < height - 50) {
	// Find the closest data point to the mouse position
	let closestIndex = -1;
	let closestDistance = Infinity;
	for (let i = 0; i < allDataArray.length; i++) {
	const x = 95 + ((width - 50 - 90) / allDataArray.length) * i;
	const y = height - 50 - (((height - 100) / hrvRange) * (parseInt(allDataArray[i].getHRV()) - hrvMin));
	const distance = dist(mouseX, mouseY, x, y);
	if (distance < closestDistance) {
		closestDistance = distance;
		closestIndex = i;
	}
	}

	// Display the hover box with the data point information
	if (closestIndex !== -1) {
	const entry = allDataArray[closestIndex];
	const date = `${entry.getDate().getMonth() + 1}/${entry.getDate().getDate()}/${entry.getDate().getFullYear()}`;
	const hrv = entry.getHRV();
	const weight = entry.weight;
	const sleep = entry.getSleep();
	hoverBox.html(`Date: ${date}<br>HRV: ${hrv}<br>Weight: ${weight}<br>Sleep: ${sleep}`);
	hoverBox.position(mouseX + 10, mouseY + 10);
	hoverBox.style('display', 'block');
	} else {
	hoverBox.style('display', 'none');
	}
} else {
	hoverBox.style('display', 'none');
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