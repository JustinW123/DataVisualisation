
// SVG layout dimensions
export const margin = { top: 40, right: 30, bottom: 40, left: 60 };
export const width = 800;
export const height = 400;
export const innerWidth = width - margin.left - margin.right;
export const innerHeight = height - margin.top - margin.bottom;

// Color palette (update as needed for consistency)
export const colorScale = d3.scaleOrdinal()
  .range([
    "#4e79a7", "#f28e2b", "#e15759", "#76b7b2",
    "#59a14f", "#edc948", "#b07aa1", "#ff9da7"
  ]);

// Font and tooltip settings (optional utility constants)
export const tooltipFont = {
  family: "sans-serif",
  size: "13px",
  weight: "bold",
};

export const formatPercentage = d3.format(".0%");
export const formatNumber = d3.format(",");
