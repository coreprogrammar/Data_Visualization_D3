const svg = d3.select("#radarChart");
const width = +svg.attr("width");
const height = +svg.attr("height");
const radius = Math.min(width, height) / 2 - 80;
const centerX = width / 2;
const centerY = height / 2;

const metrics = ["Scored", "Conceded", "Wins", "Losses", "Draws"];

let teamStats = {};

d3.json("../../data/matches.json").then(data => {
  const matches = data.matches;

  // Build stats
  matches.forEach(match => {
    const home = match.homeTeam.name;
    const away = match.awayTeam.name;
    const homeGoals = match.score.fullTime.home ?? 0;
    const awayGoals = match.score.fullTime.away ?? 0;

    if (!teamStats[home]) teamStats[home] = { Scored: 0, Conceded: 0, Wins: 0, Losses: 0, Draws: 0 };
    if (!teamStats[away]) teamStats[away] = { Scored: 0, Conceded: 0, Wins: 0, Losses: 0, Draws: 0 };

    teamStats[home].Scored += homeGoals;
    teamStats[home].Conceded += awayGoals;
    teamStats[away].Scored += awayGoals;
    teamStats[away].Conceded += homeGoals;

    if (homeGoals > awayGoals) {
      teamStats[home].Wins += 1;
      teamStats[away].Losses += 1;
    } else if (homeGoals < awayGoals) {
      teamStats[away].Wins += 1;
      teamStats[home].Losses += 1;
    } else {
      teamStats[home].Draws += 1;
      teamStats[away].Draws += 1;
    }
  });

  const teamList = Object.keys(teamStats).sort();
  const team1Select = document.getElementById("team1");
  const team2Select = document.getElementById("team2");

  teamList.forEach(team => {
    const opt1 = new Option(team, team);
    const opt2 = new Option(team, team);
    team1Select.add(opt1);
    team2Select.add(opt2);
  });

  team1Select.value = teamList[0];
  team2Select.value = teamList[1];

  team1Select.addEventListener("change", updateRadar);
  team2Select.addEventListener("change", updateRadar);

  updateRadar();
});

function updateRadar() {
  const team1 = document.getElementById("team1").value;
  const team2 = document.getElementById("team2").value;

  svg.selectAll("*").remove();

  const levels = 5;
  const angleSlice = (Math.PI * 2) / metrics.length;

  const radialScale = d3.scaleLinear()
    .domain([0, d3.max([
      ...metrics.map(m => teamStats[team1][m]),
      ...metrics.map(m => teamStats[team2][m])
    ])])
    .range([0, radius]);

  const g = svg.append("g").attr("transform", `translate(${centerX},${centerY})`);

  // Draw background grid
  for (let level = 1; level <= levels; level++) {
    g.append("polygon")
      .attr("points", metrics.map((m, i) => {
        const r = (radius / levels) * level;
        const angle = i * angleSlice;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        return `${x},${y}`;
      }).join(" "))
      .attr("stroke", "#ccc")
      .attr("fill", "none");
  }

  // Draw axis lines
  metrics.forEach((m, i) => {
    const angle = i * angleSlice;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    g.append("line")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", x).attr("y2", y)
      .attr("stroke", "#ccc");

    g.append("text")
      .attr("x", x * 1.1)
      .attr("y", y * 1.1)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .style("font-size", "11px")
      .text(m);
  });

  const radarLine = d3.lineRadial()
    .radius(d => radialScale(d.value))
    .angle((d, i) => i * angleSlice)
    .curve(d3.curveLinearClosed);

  const teamData = team => metrics.map(m => ({ axis: m, value: teamStats[team][m] }));

  // Draw polygons
  [team1, team2].forEach((team, idx) => {
    g.append("path")
      .datum(teamData(team))
      .attr("d", radarLine)
      .attr("fill", idx === 0 ? "#0d6efd55" : "#dc354555")
      .attr("stroke", idx === 0 ? "#0d6efd" : "#dc3545")
      .attr("stroke-width", 2);
  });

  // Legend
  svg.append("circle").attr("cx", 30).attr("cy", 30).attr("r", 6).style("fill", "#0d6efd");
  svg.append("text").attr("x", 45).attr("y", 33).text(team1).style("font-size", "13px");

  svg.append("circle").attr("cx", 30).attr("cy", 55).attr("r", 6).style("fill", "#dc3545");
  svg.append("text").attr("x", 45).attr("y", 58).text(team2).style("font-size", "13px");
}
