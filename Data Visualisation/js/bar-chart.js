// js/bar-chart.js — shows fines by AGE GROUP from agegroup.csv

d3.csv("data/agegroup.csv", d3.autoType).then(data => {
  const margin = { top: 40, right: 20, bottom: 80, left: 100 };
  const width = 800;
  const height = 250;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const wrapper = d3.select("#bar-chart")
    .append("div")
    .attr("class", "bar-chart-wrapper")
    .style("position", "relative");

  const svg = wrapper.append("svg")
    .attr("viewBox", `0 0 ${width} ${height + 40}`);

  const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const ageGroups = Array.from(new Set(data.map(d => d["AGE_GROUP"])));
  let filteredData = data.slice();
  let selectedGroups = new Set(ageGroups);

  const xScale = d3.scaleBand().range([0, innerWidth]).padding(0.2);
  const yScale = d3.scaleLinear().range([innerHeight, 0]).nice();

  const xAxis = chart.append("g").attr("transform", `translate(0, ${innerHeight})`);
  const yAxis = chart.append("g");

  chart.append("text")
    .attr("class", "x axis-label")
    .attr("text-anchor", "middle")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 50)
    .text("Age Group");

  chart.append("text")
    .attr("class", "y axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", `translate(-60, ${innerHeight / 2}) rotate(-90)`)
    .text("Number of Fines");

  let tooltip = d3.select("body").select(".tooltip-bar");
  if (tooltip.empty()) {
    tooltip = d3.select("body").append("div").attr("class", "tooltip-bar").style("opacity", 0);
  }

  function update(filtered) {
    xScale.domain(filtered.map(d => d["AGE_GROUP"]));
    yScale.domain([0, d3.max(filtered, d => d["Count(METRIC)"])]).nice();

    xAxis.transition().duration(500).call(d3.axisBottom(xScale));
    yAxis.transition().duration(500).call(d3.axisLeft(yScale));

    const bars = chart.selectAll("rect").data(filtered, d => d["AGE_GROUP"]);

    bars.enter()
      .append("rect")
      .attr("x", d => xScale(d["AGE_GROUP"]))
      .attr("width", xScale.bandwidth())
      .attr("y", yScale(0))
      .attr("height", 0)
      .attr("fill", "#ff9933")
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`<strong>${d["AGE_GROUP"]}</strong><br>Fines: ${d["Count(METRIC)"]}`);
        d3.select(this).attr("fill", "#e67e22");
      })
      .on("mousemove", function (event) {
        tooltip.style("left", `${event.pageX + 12}px`).style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", function () {
        tooltip.transition().duration(200).style("opacity", 0);
        d3.select(this).attr("fill", "#ff9933");
      })
      .transition()
      .duration(1000)
      .attr("y", d => yScale(d["Count(METRIC)"]))
      .attr("height", d => innerHeight - yScale(d["Count(METRIC)"]));

    bars.transition()
      .duration(1000)
      .attr("x", d => xScale(d["AGE_GROUP"]))
      .attr("width", xScale.bandwidth())
      .attr("y", d => yScale(d["Count(METRIC)"]))
      .attr("height", d => innerHeight - yScale(d["Count(METRIC)"]));

    bars.exit().remove();

    const labels = chart.selectAll("text.label").data(filtered, d => d["AGE_GROUP"]);

    labels.enter()
      .append("text")
      .attr("class", "label")
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .attr("x", d => xScale(d["AGE_GROUP"]) + xScale.bandwidth() / 2)
      .attr("y", yScale(0) - 5)
      .text(d => d["Count(METRIC)"])
      .transition()
      .duration(1000)
      .attr("y", d => yScale(d["Count(METRIC)"]) - 5);

    labels.transition()
      .duration(1000)
      .attr("x", d => xScale(d["AGE_GROUP"]) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d["Count(METRIC)"]) - 5)
      .text(d => d["Count(METRIC)"]);

    labels.exit().remove();
  }

  const filterUI = wrapper.insert("div", ":first-child")
    .style("position", "absolute")
    .style("top", "0")
    .style("right", "0")
    .style("z-index", 999)
    .html(`
      <div style="position: relative; display: inline-block;">
        <button id="dropdownToggle" style="padding: 6px 12px; cursor: pointer;">Filter Age Groups ▼</button>
        <div id="checkboxDropdown" style="display:none; position:absolute; right:0; background:white; border:1px solid #ccc; padding:10px; box-shadow:0 2px 4px rgba(0,0,0,0.1); max-height:200px; overflow-y:auto;"></div>
      </div>
    `);

  const checkboxContainer = d3.select("#checkboxDropdown");

  checkboxContainer.append("div")
    .style("margin-bottom", "8px")
    .html(`<button id="resetFilter" style="padding: 4px 8px; font-size: 12px; cursor: pointer;">Reset</button>`);

  ageGroups.forEach(group => {
    checkboxContainer.append("label")
      .style("display", "block")
      .style("margin-bottom", "4px")
      .html(`
        <input type="checkbox" value="${group}" checked>
        ${group}
      `);
  });

  checkboxContainer.selectAll("input[type='checkbox']").on("change", function () {
    const selected = [];
    checkboxContainer.selectAll("input[type='checkbox']:checked").each(function () {
      selected.push(this.value);
    });
    selectedGroups = new Set(selected);
    const filtered = data.filter(d => selectedGroups.has(d["AGE_GROUP"]));
    update(filtered);
  });

  d3.select("#resetFilter").on("click", () => {
    checkboxContainer.selectAll("input[type='checkbox']").property("checked", true);
    selectedGroups = new Set(ageGroups);
    update(data);
  });

  d3.select("#dropdownToggle").on("click", () => {
    const dropdown = d3.select("#checkboxDropdown");
    dropdown.style("display", dropdown.style("display") === "none" ? "block" : "none");
  });

  update(filteredData);
});
