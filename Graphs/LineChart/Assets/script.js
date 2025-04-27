const svg = d3.select("#lineChart");
const tooltip = d3.select("#tooltip");

const width = +svg.attr("width");
const height = +svg.attr("height");
const margin = { top: 50, right: 30, bottom: 50, left: 60 };

const chartGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

let allMatches = [];
let allTeams = [];

d3.json("../../data/matches.json").then(data => {
  allMatches = data.matches;

  const teams = new Set();
  allMatches.forEach(m => {
    teams.add(m.homeTeam.name);
    teams.add(m.awayTeam.name);
  });

  allTeams = Array.from(teams).sort();
  const select = document.getElementById("teamSelect");

  allTeams.forEach(team => {
    const opt = document.createElement("option");
    opt.value = team;
    opt.textContent = team;
    select.appendChild(opt);
  });

  select.addEventListener("change", () => {
    const selected = select.value;
    drawLineChart(selected);
  });

  drawLineChart(allTeams[0]);
});

function drawLineChart(teamName) {
  chartGroup.selectAll("*").remove();

  const goalsByDate = {};

  allMatches.forEach(match => {
    const dateStr = match.utcDate.split("T")[0];
    const date = new Date(dateStr);
    const home = match.homeTeam.name;
    const away = match.awayTeam.name;

    const homeGoals = match.score.fullTime.home ?? 0;
    const awayGoals = match.score.fullTime.away ?? 0;

    if (!goalsByDate[dateStr]) {
      goalsByDate[dateStr] = { date, goals: 0 };
    }

    if (home === teamName) {
      goalsByDate[dateStr].goals += homeGoals;
    } else if (away === teamName) {
      goalsByDate[dateStr].goals += awayGoals;
    }
  });

  const data = Object.values(goalsByDate).sort((a, b) => a.date - b.date);

  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([0, width - margin.left - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.goals) + 1])
    .range([height - margin.top - margin.bottom, 0]);

  const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.goals))
    .curve(d3.curveMonotoneX);

  chartGroup.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#007bff")
    .attr("stroke-width", 3)
    .attr("d", line);

  chartGroup.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => x(d.date))
    .attr("cy", d => y(d.goals))
    .attr("r", 5)
    .attr("fill", "#28a745")
    .on("mouseover", (event, d) => {
      tooltip.style("visibility", "visible")
        .html(`<strong>${d3.timeFormat("%b %d")(d.date)}</strong><br/>Goals: ${d.goals}`);
    })
    .on("mousemove", event => {
      tooltip.style("top", `${event.pageY - 40}px`)
        .style("left", `${event.pageX + 10}px`);
    })
    .on("mouseout", () => tooltip.style("visibility", "hidden"));

  chartGroup.append("g")
    .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat("%b %d")));

  chartGroup.append("g")
    .call(d3.axisLeft(y));

  chartGroup.append("text")
    .attr("x", (width - margin.left - margin.right) / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .text(`Goals Over Time – ${teamName}`);
}
