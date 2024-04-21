var dates = [];
	var HRV = [];
	var deep = [];
	var weight = [];

	// Handle upload button click
	document.getElementById("upload-button").addEventListener("click", (e) => {
		e.preventDefault();
		let sleepFileReader = new FileReader();
		let weightFileReader = new FileReader();

		// Get the selected files
		let sleepSelectedFile = document.getElementById("sleepFile").files[0];
		let weightSelectedFile = document.getElementById("weightFile").files[0];

		// Read the selected files as binary strings
		sleepFileReader.readAsBinaryString(sleepSelectedFile);
		weightFileReader.readAsBinaryString(weightSelectedFile);

		// Process the sleep data file when it's loaded
		sleepFileReader.onload = (event) => {
			let fileData = event.target.result;
			processSleepData(fileData);
		};

		// Process the weight data file when it's loaded
		weightFileReader.onload = (event) => {
			let fileData = event.target.result;
			processWeightData(fileData);
		};
	});

	function processSleepData(fileData) {
		// Read the Excel workbook
		let workbook = XLSX.read(fileData, { type: "binary" });

		// Change each sheet in the workbook to json
		workbook.SheetNames.forEach((sheet) => {
			const result = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { raw: false });
			for (var i = 0; i < result.length; i++) {
				var dateArray = result[i].day.split("/");
				var dateObject = new Date(dateArray[2], dateArray[0] - 1, dateArray[1]); // Adjusting month and day indices
				dates.push(dateObject);
				HRV.push(result[i].average_hrv);
				deep.push(result[i].deep_sleep_duration);
			}
		});

		// Call renderChart only after both sleep and weight data are processed
		renderChart();
	}

	function processWeightData(fileData) {
		// Read the Excel workbook for weight data
		let workbook = XLSX.read(fileData, { type: "binary" });

		// Change each sheet in the workbook to json
		workbook.SheetNames.forEach((sheet) => {
			const result = XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { raw: false });
			for (var i = 0; i < result.length; i++) {
				var dateArray = result[i].day.split("/");
				var dateObject = new Date(dateArray[2], dateArray[0] - 1, dateArray[1]); // Adjusting month and day indices
				// Find the corresponding index in dates array for the current weight date
				var index = dates.findIndex(date => date.getTime() === dateObject.getTime());
				// If the date exists in the dates array, push weight data
				if (index !== -1) {
					weight[index] = { x: dateObject, y: parseFloat(result[i].weight_lbs) }; // Adjusting month and day indices
				}
			}
		});
	}

	function renderChart() {
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

		var chart = new CanvasJS.Chart("chartContainer", {
			title: {
				text: "Oura HRV, Deep Sleep, and Weight Chart"
			},
			axisY: [{
					title: "HRV",
					lineColor: "#369EAD",
					tickColor: "#369EAD",
					labelFontColor: "#369EAD",
					titleFontColor: "#369EAD",
					includeZero: true,
					suffix: ""
				},
				{
					title: "Deep Sleep",
					lineColor: "#C24642",
					tickColor: "#C24642",
					labelFontColor: "#C24642",
					titleFontColor: "#C24642",
					includeZero: true,
					suffix: ""
				}
			],
			axisY2: {
				title: "Weight",
				lineColor: "#7F6084",
				tickColor: "#7F6084",
				labelFontColor: "#7F6084",
				titleFontColor: "#7F6084",
				includeZero: true,
				suffix: " lbs"
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
					axisYIndex: 0,
					dataPoints: AVGHRV
				},
				{
					type: "line",
					name: "Deep Sleep",
					color: "#C24642",
					axisYIndex: 1,
					showInLegend: true,
					dataPoints: AVGDEEP
				},
				{
					type: "line",
					name: "Weight",
					color: "#7F6084",
					axisYType: "secondary",
					showInLegend: true,
					dataPoints: weight
				}
			]
		});
		chart.render();

		function toggleDataSeries(e) {
			if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
				e.dataSeries.visible = false;
			} else {
				e.dataSeries.visible = true;
			}
			e.chart.render();
		}
	}