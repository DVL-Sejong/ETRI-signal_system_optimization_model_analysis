function createMap(method) {
    
    const width = 350;
    const height = 350;
    const padding = { top: 10, right: 10, bottom: 10, left: 10 };
    var size = 15;
    const svg = d3.create("svg")
        .attr("width", 420)
        .attr("height", 340)

    const g = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-linecap", "round");

    // read map
    d3.csv("static/data/" + method + "/edges.csv")
        .then(function (data) {
            data.forEach(function (d) {
                const coordinatesArray = data.map(d => d.shape.split(' ').map(coord => coord.split(',').map(Number)));
                // Create a line function
                const line = d3.line()
                    .x(d => d[0])
                    .y(d => -d[1]);

                // Append a line to the SVG for each set of coordinates
                g.selectAll("path")
                    .data(coordinatesArray)
                    .enter()
                    .append("path")
                    .attr("d", line)
                    .attr("stroke", "black")
                    .attr("stroke-width", 4)
                    .attr("fill", "none");
            });
            const pathBoundingBox = g.node().getBBox();
            svg.attr("viewBox", `${pathBoundingBox.x} ${pathBoundingBox.y} ${pathBoundingBox.width} ${pathBoundingBox.height}`);
        })
        .catch(function (error) {
            // Handle errors
            console.error("Error loading CSV file:", error);
        });


    const signal = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-linecap", "round");
    // read signal
    if (method == 'gangnam') {
        size = 50;
    }
    d3.csv("static/data/" + method + "/signal.csv")
        .then(function (data) {
            let idx_list = []
            for (let i = 0; i < data.length; i++) {
                idx_list.push(i)
            }
            //const maxY = d3.max(data.y)
            const symbol = d3.symbol();

            signal.selectAll("path")
                .data(data)
                .enter()
                .append("circle") // 원(circle)을 추가
                .attr("cx", d => d.x) // x 좌표 설정
                .attr("cy", d => -d.y) // y 좌표 설정
                .attr("r", size) // 반지름 설정
                .attr("data_idx", (d, i) => idx_list[i])
                .attr("stroke", (d, i) => get_color(i))
                .attr("stroke-width", 2)
                .attr("fill", (d, i) => get_color(i));
        })
        .catch(function (error) {
            // Handle errors
            console.error("Error loading CSV file:", error);
        });

    document.getElementById("shape_map").append(svg.node());
}

createMap('4x4');

function get_color(i) {
    return colorPalette[i]
}
/*
const colorPalette = [
    "#FF0000", // Red
    "#00FF00", // Green
    "#0000FF", // Blue
    "#800080", // Purple
    "#00FFFF", // Cyan
    "#FF00FF", // Magenta
    "#FFA500", // Orange
    "#FFC0CB", // Pink
    "#A52A2A", // Brown
    "#FFD700", // Yellow
    "#00FF00", // Lime
    "#008080", // Teal
    "#000080", // Navy
    "#800000", // Maroon
    "#808000", // Olive
    "#808080", // Gray
    "#C0C0C0", // Silver
    "#4B0082", // Indigo
    "#40E0D0", // Turquoise
    "#708090"  // Slate
  ];*/

  const colorPalette = [
    "#FF0000", //빨
    "#0000FF", //파
    "#FF7E00", //주
    "#FFFF00", //노
    "#00FF2B", //초
    "#9400D3", //보
    "#AD70CC",
    "#FF4C4C",
    "#4070FF",
    "#FFB973",
    "#FFFFCC",
    "#00CC22",
    "#8A2BE2",
    "#8C4D8C",
    "#FF9999",
    "#80B5FF",
    "#FFAD73",
    "#E5E500",
    "#8CFF9F",
    "#FF00FF",
    "#DDA0DD",
    "#850000",
    "#00BFFF",
    "#B34A00",
    "#F2F279",
    "#77FF33",
    "#BA55D3",
    "#D8BFD8"
  ];