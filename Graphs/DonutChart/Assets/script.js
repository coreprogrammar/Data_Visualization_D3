const svg = d3.select("#donutChart");
const tooltip = d3.select("#tooltip");
const width = +svg.attr("width");
const height = +svg.attr("height");
const radius = Math.min(width, height) / 2 - 40;
const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);

const arc = d3.arc().innerRadius(radius / 1.6).outerRadius(radius);
const pie = d3.pie().value(d => d.value).sort(null);

const color = d3.scaleOrdinal()
  .domain(["Wins", "Losses", "Draws"])
  .range(["#198754", "#dc3545", "#ffc107"]);

let teamStats = {};

d3.json("../../data/matches.json").then(data => {
  const matches = data.matches;
  const stats = {};

  matches.forEach(match => {
    const home = match.homeTeam.name;
    const away = match.awayTeam.name;
    const homeGoals = match.score.fullTime.home ?? 0;
    const awayGoals = match.score.fullTime.away ?? 0;

    [home, away].forEach(team => {
      if (!stats[team]) stats[team] = { Wins: 0, Losses: 0, Draws: 0 };
    });

    if (homeGoals > awayGoals) {
      stats[home].Wins++;
      stats[away].Losses++;
    } else if (homeGoals < awayGoals) {
      stats[away].Wins++;
      stats[home].Losses++;
    } else {
      stats[home].Draws++;
      stats[away].Draws++;
    }
  });

  teamStats = stats;

  const select = document.getElementById("teamSelect");
  Object.keys(teamStats).sort().forEach(team => {
    const opt = document.createElement("option");
    opt.value = team;
    opt.textContent = team;
    select.appendChild(opt);
  });

  select.addEventListener("change", () => drawDonut(select.value));
  drawDonut(select.value = Object.keys(teamStats)[0]);
});

function drawDonut(team) {
  g.selectAll("*").remove();

  const data = Object.entries(teamStats[team]).map(([label, value]) => ({ label, value }));

  const arcs = g.selectAll("path")
    .data(pie(data))
    .join("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.label))
    .attr("stroke", "#fff")
    .attr("stroke-width", 2)
    .on("mouseover", (event, d) => {
      tooltip.style("visibility", "visible")
        .html(`<strong>${d.data.label}</strong>: ${d.data.value}`);
    })
    .on("mousemove", (event) => {
      tooltip.style("top", `${event.pageY - 40}px`).style("left", `${event.pageX + 10}px`);
    })
    .on("mouseout", () => tooltip.style("visibility", "hidden"));

  g.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .style("font-size", "16px")
    .text(team);
}
