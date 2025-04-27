const svg = d3.select("#stackedBarChart");
const tooltip = d3.select("#tooltip");
const margin = { top: 60, right: 20, bottom: 120, left: 80 };
const width = +svg.attr("width") - margin.left - margin.right;
const height = +svg.attr("height") - margin.top - margin.bottom;
const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const stageMap = {
  GROUP_STAGE: "Group",
  LAST_16: "Round of 16",
  QUARTER_FINAL: "Quarterfinal",
  SEMI_FINAL: "Semifinal",
  THIRD_PLACE: "Third Place",
  FINAL: "Final"
};

let rawData = [];
let allStages = Object.values(stageMap);
let color = d3.scaleOrdinal().domain(allStages).range(d3.schemeSet2);

d3.json("../../data/matches.json").then(data => {
  const matches = data.matches;
  const teamStageGoals = {};

  matches.forEach(match => {
    const stage = stageMap[match.stage];
    if (!stage) return;

    const home = match.homeTeam.name;
    const away = match.awayTeam.name;
    const homeGoals = match.score.fullTime.home ?? 0;
    const awayGoals = match.score.fullTime.away ?? 0;

    if (!teamStageGoals[home]) teamStageGoals[home] = {};
    if (!teamStageGoals[away]) teamStageGoals[away] = {};

    teamStageGoals[home][stage] = (teamStageGoals[home][stage] || 0) + homeGoals;
    teamStageGoals[away][stage] = (teamStageGoals[away][stage] || 0) + awayGoals;
  });

  rawData = Object.keys(teamStageGoals).map(team => {
    const entry = { team };
    allStages.forEach(stage => {
      entry[stage] = teamStageGoals[team][stage] || 0;
    });
    entry.totalGoals = allStages.reduce((sum, s) => sum + entry[s], 0);
    return entry;
  });

  // Initial draw
  drawChart(rawData);

  // Filters
  d3.select("#searchTeam").on("input", applyFilters);
  d3.select("#minGoals").on("input", applyFilters);
  d3.select("#resetBtn").on("click", () => {
    d3.select("#searchTeam").property("value", "");
    d3.select("#minGoals").property("value", "");
    drawChart(rawData);
  });
});

function applyFilters() {
  const search = d3.select("#searchTeam").property("value").toLowerCase();
  const minGoals = +d3.select("#minGoals").property("value") || 0;

  const filtered = rawData.filter(d =>
    d.team.toLowerCase().includes(search) &&
    d.totalGoals >= minGoals
  );

  drawChart(filtered);
}

function drawChart(data) {
  chart.selectAll("*").remove();

  const x = d3.scaleBand()
    .domain(data.map(d => d.team))
    .range([0, width])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d3.sum(allStages, k => d[k]))])
    .nice()
    .range([height, 0]);

  const stack = d3.stack().keys(allStages);
  const series = stack(data);

  chart.append("g")
    .selectAll("g")
    .data(series)
    .join("g")
    .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(d => d)
    .join("rect")
    .attr("x", d => x(d.data.team))
    .attr("y", d => y(d[1]))
    .attr("height", d => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .on("mouseover", (event, d) => {
      const stageName = event.target.__data__.data;
      tooltip.style("visibility", "visible")
        .html(`<strong>${stageName.team}</strong><br/>Goals: ${event.target.__data__[1] - event.target.__data__[0]}`);
    })
    .on("mousemove", event => {
      tooltip.style("top", `${event.pageY - 30}px`).style("left", `${event.pageX + 10}px`);
    })
    .on("mouseout", () => tooltip.style("visibility", "hidden"));

  chart.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  chart.append("g").call(d3.axisLeft(y));

  chart.append("text")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .text("Goals by Stage per Team");

  const legend = chart.append("g")
    .attr("transform", `translate(${width - 150}, 0)`);

  allStages.forEach((stage, i) => {
    legend.append("rect")
      .attr("x", 0).attr("y", i * 20)
      .attr("width", 14).attr("height", 14)
      .attr("fill", color(stage));

    legend.append("text")
      .attr("x", 20).attr("y", i * 20 + 12)
      .text(stage)
      .style("font-size", "13px");
  });
}
