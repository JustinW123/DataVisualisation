// js/pie-chart.js — responsive layout + right-side legend and reset button

function drawPieChart(containerId, isLarge = false) {
  d3.csv("data/jurisdiction.csv", d3.autoType).then(data => {
    const container = d3.select(containerId);
    const width = isLarge ? 1000 : 520;
    const height = isLarge ? 800 : 400;
    const radius = Math.min(width, height) / 2 - 40;

    container.html("");

    const wrapper = container.append("div")
      .style("display", "flex")
      .style("flex-wrap", "nowrap")
      .style("justify-content", "center")
      .style("align-items", "center")
      .style("gap", "2rem")
      .style("width", "100%")
      .style("max-width", isLarge ? "95%" : "100%")
      .style("margin", "0 auto");

    const chartBox = wrapper.append("div")
      .attr("class", "pie-container")
      .style("flex", "0 1 auto")
      .style("max-width", isLarge ? "70%" : "60%")
      .style("min-width", isLarge ? "600px" : "300px")
      .style("height", isLarge ? "700px" : "auto");

    const legendBox = wrapper.append("div")
      .attr("class", "legend-container")
      .style("flex", "0 0 auto")
      .style("display", "flex")
      .style("flex-direction", "column")
      .style("justify-content", "center")
      .style("align-items", "flex-start")
      .style("font-size", isLarge ? "18px" : "13px")
      .style("min-width", isLarge ? "220px" : "150px");

    const svg = chartBox
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "100%");

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal()
      .domain(data.map(d => d["JURISDICTION"]))
      .range(d3.schemeCategory10);

    const pie = d3.pie()
      .value(d => d["Count(METRIC)"])
      .sort(null);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    const labelArc = d3.arc()
      .innerRadius(radius * 0.8)
      .outerRadius(radius * 0.8);

    let tooltip = d3.select("body").select(".tooltip-pie");
    if (tooltip.empty()) {
      tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip-pie")
        .style("position", "absolute")
        .style("background", "#333")
        .style("color", "#fff")
        .style("padding", "6px 10px")
        .style("border-radius", "4px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("opacity", 0);
    }

    let visibleData = new Set(data.map(d => d["JURISDICTION"]));

    function updatePieChart() {
      const filtered = data.filter(d => visibleData.has(d["JURISDICTION"]));
      const arcs = pie(filtered);

      g.selectAll("g.slice").remove();
      const slices = g.selectAll("g.slice")
        .data(arcs)
        .enter()
        .append("g")
        .attr("class", "slice");

      slices.append("path")
        .attr("fill", d => color(d.data["JURISDICTION"]))
        .attr("stroke", "#fff")
        .attr("stroke-width", "2")
        .transition()
        .duration(1000)
        .attrTween("d", function(d) {
          const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
          return t => arc(i(t));
        });

      slices.selectAll("path")
        .on("mouseover", function(event, d) {
          d3.select(this)
            .transition().duration(200)
            .attr("transform", function(d) {
              const [x, y] = arc.centroid(d);
              return `translate(${x * 0.1},${y * 0.1})`;
            });

          tooltip
            .style("opacity", 1)
            .html(
              `<strong>${d.data["JURISDICTION"]}</strong><br>Total: ${d.data["Count(METRIC)"]}<br>(${d3.format(".1%")((d.data["Count(METRIC)"]) / d3.sum(filtered, d => d["Count(METRIC)"]))})`
            );
        })
        .on("mousemove", event => {
          tooltip.style("left", `${event.pageX + 12}px`).style("top", `${event.pageY - 28}px`);
        })
        .on("mouseout", function() {
          d3.select(this)
            .transition().duration(200)
            .attr("transform", "translate(0,0)");
          tooltip.style("opacity", 0);
        });

      slices.append("text")
        .attr("transform", d => `translate(${labelArc.centroid(d)})`)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .style("font-size", isLarge ? "18px" : "11px")
        .style("fill", "#000")
        .text(d => {
          const total = d3.sum(filtered, d => d["Count(METRIC)"]);
          const percent = d3.format(".1%")((d.data["Count(METRIC)"]) / total);
          return `${d.data["JURISDICTION"]} (${percent})`;
        });
    }

    g.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .style("font-size", isLarge ? "24px" : "14px")
      .style("font-weight", "bold")
      .text("Distribution");

    const legend = legendBox.append("div")
      .attr("class", "legend-pie")
      .style("display", "flex")
      .style("flex-direction", "column")
      .style("gap", "10px")
      .style("align-items", "flex-start");

    data.forEach(d => {
      const key = d["JURISDICTION"];
      const item = legend.append("div")
        .attr("class", "legend-item active")
        .style("cursor", "pointer")
        .style("display", "flex")
        .style("align-items", "center")
        .on("click", function() {
          d3.select(this)
            .transition().duration(200)
            .style("opacity", visibleData.has(key) ? 0.3 : 1);

          if (visibleData.has(key)) {
            visibleData.delete(key);
            d3.select(this).classed("inactive", true);
          } else {
            visibleData.add(key);
            d3.select(this).classed("inactive", false);
          }
          updatePieChart();
        });

      item.append("div")
        .attr("class", "legend-color-box")
        .style("background-color", color(key))
        .style("width", "14px")
        .style("height", "14px")
        .style("border-radius", "2px")
        .style("margin-right", "6px");

      item.append("span")
        .text(key)
        .style("font-size", isLarge ? "15px" : "13px");
    });

    legendBox.append("div")
      .attr("class", "reset-button")
      .style("margin-top", "20px")
      .style("text-align", "left")
      .style("cursor", "pointer")
      .style("color", "#007bff")
      .style("font-size", isLarge ? "16px" : "14px")
      .text("Reset Filter")
      .on("click", () => {
        visibleData = new Set(data.map(d => d["JURISDICTION"]));
        legend.selectAll(".legend-item")
          .classed("inactive", false)
          .style("opacity", 1);
        updatePieChart();
      });

    updatePieChart();
  });
}

function initPieModal() {
  drawPieChart("#pie-chart", false);

  const pieModalBtn = document.getElementById("openPieModal");
  const pieModal = document.getElementById("pieChartModal");
  const pieCloseBtn = document.getElementById("closePieModal");
  const pieContainer = document.getElementById("enlarged-pie-container");
  let pieDrawn = false;

  if (pieModalBtn && pieModal && pieCloseBtn && pieContainer) {
    pieModalBtn.addEventListener("click", () => {
      if (!pieDrawn) {
        pieContainer.innerHTML = "";
        drawPieChart("#enlarged-pie-container", true);
        pieDrawn = true;
      }
      document.body.style.overflow = "hidden";
      pieModal.style.display = "flex";
    });

    pieCloseBtn.addEventListener("click", () => {
      pieModal.style.display = "none";
      pieContainer.innerHTML = "";
      document.body.style.overflow = "";
      pieDrawn = false;
    });
  }
}

window.addEventListener("load", initPieModal);
