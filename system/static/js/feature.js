var arr = new Array(21).fill(null).map(() => []);
var corr_arr = new Array(20).fill(null).map(() => []);
let hchart;
var hchartRendered = 0;

function shap_get_data(method, network, parameter, sig_filter, start, end, remov_list = '') {
    let params = {
        'method': method, //TSNE, PCA
        'network': network, //ingolsutad
        'parameter': parameter, //UMAP -> n_neighbor, TSNE-> perplexity
        'sig_filter': sig_filter,
        'time_st': start,
        'time_ed': end,
        'list': remov_list
    }

    fetch('/data/shapely_value', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        let parent = document.getElementById("fea");
        let paren = document.getElementById("select_list");
        while(parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
        while(paren.firstChild) {
            paren.removeChild(paren.firstChild);
        }
        if (hchartRendered == 1) hchart.destroy();
        const temp = {'feature_names': data.feature_names.slice(0,20),
                    'shapely_value': data.shapely_value.slice(0,20)}
        const fchart = createFeatureChart(temp)
        document.getElementById("fea").append(fchart);
        createFeatureList(temp.feature_names)
        arr = new Array(21).fill(null).map(() => []);
        corr_arr = new Array(20).fill(null).map(() => []);
        d3.csv("static/data/corr_df.csv")
            .then(function (data) {
                data.forEach(function (d, j) {
                    var i = 1;
                    for (let key in d) {
                        if (j === 0) {
                            arr[0].push(key);
                        }
                        if (d.hasOwnProperty(key)) {
                            arr[i].push(+d[key]);
                            i++
                        }
                    }
                })
                for (var i = 1; i < 21; i++) {
                    for (var j = 1; j < 21; j++) {
                        corr_arr[i-1].push(get_corr_value(arr[i], arr[j]))
                    }
                }
                drawHeatmap(corr_arr, arr[0]);
            })
    })
    .catch(error => {
        console.error("Error fetching data:", error);
    });
}

function createFeatureChart(data) {
    const barHeight = 25;
    const marginTop = 30;
    const marginRight = 0;
    const marginBottom = 10;
    const marginLeft = 30;
    const width = 440;
    const height = Math.ceil((data.feature_names.length + 0.1) * barHeight) + marginTop + marginBottom;

    const x = d3.scaleLinear()
        .domain([0, Math.abs(d3.max(data.shapely_value))]) // Use absolute max value for better visualization
        .range([marginLeft, width - marginRight]);

    const y = d3.scaleBand()
        .domain(data.feature_names)
        .rangeRound([marginTop, height - marginBottom])
        .padding(0.1);

    const format = x.tickFormat(20, "%");

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    svg.append("g")
        .attr("fill", "steelblue")
        .selectAll()
        .data(data.feature_names.map((feature, i) => ({ feature, shapValue: data.shapely_value[i] })))
        .join("rect")
        .attr("x", x(0))
        .attr("y", d => y(d.feature))
        .attr("width", d => x(Math.abs(d.shapValue)) - x(0)) // Use absolute value for width
        .attr("height", y.bandwidth())
        .on("mouseover", function (event, d) {
            const featureName = d.feature;
            const shapValue = d.shapValue;
    
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
    
            tooltip.html(`Feature Name: ${featureName}<br>Importance: ${shapValue}`)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
    
            d3.select(this)
                .attr("fill", "orange"); // or any highlighting style you prefer

            if (hchartRendered == 1) hchart.destroy();
            drawHeatmap(corr_arr, arr[0], featureName);
        })
        .on("click", function (event, d) {
            const featureName = d.feature;
            var olElement = document.getElementById('select_list');
            var targetLi = Array.from(olElement.getElementsByTagName('li')).filter(function(li) {
                return li.textContent.includes(featureName);
            })[0];
            targetLi.click();
        })
        .on("mouseout", function () {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
    
            d3.select(this)
                .attr("fill", "steelblue"); // revert to original color
        });

    svg.append("g")
        .attr("fill", "white")
        .attr("text-anchor", "end")
        .selectAll()
        .data(data.shapely_value)
        .join("text")
        .attr("x", (d) => x(Math.abs(d)))
        .attr("y", (d, i) => y(data.feature_names[i]) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("dx", -4)
        .text((d) => format(Math.abs(d)))
        .call((text) => text.filter(d => x(Math.abs(d)) - x(0) < 20) // short bars
            .attr("dx", +4)
            .attr("fill", "black")
            .attr("text-anchor", "start"));

    svg.append("g")
        .attr("transform", `translate(0,${marginTop})`)
        .call(d3.axisTop(x).ticks(width / 80, "%"))
        .call(g => g.select(".domain").remove());

    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y).tickSizeOuter(0));

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("z-index", 4)
        .style("background-color", "white")
        .style("border", "1px solid gray")
        .style("padding", "8px")
        .style("border-radius", "5px")
        .style("color", "black"); // Set the text color

    return svg.node();
}

document.addEventListener('DOMContentLoaded', function() {
    const dataSelect = document.getElementById('data');
    const timeFilterStart = document.getElementById('time-filter-start');
    const timeFilterEnd = document.getElementById('time-filter-end');
    const methodElement = document.getElementById('DRA');
    
    shap_get_data(methodElement.querySelector('select').value, dataSelect.querySelector("select").value, 81, '', '1', '2')

    dataSelect.addEventListener('change', function() {
        redraw()
    });

    timeFilterStart.addEventListener('change', function() {
        redraw()
    });

    timeFilterEnd.addEventListener('change', function() {
        redraw()
    });

});

function createFeatureList(data) {
    var olElement = document.createElement('ol');
    olElement.className = 'mylist'
    var ulElement = document.createElement('ul');
    ulElement.className = 'mylist'
    const select = document.getElementById('select_list');
    const remove = document.getElementById('removed_list');

    data.forEach(function(text) {
        var liElement = document.createElement('li');
        liElement.textContent = text;

        liElement.addEventListener('click', function() {
            liElement.style.color = 'red';
            var temp = document.createElement('li')
            temp.textContent = text;
            ulElement.appendChild(temp)
            redraw()
            temp.addEventListener('click', function() {
                liElement.style.color = 'black';
                ulElement.removeChild(temp)
                redraw()
            })
        });

        olElement.appendChild(liElement)
    })
    select.appendChild(olElement);
    remove.appendChild(ulElement);
}

function redraw() {
    let removedElement = document.getElementById('removed_list');
    let rm_list = []
    let sig_list = []
    let flag = 0
    
    let method = document.getElementById('DRA').querySelector('select').value;
    let value = document.getElementById('data').querySelector("select").value;
    let st = document.getElementById('time-filter-start').value;
    let ed = document.getElementById('time-filter-end').value;
    let param = value == '4x4' ? 81 : 105;

    var uls = removedElement.getElementsByTagName('ul');

    // 각 ul 요소에 대해 반복
    for (var i = 0; i < uls.length; i++) {
        // 현재 ul 요소의 모든 li 요소 찾기
        var lis = uls[i].getElementsByTagName('li');

        // 각 li 요소에 대해 반복하며 텍스트 출력
        Array.from(lis).forEach(function(li) {
            rm_list.push(li.textContent) // 필요한 경우 활성화
        });
    }
    

    let selectedDivs = toArray(document.getElementsByClassName("selected"));
    selectedDivs.forEach(function (div) {
        sig_list.push(div.textContent.slice(7, -1))
        flag = 1
    });
    
    if (flag == 0) {
        if (rm_list.length > 0) {
            shap_get_data(method, value, param, '', st, ed, rm_list)
            get_data(method, value, param, '', st, ed, rm_list)
        } else {
            shap_get_data(method, value, param, '', st, ed, '')
            get_data(method, value, param, '', st, ed, '')
        }
    }
    else {
        if (rm_list.length > 0) {
            shap_get_data(method, value, param, sig_list, st, ed, rm_list)
            get_data(method, value, param, sig_list, st, ed, rm_list)
        } else {
            shap_get_data(method, value, param, sig_list, st, ed, '')
            get_data(method, value, param, sig_list, st, ed, '')
            flag = 0
        }
    }
}

function drawHeatmap(corr_arr, tickNames, target='') {
    /*var color_set = new Array(20).fill(null).map(() => []);
    for (var i = 0; i < 20; i++) {
        for (var j = 0; j < 20; j++) {
            if (tickNames[i] === target || tickNames[j] === target) {
                color_set[i].push("#FFA500")
            } else {
                color_set[i].push("#008FFB")
            }
        }
    }*/

    let series = corr_arr.map((row, i) => {
        let colore = (tickNames[i] === target) ? "#FFA500" : "#008FFB"
        return {
            name: tickNames[i],
            data: row.map((value, j) => {
                return {
                    x: tickNames[j],
                    y: value,
                };
            }),
            color: colore,
        };
    });

    // ApexCharts 옵션 설정
    let options = {
        chart: {
            height: 400,
            width: 430,
            type: 'heatmap',
            tooltip: {
                enabled: true
            },
        },
        xaxis: {
            labels: {
                show: false // x축 레이블 숨기기
            },
            axisTicks: {
                show: false // x축 틱 숨기기
            }
        },
        // y축 설정
        yaxis: {
            labels: {
                show: false // y축 레이블 숨기기
            },
            axisTicks: {
                show: false // y축 틱 숨기기
            }
        },
        dataLabels: {
            enabled: true,
            formatter: function(val) {
                if (Math.round(val) == 1) {
                    return 1
                }
                else return Math.round(val * 100) / 100; // 소수점 두 자리로 반올림
            },
            style: {
                fontSize: '8px',
            },
        },
        tooltip: {
            enabled: true,
            x: {
                show: true
            },
            y: {
                formatter: function (val) {
                    if (Math.round(val) == 1) {
                        return 1
                    }
                    else return Math.round(val * 100) / 100; // 소수점 두 자리로 반올림
                }
            }
        },
        series: series,
        // 추가적인 옵션 설정 (색상 등)
    };

    // 차트 생성
    hchart = new ApexCharts(document.querySelector("#corr_space"), options);
    hchartRendered = 1
    hchart.render();
}

function get_corr_value(arr1, arr2) {
    const mean1 = arr1.reduce((acc, val) => acc + val) / arr1.length;
    const mean2 = arr2.reduce((acc, val) => acc + val) / arr2.length;
    
    // 표준 편차 계산
    const std1 = Math.sqrt(arr1.reduce((acc, val) => acc + (val - mean1) ** 2, 0) / (arr1.length - 1));
    const std2 = Math.sqrt(arr2.reduce((acc, val) => acc + (val - mean2) ** 2, 0) / (arr2.length - 1));
    
    // 공분산 게산
    const cov = arr1.reduce((acc, val, idx) => acc + ((val - mean1) * (arr2[idx] - mean2)), 0) / (arr1.length - 1);
    
    // 상관계수 계산
    const corrcoef = cov / (std1 * std2);
    return parseFloat(corrcoef)
}