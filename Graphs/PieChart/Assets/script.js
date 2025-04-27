const svg = d3.select("#pieChart");
const tooltip = d3.select("#tooltip");
const width = +svg.attr("width");
const height = +svg.attr("height");
const radius = Math.min(width, height) / 2 - 50;

const chartGroup = svg.append("g")
  .attr("transform", `translate(${width / 2}, ${height / 2})`);

let allData = [];

d3.json("../../data/matches.json").then(data => {
  const matches = data.matches;
  const teamGoals = {};

  matches.forEach(match => {
    const home = match.homeTeam.name;
    const away = match.awayTeam.name;
    const homeGoals = match.score.fullTime.home ?? 0;
    const awayGoals = match.score.fullTime.away ?? 0;

    teamGoals[home] = (teamGoals[home] || 0) + homeGoals;
    teamGoals[away] = (teamGoals[away] || 0) + awayGoals;
  });

  allData = Object.entries(teamGoals).map(([team, goals]) => ({ team, goals }));
  drawPieChart(allData);

  // Handle top team filtering
  document.getElementById("topTeams").addEventListener("change", (e) => {
    const selected = e.target.value;
    let filtered = allData;
    if (selected === "Top5") filtered = allData.slice().sort((a, b) => b.goals - a.goals).slice(0, 5);
    if (selected === "Top10") filtered = allData.slice().sort((a, b) => b.goals - a.goals).slice(0, 10);
    drawPieChart(filtered);
  });
});

function drawPieChart(data) {
  chartGroup.selectAll("*").remove();

  const color = d3.scaleOrdinal(d3.schemeTableau10);

  const pie = d3.pie().value(d => d.goals);
  const arc = d3.arc().innerRadius(0).outerRadius(radius);

  const arcs = chartGroup.selectAll("path")
    .data(pie(data))
    .join("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.team))
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .on("mouseover", (event, d) => {
      tooltip
        .style("visibility", "visible")
        .html(`<strong>${d.data.team}</strong><br/>Goals: ${d.data.goals}`);
    })
    .on("mousemove", (event) => {
      tooltip
        .style("top", `${event.pageY - 40}px`)
        .style("left", `${event.pageX + 10}px`);
    })
    .on("mouseout", () => tooltip.style("visibility", "hidden"));

  chartGroup.selectAll("text")
    .data(pie(data))
    .join("text")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .text(d => d.data.team);
}
