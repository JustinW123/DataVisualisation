// Pie Chart (Isolated Implementation with Modal View + Enlarged Toggle + Smooth Transition + Center Label + Legend)

function drawPieChart(containerId, isLarge = false) {
  d3.csv("data/jurisdiction.csv", d3.autoType).then(data => {
    const container = d3.select(containerId);
    const width = isLarge ? 800 : 450;
    const height = isLarge ? 600 : 450;
    const radius = Math.min(width, height) / 2 - 30;

    const svg = container
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
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

    const arcs = svg.selectAll("g.slice")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "slice");

    arcs.append("path")
      .attr("fill", d => color(d.data["JURISDICTION"]))
      .attr("stroke", "#fff")
      .attr("stroke-width", "2")
      .transition()
      .duration(1000)
      .attrTween("d", function(d) {
        const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return t => arc(i(t));
      });

    arcs.selectAll("path")
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
            `<strong>${d.data["JURISDICTION"]}</strong><br>Total: ${d.data["Count(METRIC)"]}<br>(${d3.format(".1%")((d.data["Count(METRIC)"]) / d3.sum(data, d => d["Count(METRIC)"]))})`
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

    arcs.append("text")
      .attr("transform", d => `translate(${labelArc.centroid(d)})`)
      .attr("dy", "0.35em")
      .style("text-anchor", "middle")
      .style("font-size", "11px")
      .style("fill", "#000")
      .text(d => {
        const total = d3.sum(data, d => d["Count(METRIC)"]);
        const percent = d3.format(".1%")((d.data["Count(METRIC)"]) / total);
        return `${d.data["JURISDICTION"]} (${percent})`;
      });

    svg.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Distribution");

    const legend = container.append("div")
      .attr("class", "legend-pie")
      .style("max-width", isLarge ? "90%" : null)
      .style("margin", isLarge ? "0 auto" : null);

    data.forEach(d => {
      const item = legend.append("div").attr("class", "legend-item");
      item.append("div")
        .attr("class", "legend-color-box")
        .style("background-color", color(d["JURISDICTION"]));

      item.append("text")
        .text(d["JURISDICTION"]);
    });
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
      pieModal.style.display = "flex";
      pieModal.style.width = "90vw";
      pieModal.style.height = "90vh";
      pieModal.style.margin = "auto";
      pieModal.style.top = "5vh";
      pieModal.style.left = "5vw";
    });

    pieCloseBtn.addEventListener("click", () => {
      pieModal.style.display = "none";
      pieContainer.innerHTML = "";
      pieDrawn = false;
    });
  }
}

window.addEventListener("load", initPieModal);
