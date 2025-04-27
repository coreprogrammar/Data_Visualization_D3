const svg = d3.select("#horizontalBarChart");
const tooltip = d3.select("#tooltip");
const margin = { top: 50, right: 30, bottom: 30, left: 160 };
const width = +svg.attr("width") - margin.left - margin.right;
const height = +svg.attr("height") - margin.top - margin.bottom;
const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

d3.json("../../data/matches.json").then(data => {
  const matches = data.matches;
  const stats = {};

  matches.forEach(match => {
    const home = match.homeTeam.name;
    const away = match.awayTeam.name;
    const homeGoals = match.score.fullTime.home ?? 0;
    const awayGoals = match.score.fullTime.away ?? 0;

    if (!stats[home]) stats[home] = { team: home, scored: 0, conceded: 0 };
    if (!stats[away]) stats[away] = { team: away, scored: 0, conceded: 0 };

    stats[home].scored += homeGoals;
    stats[home].conceded += awayGoals;

    stats[away].scored += awayGoals;
    stats[away].conceded += homeGoals;
  });

  const dataset = Object.values(stats).map(d => ({
    team: d.team,
    diff: d.scored - d.conceded
  })).sort((a, b) => b.diff - a.diff);

  const y = d3.scaleBand()
    .domain(dataset.map(d => d.team))
    .range([0, height])
    .padding(0.2);

  const x = d3.scaleLinear()
    .domain([0, d3.max(dataset, d => d.diff) + 5])
    .range([0, width]);

  chart.selectAll("rect")
    .data(dataset)
    .join("rect")
    .attr("y", d => y(d.team))
    .attr("x", 0)
    .attr("height", y.bandwidth())
    .attr("width", d => x(d.diff))
    .attr("fill", "#0d6efd")
    .on("mouseover", (event, d) => {
      tooltip.style("visibility", "visible").html(
        `<strong>${d.team}</strong><br/>Goal Diff: ${d.diff}`
      );
    })
    .on("mousemove", event => {
      tooltip.style("top", `${event.pageY - 40}px`).style("left", `${event.pageX + 10}px`);
    })
    .on("mouseout", () => tooltip.style("visibility", "hidden"));

  chart.append("g")
    .call(d3.axisLeft(y).tickSize(0))
    .selectAll("text")
    .style("font-size", "12px");

  chart.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(5));

  chart.append("text")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .text("Goal Difference Per Team");
});
