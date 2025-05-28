// js/bar-chart.js — shows fines by AGE GROUP from agegroup.csv

d3.csv("data/agegroup.csv", d3.autoType).then(data => {
  const margin = { top: 40, right: 20, bottom: 40, left: 80 };
  const width = 800;
  const height = 400;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3.select("#bar-chart")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // X and Y scales
  const xScale = d3.scaleBand()
    .domain(data.map(d => d["AGE_GROUP"]))
    .range([0, innerWidth])
    .padding(0.2);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d["Count(METRIC)"])])
    .nice()
    .range([innerHeight, 0]);

  // X Axis
  chart.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(xScale));

  // Y Axis
  chart.append("g")
    .call(d3.axisLeft(yScale));

  // Bars
  chart.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => xScale(d["AGE_GROUP"]))
    .attr("y", d => yScale(d["Count(METRIC)"]))
    .attr("width", xScale.bandwidth())
    .attr("height", d => innerHeight - yScale(d["Count(METRIC)"]))
    .attr("fill", "#ff9933");

  // Labels
  chart.selectAll("text.label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "label")
    .text(d => d["Count(METRIC)"])
    .attr("x", d => xScale(d["AGE_GROUP"]) + xScale.bandwidth() / 2)
    .attr("y", d => yScale(d["Count(METRIC)"]) - 5)
    .attr("text-anchor", "middle")
    .style("font-size", "12px");
});
