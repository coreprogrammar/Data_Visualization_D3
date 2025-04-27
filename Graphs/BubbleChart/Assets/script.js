const svg = d3.select("#bubbleChart");
const tooltip = d3.select("#tooltip");
const width = 1000;
const height = 600;
const margin = { top: 60, right: 40, bottom: 80, left: 80 };
const chart = svg
  .attr("viewBox", `0 0 ${width} ${height}`)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const groupLookup = {
  "Group A": ["Qatar", "Ecuador", "Senegal", "Netherlands"],
  "Group B": ["England", "Iran", "USA", "Wales"],
  "Group C": ["Argentina", "Saudi Arabia", "Mexico", "Poland"],
  "Group D": ["France", "Australia", "Denmark", "Tunisia"],
  "Group E": ["Spain", "Costa Rica", "Germany", "Japan"],
  "Group F": ["Belgium", "Canada", "Morocco", "Croatia"],
  "Group G": ["Brazil", "Serbia", "Switzerland", "Cameroon"],
  "Group H": ["Portugal", "Ghana", "Uruguay", "South Korea"]
};

let allData = [];

d3.json("../../data/matches.json").then(data => {
  const matches = data.matches;
  const teamStats = {};

  matches.forEach(match => {
    const home = match.homeTeam.name;
    const away = match.awayTeam.name;
    const homeGoals = match.score.fullTime.home ?? 0;
    const awayGoals = match.score.fullTime.away ?? 0;

    [home, away].forEach(team => {
      if (!teamStats[team]) {
        teamStats[team] = { team, goals: 0, matches: 0, wins: 0 };
      }
    });

    teamStats[home].goals += homeGoals;
    teamStats[away].goals += awayGoals;
    teamStats[home].matches += 1;
    teamStats[away].matches += 1;

    if (homeGoals > awayGoals) teamStats[home].wins += 1;
    else if (awayGoals > homeGoals) teamStats[away].wins += 1;
  });

  allData = Object.values(teamStats).map(d => {
    d.group = Object.entries(groupLookup).find(([_, teams]) => teams.includes(d.team))?.[0] || "Unknown";
    return d;
  });

  setupFilters();
  drawChart(allData);
});

function setupFilters() {
  const groupOptions = ["All", ...Object.keys(groupLookup)];
  const select = d3.select("#groupFilter");
  groupOptions.forEach(group => {
    select.append("option").text(group).attr("value", group);
  });

  d3.select("#searchInput").on("input", applyFilters);
  d3.select("#groupFilter").on("change", applyFilters);
  d3.select("#resetBtn").on("click", () => {
    d3.select("#searchInput").property("value", "");
    d3.select("#groupFilter").property("value", "All");
    drawChart(allData);
  });
}

function applyFilters() {
  const search = d3.select("#searchInput").property("value").toLowerCase();
  const group = d3.select("#groupFilter").property("value");

  const filtered = allData.filter(d =>
    d.team.toLowerCase().includes(search) &&
    (group === "All" || d.group === group)
  );

  drawChart(filtered);
}

function drawChart(data) {
  chart.selectAll("*").remove();

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.matches) + 1])
    .range([0, width - margin.left - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.goals) + 5])
    .range([height - margin.top - margin.bottom, 0]);

  const r = d3.scaleSqrt()
    .domain([0, d3.max(data, d => d.wins)])
    .range([5, 25]);

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  chart.append("g")
    .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("d")));

  chart.append("g").call(d3.axisLeft(y));

  chart.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => x(d.matches))
    .attr("cy", d => y(d.goals))
    .attr("r", d => r(d.wins))
    .attr("fill", d => color(d.group))
    .attr("opacity", 0.8)
    .style("cursor", "pointer")
    .on("mouseover", (event, d) => {
      tooltip
        .style("visibility", "visible")
        .html(`
          <strong>${d.team}</strong><br/>
          Group: ${d.group}<br/>
          Matches: ${d.matches}<br/>
          Goals: ${d.goals}<br/>
          Wins: ${d.wins}
        `);
    })
    .on("mousemove", event => {
      tooltip
        .style("top", `${event.pageY - 40}px`)
        .style("left", `${event.pageX + 10}px`);
    })
    .on("mouseout", () => tooltip.style("visibility", "hidden"));

  chart.append("text")
    .attr("x", (width - margin.left - margin.right) / 2)
    .attr("y", -30)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .text("Goals vs. Matches Played (Bubble Size = Wins)");

  chart.append("text")
    .attr("x", (width - margin.left - margin.right) / 2)
    .attr("y", height - margin.top - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .text("Matches Played");

  chart.append("text")
    .attr("x", -((height - margin.top - margin.bottom) / 2))
    .attr("y", -45)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .text("Goals Scored");
}
