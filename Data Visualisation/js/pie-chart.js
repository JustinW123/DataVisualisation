d3.csv("data/jurisdiction.csv", d3.autoType).then(data => {
  const width = 450;
  const height = 450;
  const radius = Math.min(width, height) / 2 - 30;

  const svg = d3.select("#pie-chart")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
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

  const arcs = svg.selectAll("g.slice")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "slice");

  // Pie segments
  arcs.append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data["JURISDICTION"]))
    .attr("stroke", "#fff")
    .attr("stroke-width", "2");

  // Labels
  arcs.append("text")
    .attr("transform", d => `translate(${labelArc.centroid(d)})`)
    .attr("dy", "0.35em")
    .style("text-anchor", "middle")
    .style("font-size", "11px")
    .style("fill", "#000")
    .text(d => {
      const total = d3.sum(data, d => d["Count(METRIC)"]);
      const percent = d3.format(".1%")(d.data["Count(METRIC)"] / total);
      return `${d.data["JURISDICTION"]} (${percent})`;
    });
});
