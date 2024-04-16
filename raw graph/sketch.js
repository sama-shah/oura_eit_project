let selectedFile;

// Get the selected file when input changes
document.getElementById("myFile").addEventListener("change", (event) => {
  selectedFile = event.target.files[0];
});
//arrays of our axis
var dates = [];
var HRV = [];
var deep = [];
var light = [];

// Handle upload button click
document.getElementById("upload-button").addEventListener("click", (e) => {
  e.preventDefault();
  let fileReader = new FileReader();

  // Read the selected file as binary string
  fileReader.readAsBinaryString(selectedFile);

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
      for(var i = 0; i < result.length; i++){
        //console.log("day: " + result[i].day + ", deep sleep: " + result[i].deep_sleep_duration + ", light sleep: " + result[i].light_sleep_duration + ", rem sleep: " + result[i].rem_sleep_duration + ", awake: " + result[i].awake_time + ", HRV: " + result[i].average_hrv);
        
        var dateArray = result[i].day.split("/");
        var dateObject = new Date(dateArray);
        dates.push(dateObject);
        HRV.push(result[i].average_hrv);
        deep.push(result[i].deep_sleep_duration);
        light.push(result[i].light_sleep_duration);
        

      }
      //console.log(result);
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
		title:{
			text: "Oura HRV, Sleep Chart"
		},
		axisY:[{
			title: "Deep Sleep",
			lineColor: "#C24642",
			tickColor: "#C24642",
			labelFontColor: "#C24642",
			titleFontColor: "#C24642",
			includeZero: true,
			suffix: ""
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

});



const uploadButton = document.getElementById("upload-button");

// Add an event listener to the upload button



uploadButton.addEventListener("click", function () {

  

})






