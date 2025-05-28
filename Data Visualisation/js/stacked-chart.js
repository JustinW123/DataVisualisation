// js/stacked-chart.js

// Ensure D3 and shared constants are loaded
// If not using modules, this assumes shared-constants.js is loaded before this script

d3.csv("data/2023.csv", d3.autoType).then(data => {
  // Convert START_DATE to month string (e.g. "Jan", "Feb")
  data.forEach(d => {
    d.month = d3.timeFormat("%b")(new Date(d.START_DATE));
  });

  // Pivot data: { month: "Jan", ACT: 10, NSW: 20, ... }
  const nested = d3.rollups(
    data,
    v => d3.rollup(v, d => d3.sum(d, d => d["Sum(FINES)"]), d => d.JURISDICTION),
    d => d.month
  ).map(([month, map]) => {
    const row = { month };
    map.forEach((value, key) => row[key] = value);
    return row;
  });

  const keys = Array.from(new Set(data.map(d => d.JURISDICTION)));

  // Create SVG
  const svg = d3.select("#stacked-chart")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  const innerChart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // X and Y scales
  const xScale = d3.scaleBand()
    .domain(nested.map(d => d.month))
    .range([0, innerWidth])
    .padding(0.1);

  const stack = d3.stack()
    .keys(keys)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

  const stackedData = stack(nested);

  const yMax = d3.max(stackedData[stackedData.length - 1], d => d[1]);

  const yScale = d3.scaleLinear()
    .domain([0, yMax])
    .range([innerHeight, 0])
    .nice();

  // Draw axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  innerChart.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(xAxis);

  innerChart.append("g")
    .call(yAxis);

  // Draw bars
  stackedData.forEach(series => {
    innerChart.selectAll(`.bar-${series.key}`)
      .data(series)
      .join("rect")
      .attr("class", `bar bar-${series.key}`)
      .attr("x", d => xScale(d.data.month))
      .attr("y", d => yScale(d[1]))
      .attr("height", d => yScale(d[0]) - yScale(d[1]))
      .attr("width", xScale.bandwidth())
      .attr("fill", colorScale(series.key));
  });

  // Legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width - margin.right + 10}, ${margin.top})`);

  keys.forEach((key, i) => {
    const g = legend.append("g")
      .attr("transform", `translate(0, ${i * 20})`);

    g.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", colorScale(key));

    g.append("text")
      .attr("x", 18)
      .attr("y", 10)
      .text(key)
      .style("font-size", "12px")
      .style("font-family", "sans-serif");
  });
});
