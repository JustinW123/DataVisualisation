// Stacked Chart with Interactive Legend + Mobile Font Scaling + Legend Wrapping + Thin Bars on Mobile + Reset Filter + Grid Lines

let activeKeys = [];

function drawStackedChart(containerId, isLarge = false) {
  d3.csv("data/2023.csv", d3.autoType).then(data => {
    data.forEach(d => {
      d.month = d3.timeFormat("%b")(new Date(d.START_DATE));
    });

    const allKeys = Array.from(new Set(data.map(d => d.JURISDICTION)));
    if (activeKeys.length === 0) activeKeys = [...allKeys];

    const nested = d3.rollups(
      data,
      v => d3.rollup(v, leaf => d3.sum(leaf, d => d["Sum(FINES)"]), d => d.JURISDICTION),
      d => d.month
    ).map(([month, map]) => {
      const row = { month };
      map.forEach((value, key) => row[key] = value);
      return row;
    });

    d3.select(containerId).html("");

    const chartWidth = isLarge ? window.innerWidth * 0.95 : width;
    const chartHeight = isLarge ? window.innerHeight * 0.85 : height;

    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;
    const barWidth = window.innerWidth < 500 ? 8 : null;

    const svg = d3.select(containerId)
      .append("svg")
      .attr("class", "stacked-chart")
      .attr("viewBox", `0 0 ${chartWidth} ${chartHeight + 180}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("width", "100%")
      .attr("height", "100%");

    svg.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", window.innerWidth < 500 ? "14px" : "18px")
      .style("font-weight", "bold")
      .text("Monthly Fines by Jurisdiction (2023)");

    const chart = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(nested.map(d => d.month))
      .range([0, innerWidth])
      .padding(0.1);

    const stack = d3.stack().keys(activeKeys);
    const stackedData = stack(nested);

    const yMax = d3.max(stackedData, series => d3.max(series, d => d[1]));
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([innerHeight, 0])
      .nice();

    // Grid lines
    chart.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat("")
      )
      .selectAll("line")
      .attr("stroke", "#e0e0e0")
      .attr("stroke-dasharray", "2,2");

    chart.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("font-size", window.innerWidth < 500 ? "10px" : "12px")
      .attr("dy", "0.8em")
      .attr("dx", "-0.8em")
      .attr("transform", "rotate(-30)")
      .style("text-anchor", "end");

    chart.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-size", window.innerWidth < 500 ? "10px" : "12px");

    chart.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 50)
      .attr("text-anchor", "middle")
      .style("font-size", window.innerWidth < 500 ? "12px" : "14px")
      .text("Month");

    chart.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -50)
      .attr("text-anchor", "middle")
      .style("font-size", window.innerWidth < 500 ? "12px" : "14px")
      .text("Total Fines ($AUD)");

    let tooltip = d3.select(".tooltip-stacked");
    if (tooltip.empty()) {
      tooltip = d3.select("body").append("div")
        .attr("class", "tooltip-stacked")
        .style("opacity", 0);
    }

    stackedData.forEach(series => {
      chart.selectAll(`.bar-${series.key}`)
        .data(series)
        .join("rect")
        .attr("class", `bar bar-${series.key}`)
        .attr("x", d => xScale(d.data.month) + (xScale.bandwidth() - (barWidth || xScale.bandwidth())) / 2)
        .attr("y", innerHeight)
        .attr("height", 0)
        .attr("width", barWidth || xScale.bandwidth())
        .attr("fill", colorScale(series.key))
        .on("mouseover", function (event, d) {
          tooltip.style("opacity", 1).html(
            `<strong>${series.key}</strong><br>Month: ${d.data.month}<br>Fines: ${Math.round(d[1] - d[0])}`
          );
          d3.select(this)
            .transition().duration(200)
            .attr("stroke", "#000")
            .attr("stroke-width", 1.5);
        })
        .on("mousemove", function (event) {
          tooltip.style("left", (event.clientX + 12) + "px").style("top", (event.clientY - 28) + "px");
        })
        .on("mouseout", function () {
          tooltip.style("opacity", 0);
          d3.select(this)
            .transition().duration(200)
            .attr("stroke", null);
        })
        .transition()
        .delay((_, i) => i * 5)
        .duration(800)
        .attr("y", d => yScale(d[1]))
        .attr("height", d => yScale(d[0]) - yScale(d[1]));
    });

    const legend = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${chartHeight + 50})`);

    const legendItemWidth = window.innerWidth < 500 ? 150 : 100;
    allKeys.forEach((key, i) => {
      const g = legend.append("g")
        .attr("transform", `translate(${(i % 3) * legendItemWidth}, ${Math.floor(i / 3) * 20})`)
        .attr("class", `legend-item ${activeKeys.includes(key) ? '' : 'inactive'}`)
        .style("cursor", "pointer")
        .on("click", function () {
          if (activeKeys.includes(key)) {
            activeKeys = activeKeys.filter(k => k !== key);
          } else {
            activeKeys.push(key);
          }
          drawStackedChart(containerId, isLarge);
        });

      g.append("rect")
        .attr("width", 14)
        .attr("height", 14)
        .attr("fill", colorScale(key));

      g.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text(key)
        .style("font-size", window.innerWidth < 500 ? "12px" : "14px")
        .style("font-weight", "500");
    });

    // Reset Filter Button
    svg.append("text")
      .attr("x", chartWidth - 120)
      .attr("y", chartHeight + 45)
      .attr("class", "reset-button")
      .style("cursor", "pointer")
      .style("fill", "#007bff")
      .style("font-size", "14px")
      .text("Reset Filter")
      .on("click", () => {
        d3.selectAll(".bar")
          .transition()
          .duration(400)
          .style("opacity", 0)
          .on("end", () => {
            activeKeys = [...allKeys];
            drawStackedChart(containerId, isLarge);
          });
      });
  });
};

window.onload = () => {
  drawStackedChart("#stacked-chart", false);

  let isModalDrawn = false;
  const modalTrigger = document.getElementById("openStackedModal");
  const modalClose = document.getElementById("closeModal");
  const modal = document.getElementById("chartModal");
  const modalContainer = document.getElementById("enlarged-chart-container");

  if (modalTrigger && modalClose && modal && modalContainer) {
    modalTrigger.addEventListener("click", () => {
      if (!isModalDrawn) {
        modalContainer.innerHTML = "";
        drawStackedChart("#enlarged-chart-container", true);
        isModalDrawn = true;
      }
      modal.style.display = "block";
    });

    modalClose.addEventListener("click", () => {
      modal.style.display = "none";
      modalContainer.innerHTML = "";
      isModalDrawn = false;
    });
  }
};
