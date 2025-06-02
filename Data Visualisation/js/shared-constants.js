// shared-constants.js (assumed global setup)
const margin = { top: 40, right: 20, bottom: 60, left: 60 };
const width = 800;
const height = 400;
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const colorScale = d3.scaleOrdinal()
  .range([
    "#4e79a7", "#f28e2b", "#e15759", "#76b7b2",
    "#59a14f", "#edc948", "#b07aa1", "#ff9da7"
  ]);
