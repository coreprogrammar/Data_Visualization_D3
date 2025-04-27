const svg = d3.select("#circlePackChart");
const tooltip = d3.select("#tooltip");

const width = 1000;
const height = 600;

svg.attr("viewBox", `0 0 ${width} ${height}`)
   .attr("preserveAspectRatio", "xMidYMid meet");

let allData = [];

const colorScale = d3.scaleOrdinal()
  .domain(["A", "B", "C", "D", "E", "F", "G", "H"])
  .range(d3.schemeCategory10);

function getFlag(team) {
  const map = {
    Brazil: 'br', Germany: 'de', France: 'fr', Argentina: 'ar',
    England: 'gb', Spain: 'es', Netherlands: 'nl', Croatia: 'hr',
    Morocco: 'ma', Portugal: 'pt', USA: 'us', Japan: 'jp',
    Korea: 'kr', Australia: 'au', Senegal: 'sn', Poland: 'pl',
    Switzerland: 'ch', Belgium: 'be', Mexico: 'mx', Cameroon: 'cm',
    Uruguay: 'uy', Canada: 'ca', Tunisia: 'tn', SaudiArabia: 'sa',
    Serbia: 'rs', Ghana: 'gh', Wales: 'gb', Iran: 'ir', Denmark: 'dk',
    Ecuador: 'ec', CostaRica: 'cr', Qatar: 'qa'
  };
  const code = map[team.replace(/\s/g, '')];
  return code ? `https://flagcdn.com/w40/${code}.png` : null;
}

d3.json("../../data/matches.json").then(data => {
  const matches = data.matches;

  const teamGoals = {};
  const groupMap = {};

  matches.forEach(m => {
    const home = m.homeTeam.name;
    const away = m.awayTeam.name;
    const hG = m.score.fullTime.home ?? 0;
    const aG = m.score.fullTime.away ?? 0;
  
    teamGoals[home] = (teamGoals[home] || 0) + hG;
    teamGoals[away] = (teamGoals[away] || 0) + aG;
  
    // 🧠 Only map groups when m.group is valid and it's a group stage
    if (m.stage === "GROUP_STAGE" && m.group) {
      const group = m.group.replace("Group ", "");
      if (!groupMap[home]) groupMap[home] = group;
      if (!groupMap[away]) groupMap[away] = group;
    }
  });
  

  allData = Object.entries(teamGoals).map(([team, goals]) => ({
    name: team,
    value: goals,
    group: groupMap[team] || "Other"
  }));

  drawChart(allData);

  d3.select("#searchTeam").on("input", () => drawChart(allData));
  d3.select("#resetBtn").on("click", () => {
    d3.select("#groupFilter").property("value", "All");
    d3.select("#minGoals").property("value", "");
    d3.select("#searchTeam").property("value", "");
    drawChart(allData);
  });
});

function drawChart(data) {
    svg.selectAll("*").remove();
  
    const search = d3.select("#searchTeam").property("value").toLowerCase();
  
    // ✅ Filter by team name or show all
    const filtered = data.filter(d =>
      !isNaN(d.value) &&
      d.value > 0 &&
      d.name &&
      (search === "" || d.name.toLowerCase().includes(search))
    );
  
    const root = d3.hierarchy({ children: filtered }).sum(d => +d.value || 0);
    const pack = d3.pack().size([width, height]).padding(5);
    const nodes = pack(root).leaves();
  
    const g = svg.append("g");
  
    g.selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", d => d.r)
      .attr("fill", d => colorScale(d.data.group))
      .style("cursor", "pointer")
      .on("mouseover", (e, d) => {
        tooltip
          .style("visibility", "visible")
          .html(`<strong>${d.data.name}</strong><br/>Goals: ${d.data.value}`);
      })
      .on("mousemove", e => {
        tooltip.style("top", `${e.pageY - 40}px`).style("left", `${e.pageX + 10}px`);
      })
      .on("mouseout", () => tooltip.style("visibility", "hidden"));
  
    g.selectAll("text")
      .data(nodes)
      .join("text")
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", d => `${Math.min(10, d.r / 2)}px`)
      .style("pointer-events", "none")
      .text(d => d.data.name ? d.data.name.slice(0, d.r / 2) : "");
  }
  
