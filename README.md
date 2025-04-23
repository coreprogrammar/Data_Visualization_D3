# ⚽ FIFA World Cup 2022 Dashboard

[![GitHub stars](https://img.shields.io/github/stars/coreprogrammar/fifa-worldcup-dashboard?style=social)](https://github.com/your-username/fifa-worldcup-dashboard/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/coreprogrammar/fifa-worldcup-dashboard?style=social)](https://github.com/your-username/fifa-worldcup-dashboard/network/members)
[![MIT License](https://img.shields.io/github/license/coreprogrammar/fifa-worldcup-dashboard)](https://github.com/your-username/fifa-worldcup-dashboard/blob/main/LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/coreprogrammar/fifa-worldcup-dashboard)](https://github.com/your-username/fifa-worldcup-dashboard/commits/main)

An interactive and visually engaging dashboard that showcases data from the **FIFA World Cup 2022**, built using **D3.js**, **Bootstrap**, and **vanilla JavaScript**. This project includes a variety of dynamic charts and visualizations to help users explore teams, goals, match stats, and performance trends in an intuitive format.

---

## 🌟 Features

- 🔥 **13+ D3 Charts** – including Sankey, Circle Pack, Tree Map, Radar, Heatmap, and more.
- 🎨 **Light/Dark Theme Toggle** – With smart color adaptation.
- 📱 **Fully Responsive UI** – Optimized for all devices.
- 🧠 **Interactive Filters** – Filter by team, group, match stage, and date range.
- 📦 **Pre-fetched Data** – No backend required; data loaded from static JSON.
- 🌍 **World Map Background** – Thematic layout with animated visuals.
- 🛠️ **Separation of Concerns** – HTML, CSS, and JS organized per chart for maintainability.

---

## 📁 Folder Structure

FifaDashboard/ │ ├── index.html # Homepage with chart overview ├── homeAssets/ # Homepage assets │ ├── style.css │ ├── theme.js │ └── world.svg │ ├── data/ │ └── matches.json # Pre-fetched API data (FIFA matches) │ ├── Graphs/ # One directory per chart │ ├── BarChart/ │ │ ├── barChart.html │ │ └── Assets/ │ │ ├── style.css │ │ └── script.js │ ├── PieChart/ │ ├── SankeyDiagram/ │ ├── CirclePack/ │ ├── TreeMap/ │ ├── LineChart/ │ ├── RadarChart/ │ ├── BubbleChart/ │ ├── DonutChart/ │ ├── HorizontalBarChart/ │ ├── HeatmapChart/ │ └── StackedBarChart/ │ └── README.md

---

## 🚀 How to Run

> No backend or deployment required. Just run locally with Live Server.

### ✅ Prerequisites

- [VS Code](https://code.visualstudio.com/)
- [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)

### ▶️ Steps

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/fifa-worldcup-dashboard.git
   cd fifa-worldcup-dashboard

2. Right-click index.html and Open with Live Server
3. Browse and interact with charts using the navigation bar.


📊 Chart Previews

Chart	Description
Bar Chart	Team-wise goal comparison
Pie Chart	Distribution of goals
Sankey Diagram	Team progression through stages
Circle Pack	Total goals visualized as bubbles
Line Chart	Goal trends over time
Tree Map	Goals grouped by FIFA group
Radar Chart	Compare team stats (wins, losses, goals)
Bubble Chart	Matches vs. goals (size = wins)
Donut Chart	Win/Loss/Draw breakdown
Horizontal Bar Chart	Goal difference
Heatmap	Goals scored per day
Stacked Bar Chart	Goals by stage per team
Radial Chart	Goals distribution on a circular axis

📡 Data Source
Football-Data.org API
https://www.football-data.org/ 

🧑‍💻 Author
Shahrukh Khan
📍 Brantford, Ontario
📫 kshahrukh31@gmail.com


📝 License
This project is licensed under the MIT License.


.

💡 Contribution
Want to improve this dashboard or add your own chart? Pull requests are welcome!

# Fork the repository
# Create your feature branch
git checkout -b feature/chartName

# Commit and push
git commit -m "Add new chart"
git push origin feature/chartName

🙌 Acknowledgements
D3.js
Bootstrap 5
Football-Data.org

