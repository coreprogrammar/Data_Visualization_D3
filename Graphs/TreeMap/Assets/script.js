const svg = d3.select("#treeMap");
const tooltip = d3.select("#tooltip");

const width = +svg.attr("width");
const height = +svg.attr("height");

const chartGroup = svg.append("g");

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

  const teamGroupMap = {};
  Object.entries(groupLookup).forEach(([group, teams]) => {
    teams.forEach(team => {
      teamGroupMap[team] = group;
    });
  });

  const groupOptions = Object.keys(groupLookup);
  const select = document.getElementById("groupFilter");
  groupOptions.forEach(group => {
    const opt = document.createElement("option");
    opt.value = group;
    opt.textContent = group;
    select.appendChild(opt);
  });

  select.addEventListener("change", () => {
    const selected = select.value;
    updateTreeMap(selected === "All" ? null : selected);
  });

  updateTreeMap(null);

  function updateTreeMap(group) {
    chartGroup.selectAll("*").remove();

    const filtered = Object.entries(teamGoals)
      .filter(([team]) => group ? teamGroupMap[team] === group : true)
      .map(([team, value]) => ({
        name: team,
        value,
        group: teamGroupMap[team] || "Unknown"
      }));

    const rootData = {
      name: "Teams",
      children: filtered
    };

    const root = d3.hierarchy(rootData)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    d3.treemap().size([width, height]).padding(4)(root);

    const color = d3.scaleOrdinal(d3.schemeSet3);

    const nodes = chartGroup
      .selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", d => `translate(${d.x0}, ${d.y0})`);

    nodes.append("rect")
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", d => color(d.data.group))
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible")
          .html(`<strong>${d.data.name}</strong><br/>Goals: ${d.data.value}`);
      })
      .on("mousemove", (event) => {
        tooltip.style("top", `${event.pageY - 40}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => tooltip.style("visibility", "hidden"));

    nodes.append("text")
      .attr("x", 4)
      .attr("y", 18)
      .style("fill", "#fff")
      .style("font-size", "11px")
      .text(d => d.data.name.length > 10 ? d.data.name.slice(0, 9) + "…" : d.data.name);
  }
});
