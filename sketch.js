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
        var dateArray = result[i].day.split("/");
        var dateObject = new Date(dateArray);
        dates.push(dateObject);
        HRV.push(result[i].average_hrv);
        deep.push(result[i].deep_sleep_duration);
        light.push(result[i].light_sleep_duration);
      }
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
        text: "Oura HRV, Sleep Chart",
        fontFamily: "Times New Roman",
        fontColor: "#333333"
      },
      axisY:[{
        title: "Deep Sleep",
        lineColor: "#29434e",
        tickColor: "#29434e",
        labelFontColor: "#29434e",
        titleFontColor: "#29434e",
        includeZero: true,
        suffix: "",
        gridColor: "#98abc5"
      },
      {
        title: "HRV",
        lineColor: "#4374B3",
        tickColor: "#4374B3",
        labelFontColor: "#4374B3",
        titleFontColor: "#4374B3",
        includeZero: true,
        suffix: "",
        gridColor: "#98abc5"
      }],
      axisY2: {
        title: "Light Sleep",
        lineColor: "#6D84B4",
        tickColor: "#6D84B4",
        labelFontColor: "#6D84B4",
        titleFontColor: "#6D84B4",
        includeZero: true,
        prefix: "",
        suffix: "",
        gridColor: "#98abc5"
      },
      toolTip: {
        shared: true
      },
      legend: {
        cursor: "pointer",
        itemclick: toggleDataSeries,
        fontColor: "#333333"
      },
	  data: [{
		type: "line",
		name: "HRV",
		color: "#ab274f",
		showInLegend: true,
		axisYIndex: 1,
		fillOpacity: 0.3, 
		fill: "rgba(67, 116, 179, 0.3)",
		dataPoints: AVGHRV
	},
      {
        type: "line",
        name: "Deep Sleep",
        color: "#29434e",
        axisYIndex: 0,
        showInLegend: true,
        dataPoints: AVGDEEP
      },
      {
        type: "line",
        name: "Light Sleep",
        color: "#6D84B4",
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
