d3.csv("data/jurisdiction.csv", d3.autoType).then(data => {
  const width = 400;
  const height = 400;
  const radius = Math.min(width, height) / 2 - 20;

  const svg = d3.select("#pie-chart")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
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
    .innerRadius(radius * 0.6)
    .outerRadius(radius * 0.6);

  const arcs = svg.selectAll("path")
    .data(pie(data))
    .enter()
    .append("g");

  arcs.append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data["JURISDICTION"]))
    .attr("stroke", "white")
    .style("stroke-width", "2px");

  arcs.append("text")
    .text(d => {
      const total = d3.sum(data, d => d["Count(METRIC)"]);
      return `${d.data["JURISDICTION"]} (${d3.format(".1%")(d.data["Count(METRIC)"] / total)})`;
    })
    .attr("transform", d => `translate(${labelArc.centroid(d)})`)
    .style("font-size", "12px")
    .style("text-anchor", "middle")
    .style("fill", "#000");
});
