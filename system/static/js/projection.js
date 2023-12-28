var points = [];
let gInsidePolygonList = []
let poly_color = 0;
let size;

function setButtonClickHandler() {
    poly_color += 1
    const gElements = d3.select("svg").selectAll("circle").nodes();

    let temp = [];
    for (let j = 0; j < gElements.length; j++) {
        if (d3.polygonContains(points, [gElements[j].getAttribute('cx'), gElements[j].getAttribute('cy')])) {
            gElements[j].setAttribute('r', String(parseInt(size) + 10))
            temp.push(gElements[j].getAttribute("data_idx"))
        }
    }
    gInsidePolygonList.push(temp)

    points = []

    let shapeElements = document.getElementById('shape_map');
    let nodeElements = shapeElements.querySelectorAll("svg circle");
    var ysize = 1;
    if (document.getElementById('data').querySelector("select").value == 'gangnam') {
        ysize = 2;
    }
    
    for (let i = 0; i < nodeElements.length; i++) {
        for (let j = 0; j < gInsidePolygonList.length; j++) {
            if (gInsidePolygonList[j].includes(String(i))) {
                let cx = parseFloat(nodeElements[i].getAttribute("cx"));
                let cy = parseFloat(nodeElements[i].getAttribute("cy"));

                d3.select(shapeElements.querySelector('svg'))
                    .append("rect")
                    .attr("x", cx-(50*ysize)) // cx에서 가로 크기의 절반을 뺌
                    .attr("y", cy-(50*ysize)) // cy에서 세로 크기의 절반을 뺌
                    .attr("width", 100*ysize)
                    .attr("height", 100*ysize)
                    .attr("stroke", get_color(j))
                    .attr("fill-opacity", 0)
                    .attr("stroke-width", 2*(ysize*4));
            }
        }
    }
    addTargetCluster(gInsidePolygonList.length)
    
}

function addTargetCluster(len) {
    const select = document.getElementById('target_cluster');
    const selectedOption = 'Cluster ' + String(len)

    const optionsContainer = document.getElementById('target_cluster');
    const optionDiv = document.createElement('div');
    optionDiv.className = 'selected'
    optionDiv.textContent = selectedOption;
    const removeBtn = document.createElement('button');
    optionDiv.style.borderColor = get_color(len-1);
    removeBtn.textContent = 'X';
    removeBtn.className = 'rbtn';
    removeBtn.onclick = function() {
        optionsContainer.removeChild(optionDiv);
    };
    optionDiv.appendChild(removeBtn);
    optionsContainer.appendChild(optionDiv);
}

function resetButtonClickHandler() {
    let shapeElements = document.getElementById('shape_map');
    d3.select(shapeElements.querySelector('svg')).selectAll("rect").remove();
    d3.select("svg").selectAll("circle").attr("r", size);
    d3.select("svg").selectAll("point").remove();
    d3.select("svg").selectAll("polygon").remove();
    d3.select("svg").selectAll("line").remove();
    d3.select("svg").selectAll("rect").remove();
    points = [];
    gInsidePolygonList = []
    poly_color = 0
}


function get_data(method, network, parameter, sig_filter='', start, end, rm_list='') {
    let params = {
        'method': method, //TSNE, PCA
        'network': network, //ingolsutad
        'parameter': parameter, //UMAP -> n_neighbor, TSNE-> perplexity
        'sig_filter': sig_filter,
        'time_st': start,
        'time_ed': end,
        'list': rm_list
    }

    fetch('/data/UMAP/projection_value', {
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
        let data_x = []
        let data_y = []
        data.projection_value.forEach(point => {
            data_x.push(point[0])
            data_y.push(point[1])
        })
        let arr = [data_x, data_y]
        return arr
    })
    .then(arr => {
        let parent = document.getElementById("pro");
        while(parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
        const chart = createChart(arr, network, sig_filter)
        parent.append(chart);
    })
    .catch(error => {
        console.error("Error fetching data:", error);
    });
}

function createChart(t_data, net, sig_filter) {
    let x = d3.scaleLinear()
        .domain([d3.min(t_data[0]), d3.max(t_data[0])])
        .range([0, 500]);
    let y = d3.scaleLinear()
        .domain([d3.min(t_data[1]), d3.max(t_data[1])])
        .range([500, 0]);
    let k = 1

    let idx_list = []
    for (let i = 0; i < t_data[0].length; i++) {
        idx_list.push(i)
    }
    const width = 450;
    const height = 350;
    const padding = { top: 0, right: 10, bottom: 10, left: 0 };
    var temp;
    if (net == '4x4') {
        temp = 16;
    } else if (net == 'ing') {
        temp = 20;
    } else {
        temp = 28;
    }
    
    const color = d3.scaleOrdinal()
        .domain(t_data[1])
        .range(t_data[1].map((value, index) => {
            if (sig_filter == '') {
                return colorPalette[index % temp]
            }
            else {
                return colorPalette[index % sig_filter.length]
            }
        }));
    
    let transform;
    
    if (t_data[0].length <= 100) {
        size = "10"
    } else if (t_data[0].length <= 10000) {
        size = "5"
    } else {
        size = "1"
    }
    const zoom = d3.zoom()
        .scaleExtent([0.01, 10])
        .on("zoom", zoomed);

    const svg = d3.create("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width + padding.left + padding.right} ${height + padding.top + padding.bottom}`)
        .call(zoom)
        .on("click", mouseUpHandler);

    svg.call(zoom);

    const g = svg.append("g")
        //.attr("transform", `translate(${padding.left},${padding.top})`)
        .attr("fill", "none")
        .attr("stroke-linecap", "round");

    g.selectAll("circle")
        .data(t_data[0])
        .join("circle")
        .attr("cx", (d, i) => x(d)) // x 좌표는 데이터 d를 사용
        .attr("cy", (d, i) => y(t_data[1][i])) // y 좌표는 데이터 배열 t_data[1]을 사용
        .attr("r", size) // 점의 크기
        .attr("data_idx", (d, i) => idx_list[i])
        .attr("fill", (d, i) => color(t_data[1][i]));

    // 스케일 표시를 위한 요소 추가

    const point = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-linecap", "round");

    const line = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-linecap", "round");

    const polygon = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-linecap", "round");

    
    function zoomed(event) {
        transform = event.transform;

        g.attr("transform", `translate(${transform.x},${transform.y}) scale(${transform.k})`)
        point.attr("transform", `translate(${transform.x},${transform.y}) scale(${transform.k})`)
        polygon.attr("transform", `translate(${transform.x},${transform.y}) scale(${transform.k})`)
        line.attr("transform", `translate(${transform.x},${transform.y}) scale(${transform.k})`)

    }

    function mouseUpHandler(event) {
        var mouseX = d3.pointer(event)[0];
        var mouseY = d3.pointer(event)[1];
        const [adjustedX, adjustedY] = transform.invert([mouseX, mouseY]);
        if (points.length == 0) {
            points.push([adjustedX, adjustedY]);
            point.append("rect")
                .attr("x", adjustedX)
                .attr("y", adjustedY)
                .attr("width", 5/transform.k)
                .attr("height", 5/transform.k)
                .attr("fill", "green");
        } else if (points.length == 1) {
            points.push([adjustedX, adjustedY]);
            point.append("rect")
                .attr("x", adjustedX)
                .attr("y", adjustedY)
                .attr("width", 5/transform.k)
                .attr("height", 5/transform.k)
                .attr("fill", "green");
            const lineGenerator = d3.line();
            line.append('line')
                .attr("d", lineGenerator(points))
                .attr("stroke", "blue")
                .attr("stroke-width", 1/transform.k)
                .attr("fill", "none");
        } 
        else {
            d3.selectAll('line').remove();
            points.push([adjustedX, adjustedY]);
            point.append("rect")
                .attr("x", adjustedX)
                .attr("y", adjustedY)
                .attr("width", 5/transform.k)
                .attr("height", 5/transform.k)
                .attr("fill", "green");
            polygon.append("polygon")
                .attr("points", points.map(point => point.join(',')))
                //.attr("fill", "lightblue")
                //.attr("fill-opacity", 0.5)
                .attr("stroke", colorPalette[poly_color])
                .attr("stroke-width", (1/transform.k) +1);
            d3.selectAll('rect').remove();
        }
        
    }

    svg.on('wheel', (evt) => {
        evt.preventDefault();

        // calc nextScale
        const delta = evt.deltaY || evt.deltaX;
        const scaleStep = Math.abs(delta) < 50 ? 0.05 : 0.25;
        const scaleDelta = delta < 0 ? scaleStep : -scaleStep;
        const nextScale = transform.k + scaleDelta;

        // calc fixedPoint
        const fixedPoint = { x: evt.clientX, y: evt.clientY };

        // scale
        svgScale(svg.node(), fixedPoint, transform.k, nextScale);

        // update transform
        transform.k = nextScale;
    });

    return Object.assign(svg.node(), {
        update(transform) {
            svg.transition()
                .duration(1500)
                .call(zoom.transform, transform);
        }
    });

}

document.addEventListener('DOMContentLoaded', function() {
    const dataSelect = document.getElementById('data');
    const timeFilterStart = document.getElementById('time-filter-start');
    const timeFilterEnd = document.getElementById('time-filter-end');
    const methodElement = document.getElementById('DRA');
    const removedElement = document.getElementById('removed_list');
    const rm_list = [];

    get_data(methodElement.querySelector('select').value, dataSelect.querySelector("select").value, 81, '', '1', '2', '')

    dataSelect.addEventListener('change', function() {
        const value = dataSelect.querySelector("select").value;
        const st = timeFilterStart.value;
        const ed = timeFilterEnd.value;
        const method = methodElement.querySelector('select').value;
        const param = value == '4x4' ? 81 : 105;
        const sig_list = [];
        let flag = 0;
        var selectedDivs = toArray(document.getElementsByClassName("selected"));
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
        selectedDivs.forEach(function (div) {
            sig_list.push(div.textContent.slice(7, -1))
            flag = 1
        });

        if (flag == 0) {
            if (rm_list.length > 0) {
                get_data(method, value, param, '', st, ed, rm_list)
            } else {
                get_data(method, value, param, '', st, ed, '')
            }
        }
        else {
            if (rm_list.length > 0) {
                get_data(method, value, param, sig_list, st, ed, rm_list)
            } else {
                get_data(method, value, param, sig_list, st, ed, '')
            }
            flag = 0
        }
    });

    timeFilterStart.addEventListener('change', function() {
        const value = dataSelect.querySelector("select").value;
        const st = timeFilterStart.value;
        const ed = timeFilterEnd.value;
        const method = methodElement.querySelector('select').value;
        const param = value == '4x4' ? 81 : 105;
        const sig_list = [];
        let flag = 0;
        var selectedDivs = toArray(document.getElementsByClassName("selected"));
        selectedDivs.forEach(function (div) {
            sig_list.push(div.textContent.slice(7, -1))
            flag = 1
        });
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
        selectedDivs.forEach(function (div) {
            sig_list.push(div.textContent.slice(7, -1))
            flag = 1
        });

        if (flag == 0) {
            if (rm_list.length > 0) {
                get_data(method, value, param, '', st, ed, rm_list)
            } else {
                get_data(method, value, param, '', st, ed, '')
            }
        }
        else {
            if (rm_list.length > 0) {
                get_data(method, value, param, sig_list, st, ed, rm_list)
            } else {
                get_data(method, value, param, sig_list, st, ed, '')
            }
            flag = 0
        }
    });

    timeFilterEnd.addEventListener('change', function() {
        const value = dataSelect.querySelector("select").value;
        const st = timeFilterStart.value;
        const ed = timeFilterEnd.value;
        const method = methodElement.querySelector('select').value;
        const param = value == '4x4' ? 81 : 105;
        const sig_list = [];
        let flag = 0;
        var selectedDivs = toArray(document.getElementsByClassName("selected"));
        selectedDivs.forEach(function (div) {
            sig_list.push(div.textContent.slice(7, -1))
            flag = 1
        });
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
        selectedDivs.forEach(function (div) {
            sig_list.push(div.textContent.slice(7, -1))
            flag = 1
        });

        if (flag == 0) {
            if (rm_list.length() != 0) {
                get_data(method, value, param, '', st, ed, rm_list)
            } else {
                get_data(method, value, param, '', st, ed, '')
            }
        }
        else {
            if (rm_list.length() != 0) {
                get_data(method, value, param, sig_list, st, ed, rm_list)
            } else {
                get_data(method, value, param, sig_list, st, ed, '')
            }
            flag = 0
        }
    });
});

function toArray(collection) {
    return Array.prototype.slice.call(collection);
}