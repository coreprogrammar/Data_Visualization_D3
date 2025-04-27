const svg = d3.select("#heatmapChart");
const tooltip = d3.select("#tooltip");

const margin = { top: 100, right: 30, bottom: 30, left: 160 };
const width = +svg.attr("width") - margin.left - margin.right;
const height = +svg.attr("height") - margin.top - margin.bottom;
const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

d3.json("../../data/matches.json").then(data => {
  const matches = data.matches;
  const goalMap = {};

  const allTeams = new Set();
  const allDates = new Set();

  matches.forEach(match => {
    const dateStr = match.utcDate.split("T")[0];
    allDates.add(dateStr);

    const home = match.homeTeam.name;
    const away = match.awayTeam.name;
    allTeams.add(home);
    allTeams.add(away);

    const homeGoals = match.score.fullTime.home ?? 0;
    const awayGoals = match.score.fullTime.away ?? 0;

    goalMap[`${home}-${dateStr}`] = (goalMap[`${home}-${dateStr}`] || 0) + homeGoals;
    goalMap[`${away}-${dateStr}`] = (goalMap[`${away}-${dateStr}`] || 0) + awayGoals;
  });

  
  const teams = Array.from(allTeams).sort();
  const dates = Array.from(allDates).sort();

  const parsedDates = dates.map(d => new Date(d));

  const dataMatrix = [];

  teams.forEach(team => {
    dates.forEach(date => {
      const key = `${team}-${date}`;
      dataMatrix.push({
        team,
        date,
        goals: goalMap[key] || 0
      });
    });
  });

  const x = d3.scaleBand().range([0, width]).domain(parsedDates.map(d => d.toISOString().split("T")[0])).padding(0.05);
  const y = d3.scaleBand().range([0, height]).domain(teams).padding(0.05);

  const colorScale = d3.scaleSequential()
    .interpolator(d3.interpolateOrRd)
    .domain([0, d3.max(dataMatrix, d => d.goals)]);

  chart.append("g")
    .selectAll("rect")
    .data(dataMatrix)
    .join("rect")
    .attr("x", d => x(d.date))
    .attr("y", d => y(d.team))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .style("fill", d => colorScale(d.goals))
    .on("mouseover", (event, d) => {
      tooltip.style("visibility", "visible")
        .html(`<strong>${d.team}</strong><br/>Date: ${d.date}<br/>Goals: ${d.goals}`);
    })
    .on("mousemove", event => {
      tooltip.style("top", `${event.pageY - 40}px`)
        .style("left", `${event.pageX + 10}px`);
    })
    .on("mouseout", () => tooltip.style("visibility", "hidden"));

  chart.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickFormat(d => {
      const dateObj = new Date(d);
      return d3.timeFormat("%b %d")(dateObj);
    }).tickSize(0))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end")
    .style("font-size", "11px");
  

  chart.append("g")
    .call(d3.axisLeft(y).tickSize(0))
    .selectAll("text")
    .style("font-size", "11px");

  svg.append("text")
    .attr("x", width / 2 + margin.left)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .text("Heatmap of Goals Scored Per Day Per Team");
});
