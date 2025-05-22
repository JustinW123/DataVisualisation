// Step 1 & 2: Load and convert data
d3.csv("data/tvBrandCount.csv", d => {
  return {
    brand: d.brand?.trim(),
    count: +d.count // convert to number
  };
}).then(data => {
  // Step 3: Explore the data
  console.log("✅ Full Data:", data);
  console.log("🔢 Number of rows:", data.length);
  console.log("📈 Max count:", d3.max(data, d => d.count));
  console.log("📉 Min count:", d3.min(data, d => d.count));
  console.log("📊 Extent (min & max):", d3.extent(data, d => d.count));

  // Step 4: Sort by count descending
  data.sort((a, b) => b.count - a.count);

  // Step 5: Modularise into chart function
  createBarChart(data);
});

// Step 6: Chart logic in a separate function
const createBarChart = (data) => {
  const svg = d3.select(".responsive-svg-container")
    .append("svg")
    .attr("viewBox", "0 0 1200 1600")
    .style("border", "1px solid black");

  const barHeight = 30;
  const barSpacing = 10;

  svg.selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", 150)
    .attr("y", (d, i) => i * (barHeight + barSpacing))
    .attr("width", d => d.count * 10)
    .attr("height", barHeight)
    .attr("fill", "darkorange");

  svg.selectAll("text")
    .data(data)
    .join("text")
    .text(d => `${d.brand} (${d.count})`)
    .attr("x", 10)
    .attr("y", (d, i) => i * (barHeight + barSpacing) + barHeight / 1.5)
    .attr("font-size", "14px")
    .attr("fill", "#333");
};
