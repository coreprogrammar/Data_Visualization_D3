const svg = d3.select("#barChart");
const tooltip = d3.select("#tooltip");
const width = 1000;
const height = 500;
const margin = { top: 30, right: 30, bottom: 100, left: 60 };
svg.attr("viewBox", `0 0 ${width} ${height}`);

const chartGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

let allData = [];

fetch("../../data/matches.json")
  .then((res) => res.json())
  .then((data) => {
    const matches = data.matches;
    const teamGoals = {};

    matches.forEach((match) => {
      const home = match.homeTeam.name;
      const away = match.awayTeam.name;
      const homeGoals = match.score.fullTime.home ?? 0;
      const awayGoals = match.score.fullTime.away ?? 0;

      teamGoals[home] = (teamGoals[home] || 0) + homeGoals;
      teamGoals[away] = (teamGoals[away] || 0) + awayGoals;
    });

    allData = Object.entries(teamGoals).map(([team, goals]) => ({ team, goals }));
    drawBarChart(allData);
    populateFilter(allData);
  })
  .catch((err) => {
    console.error("API error:", err);
  });

function drawBarChart(data) {
  chartGroup.selectAll("*").remove();

  const x = d3.scaleBand()
    .domain(data.map(d => d.team))
    .range([0, width - margin.left - margin.right])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.goals) + 2])
    .range([height - margin.top - margin.bottom, 0]);

  chartGroup.append("g")
    .call(d3.axisLeft(y));

  chartGroup.append("g")
    .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  chartGroup.selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", d => x(d.team))
    .attr("y", d => y(d.goals))
    .attr("width", x.bandwidth())
    .attr("height", d => height - margin.top - margin.bottom - y(d.goals))
    .attr("fill", "#007bff")
    .on("mouseover", (event, d) => {
      tooltip.style("visibility", "visible").text(`${d.team}: ${d.goals} goals`);
    })
    .on("mousemove", (event) => {
      tooltip.style("top", `${event.pageY - 30}px`).style("left", `${event.pageX + 10}px`);
    })
    .on("mouseout", () => tooltip.style("visibility", "hidden"));
}

function populateFilter(data) {
  const select = document.getElementById("teamFilter");
  data.forEach(d => {
    const option = document.createElement("option");
    option.value = d.team;
    option.textContent = d.team;
    select.appendChild(option);
  });

  select.addEventListener("change", () => {
    const selected = select.value;
    if (selected === "All") {
      drawBarChart(allData);
    } else {
      const filtered = allData.filter(d => d.team === selected);
      drawBarChart(filtered);
    }
  });
}
