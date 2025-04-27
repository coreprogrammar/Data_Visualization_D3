const svg = d3.select("#sankeyChart");
const tooltip = d3.select("#tooltip");
const { sankey, sankeyLinkHorizontal } = d3;

const width = +svg.attr("width");
const height = +svg.attr("height");

const stageMap = {
  GROUP_STAGE: "Group Stage",
  LAST_16: "Round of 16",
  QUARTER_FINAL: "Quarterfinal",
  SEMI_FINAL: "Semifinal",
  FINAL: "Final"
};

let matches = [];
let mode = "progression"; // default mode

// Attach event listeners to toggle buttons
document.getElementById("btn-progression").addEventListener("change", () => {
  mode = "progression";
  renderSankey();
});

document.getElementById("btn-goals").addEventListener("change", () => {
  mode = "goals";
  renderSankey();
});

d3.json("../../data/matches.json").then(data => {
  matches = data.matches;
  renderSankey();
});

function renderSankey() {
  svg.selectAll("*").remove();

  const stages = Object.keys(stageMap);
  const links = [];
  const nodesSet = new Set();

  for (let i = 0; i < stages.length - 1; i++) {
    const fromStage = stages[i];
    const toStage = stages[i + 1];

    const fromMatches = matches.filter(m => m.stage === fromStage && m.score.winner);

    fromMatches.forEach(match => {
      const home = match.homeTeam.name;
      const away = match.awayTeam.name;
      const winner = match.score.winner === 'HOME_TEAM' ? home : away;
      const loser = match.score.winner === 'HOME_TEAM' ? away : home;
      const sourceTeam = mode === "progression" ? winner : loser;
      const source = `${sourceTeam} (${stageMap[fromStage]})`;
      const target = `${sourceTeam} (${stageMap[toStage]})`;
      const value = mode === "progression" ? 1 : (match.score.fullTime.home ?? 0) + (match.score.fullTime.away ?? 0);

      links.push({ source, target, value });
      nodesSet.add(source);
      nodesSet.add(target);
    });
  }

  const nodes = Array.from(nodesSet).map(name => ({ name }));
  const nameToIndex = Object.fromEntries(nodes.map((n, i) => [n.name, i]));
  const sankeyLinks = links.map(link => ({
    source: nameToIndex[link.source],
    target: nameToIndex[link.target],
    value: link.value
  }));

  drawSankey(nodes, sankeyLinks);
}

function drawSankey(nodes, links) {
  const sankeyGen = sankey()
    .nodeWidth(20)
    .nodePadding(20)
    .extent([[1, 1], [width - 1, height - 6]]);

  const graph = sankeyGen({
    nodes: nodes.map(d => ({ ...d })),
    links: links.map(d => ({ ...d }))
  });

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  svg.append("g")
    .selectAll("rect")
    .data(graph.nodes)
    .join("rect")
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("height", d => d.y1 - d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("fill", d => color(d.name.split("(")[1] || ""))
    .on("mouseover", (event, d) => {
      tooltip.style("visibility", "visible").text(d.name);
    })
    .on("mousemove", (event) => {
      tooltip.style("top", `${event.pageY - 40}px`).style("left", `${event.pageX + 10}px`);
    })
    .on("mouseout", () => tooltip.style("visibility", "hidden"));

  svg.append("g")
    .selectAll("path")
    .data(graph.links)
    .join("path")
    .attr("d", sankeyLinkHorizontal())
    .attr("fill", "none")
    .attr("stroke", "#007bff")
    .attr("stroke-opacity", 0.4)
    .attr("stroke-width", d => Math.max(1, d.width));

  svg.append("g")
    .selectAll("text")
    .data(graph.nodes)
    .join("text")
    .attr("x", d => d.x0 - 5)
    .attr("y", d => (d.y1 + d.y0) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .style("font-size", "10px")
    .text(d => d.name.split(" ")[0]);
}
