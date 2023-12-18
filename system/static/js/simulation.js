let lchartRen = 0;
let tchart;
let schart;
let lchart;
let hischart;

function draw(method) {
    
    if (lchartRen == 1) {
        tchart.destroy()
        schart.destroy()
        lchart.destroy()
        hischart.destroy()
        lchartRen = 0;
    }

    var step = []
    for (var i = 1; i < 121; i++) {
        step.push(parseInt(i))
    }
    let ac_loss = new Array(3).fill(null).map(() => []);
    let ac_tt = new Array(3).fill(null).map(() => []);
    let ac_spd = new Array(3).fill(null).map(() => []);
    //d3.csv("static/data/" + method +"/cluster_data.csv")
    d3.csv("static/data/4x4/cluster_data.csv")
        .then(function (data) {
            data.forEach(function(d) {
                ac_loss[0].push(+d.loss)
                ac_loss[1].push(+d.loss6)
                ac_loss[2].push(+d.loss3)
                ac_spd[0].push(+d.spd)
                ac_spd[1].push(+d.spd6)
                ac_spd[2].push(+d.spd3)
                ac_tt[0].push(+d.tt)
                ac_tt[1].push(+d.tt6)
                ac_tt[2].push(+d.tt3)
            });
            drawSpd(step, ac_spd)
            drawLoss(step, ac_loss)
            drawTravel(step, ac_tt)
            drawHist()
            lchartRen = 1
        })
        .catch(function (error) {
            // Handle errors
            console.error("Error loading CSV file:", error);
        });
}
// 차트 생성 함수
/*
function createAreaChart(containerId, step, dataA, dataB) {
    const width = 360;
    const height = 150;
    const padding = 20;
    let chartTitle;

    if (containerId === 'stopped') {
        chartTitle = 'Total Stopped Count';
    } else if (containerId === 'speed') {
        chartTitle = 'Average Speed';
    } else {
        chartTitle = 'Total Waiting Time';
    }

    const data = step.map((s, i) => ({
        step: s,
        valueA: dataA[i],
        valueB: dataB[i]
    }));

    const svg = d3.select('#' + containerId)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.step))
        .range([padding, width - padding]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d.valueA, d.valueB))])
        .range([height - padding, padding]);

    const area = d3.area()
        .x(d => xScale(d.step))
        .y0(d => yScale(d.valueA))
        .y1(d => yScale(d.valueB));

    svg.append('path')
        .datum(data)
        .attr('class', 'area')
        .attr('d', area)
        .attr('fill-opacity', 0.7)
        .attr('fill', 'steelblue');

    svg.append('g')
        .attr('transform', 'translate(0,' + (height - padding) + ')')
        .call(d3.axisBottom(xScale));

    svg.append('g')
        .attr('transform', 'translate(' + padding + ',0)')
        .call(d3.axisLeft(yScale).ticks(7));

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', padding)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .text(chartTitle);
}
*/

function drawLoss(step, data) {
    let yaxisConfig = {
            type: 'numeric',
            min: 0,
            max: 350,
            tickAmount: 7,
        };

    let series = data.map((row, i) => {
        var name;
        if (i == 0){
            name = 'All Signal'
        } else if (i == 1) {
            name = 'All cluster Signal'
        } else{
            name = 'One cluster Signal'
        }
        return {
            name: name,
            data: row.map((value, j) => {
                return {
                    x: step[j],
                    y: value,
                };
            }),
        };
    });

    var options = {
        series: series,
        chart: {
            height: 200,
            width: 350,
            type: 'line'
        },
        stroke: {
            curve: 'smooth',
            width: 1,
        },
        title: {
            text: 'Average Loss Time'
        },
        xaxis: {
            type: 'numeric',
            tickAmount: 6, // 이 값을 조절하여 눈금의 갯수를 조절할 수 있습니다.
            min: 0, // x축의 최소값
            max: 120 // x축의 최대값, 여기서는 단순한 예시입니다.
        },
        yaxis: yaxisConfig,
    }
    lchart = new ApexCharts(document.getElementById('chart3'), options);
    lchart.render()
}

function drawTravel(step, data) {
    let yaxisConfig = {
            type: 'numeric',
            min: 200000,
            max: 600000,
            tickAmount: 5,
        };

    let series = data.map((row, i) => {
        var name;
        if (i == 0){
            name = 'All Signal'
        } else if (i == 1) {
            name = 'All cluster Signal'
        } else{
            name = 'One cluster Signal'
        }
        return {
            name: name,
            data: row.map((value, j) => {
                return {
                    x: step[j],
                    y: value,
                };
            }),
        };
    });

    var options = {
        series: series,
        chart: {
            height: 200,
            width: 350,
            type: 'line'
        },
        stroke: {
            curve: 'smooth',
            width: 1,
        },
        title: {
            text: 'Total Travel Time'
        },
        xaxis: {
            type: 'numeric',
            tickAmount: 6, // 이 값을 조절하여 눈금의 갯수를 조절할 수 있습니다.
            min: 0, // x축의 최소값
            max: 120 // x축의 최대값, 여기서는 단순한 예시입니다.
        },
        yaxis: yaxisConfig,
    }
    tchart = new ApexCharts(document.getElementById('chart4'), options);
    tchart.render()
}

function drawSpd(step, data) {
    let yaxisConfig = {
            type: 'numeric',
            min: 5,
            max: 10,
            tickAmount: 5,
        };

    let series = data.map((row, i) => {
        var name;
        if (i == 0){
            name = 'All Signal'
        } else if (i == 1) {
            name = 'All cluster Signal'
        } else{
            name = 'One cluster Signal'
        }
        return {
            name: name,
            data: row.map((value, j) => {
                return {
                    x: step[j],
                    y: value,
                };
            }),
        };
    });

    var options = {
        series: series,
        chart: {
            height: 200,
            width: 350,
            type: 'line'
        },
        stroke: {
            curve: 'smooth',
            width: 1,
        },
        title: {
            text: 'Average Speed'
        },
        xaxis: {
            type: 'numeric',
            tickAmount: 6, // 이 값을 조절하여 눈금의 갯수를 조절할 수 있습니다.
            min: 0, // x축의 최소값
            max: 120 // x축의 최대값, 여기서는 단순한 예시입니다.
        },
        yaxis: yaxisConfig,
    }
    schart = new ApexCharts(document.getElementById('chart2'), options);
    schart.render()
}

function drawHist() {
    var options = {
        series: [{
            name: 'All Signal',
            data: [{
                x: 'Running time',
                y: [0, 6502],
            }]
        }, {
            name: 'All Cluster',
            data: [{
                x: 'Running time',
                y: [0, 3237],
            }]
        }, {
            name: 'One Cluster Signal',
            data: [{
                x: 'Running time',
                y: [0, 2123],
            }]
        }],
        chart: {
            height: 200,
            width: 350,
            type: 'rangeBar'
        },
        title: {
            text: 'Running time'
        },
        plotOptions: {
            bar: {
              horizontal: false
            }
        },
        dataLabels: {
            enabled: true
        }
    };

    hischart = new ApexCharts(document.getElementById('chart1'), options);
    hischart.render()
} 