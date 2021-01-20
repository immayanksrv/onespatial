//Flot Line Chart
$(document).ready(function() {
    console.log("document ready");
    var offset = 0;
    plot();

    function plot() {
        var sin = [],
            cos = [];
        for (var i = 0; i < 12; i += 0.2) {
            sin.push([i, Math.sin(i + offset)]);
            cos.push([i, Math.cos(i + offset)]);
        }

        var options = {
            series: {
                lines: {
                    show: true
                },
                points: {
                    show: true
                }
            },
            grid: {
                hoverable: true //IMPORTANT! this is needed for tooltip to work
            },
            yaxis: {
                min: -1.2,
                max: 1.2
            },
            tooltip: true,
            tooltipOpts: {
                content: "'%s' of %x.1 is %y.4",
                shifts: {
                    x: -60,
                    y: 25
                }
            }
        };

      
    }

//Flot Pie Chart
$(function() {

    var data = [{
        label: "Verizon",
        data: 16
    }, {
        label: "NV Energy",
        data: 2
    }, {
        label: "Duke Energy",
        data: 2
    }, {
        label: "PacifiCorp",
        data: 2
    },
	{
        label: "TGS",
        data: 1
    },
	{
        label: "Walmart",
        data: 1
    },
	{
        label: "Cox",
        data: 1
    }
	,
	{
        label: "Orica",
        data: 1
    }];

	var MaximoData = [{
        label: "PNMR",
        data: 2
    }, {
        label: "DLC",
        data: 1
    }
	];

    var plotObj = $.plot($("#flot-pie-chart"), data, {
        series: {
            pie: {
                show: true,
				
            }
        },
        grid: {
            hoverable: true
        },
        tooltip: true,
        tooltipOpts: {
            content: "%p.0%, %s", // show percentages, rounding to 2 decimal places
            shifts: {
                x: 20,
                y: 0
            },
            defaultTheme: false
        }
    });
	
	 var plotObj1 = $.plot($("#flot-pie-chart1"), MaximoData, {
        series: {
            pie: {
                show: true
            }
        },
        grid: {
            hoverable: true
        },
        tooltip: true,
        tooltipOpts: {
            content: "%p.0%, %s", // show percentages, rounding to 2 decimal places
            shifts: {
                x: 20,
                y: 0
            },
            defaultTheme: false
        }
    });

});



});
