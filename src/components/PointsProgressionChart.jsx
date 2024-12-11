import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { fetchPremierLeagueData } from '../services/premierLeagueService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Team colors mapping
const teamColors = {
  'Arsenal': '#EF0107',
  'Manchester City': '#6CABDD',
  'Liverpool': '#C8102E',
  'Aston Villa': '#95BFE5',
  'Tottenham Hotspur': '#132257',
  'Manchester United': '#DA291C',
  'Brighton & Hove Albion': '#0057B8',
  'West Ham United': '#7A263A',
  'Newcastle United': '#241F20',
  'Chelsea': '#034694',
  'Wolverhampton Wanderers': '#FDB913',
  'Fulham': '#FFFFFF',
  'Brentford': '#E30613',
  'Crystal Palace': '#1B458F',
  'Nottingham Forest': '#DD0000',
  'Everton': '#003399',
  'Luton Town': '#F78F1E',
  'Burnley': '#6C1D45',
  'Sheffield United': '#EE2737',
  'AFC Bournemouth': '#DA291C'
};

const PointsProgressionChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processMatchData = (matches, teams) => {
      const matchweeks = Array.from({ length: 38 }, (_, i) => i + 1);
      const teamPoints = {};
      const teamMatches = {};

      // Initialize team points and matches arrays
      teams.forEach(team => {
        teamPoints[team.team.name] = Array(38).fill(null);
        teamMatches[team.team.name] = Array(38).fill(null);
      });

      // Sort matches by date to process them chronologically
      const sortedMatches = matches.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

      // Process each match to build points progression
      sortedMatches.forEach(match => {
        if (match.status !== 'FINISHED') return;

        const homeTeam = match.homeTeam.name;
        const awayTeam = match.awayTeam.name;
        const matchweek = match.matchday - 1; // 0-based index

        // Calculate points from the match
        const homePoints = match.score.winner === 'HOME_TEAM' ? 3 : match.score.winner === 'DRAW' ? 1 : 0;
        const awayPoints = match.score.winner === 'AWAY_TEAM' ? 3 : match.score.winner === 'DRAW' ? 1 : 0;

        // Update points and store match details
        teamPoints[homeTeam][matchweek] = (teamPoints[homeTeam][matchweek - 1] || 0) + homePoints;
        teamPoints[awayTeam][matchweek] = (teamPoints[awayTeam][matchweek - 1] || 0) + awayPoints;

        // Store match details for tooltips
        teamMatches[homeTeam][matchweek] = {
          opponent: awayTeam,
          score: `${match.score.fullTime.home}-${match.score.fullTime.away}`,
          isHome: true
        };
        teamMatches[awayTeam][matchweek] = {
          opponent: homeTeam,
          score: `${match.score.fullTime.away}-${match.score.fullTime.home}`,
          isHome: false
        };
      });

      // Fill forward points for weeks without matches
      Object.keys(teamPoints).forEach(team => {
        let lastPoints = 0;
        teamPoints[team] = teamPoints[team].map(points => {
          if (points === null) return lastPoints;
          lastPoints = points;
          return points;
        });
      });

      return {
        labels: matchweeks,
        datasets: teams.map(team => ({
          label: team.team.name,
          data: teamPoints[team.team.name],
          borderColor: teamColors[team.team.name] || '#000000',
          backgroundColor: teamColors[team.team.name] || '#000000',
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
          tension: 0.1,
          matchDetails: teamMatches[team.team.name]
        }))
      };
    };

    const loadData = async () => {
      try {
        const data = await fetchPremierLeagueData();
        const processedData = processMatchData(data.matches, data);
        setChartData(processedData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading chart data:', err);
        setError('Failed to load chart data');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 20,
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const dataset = context.dataset;
            const matchweek = context.dataIndex;
            const points = context.parsed.y;
            const matchDetails = dataset.matchDetails[matchweek];

            if (!matchDetails) {
              return `${dataset.label}: ${points} points`;
            }

            const venue = matchDetails.isHome ? 'H' : 'A';
            return [
              `${dataset.label}: ${points} points`,
              `${venue} vs ${matchDetails.opponent}: ${matchDetails.score}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Points'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Matchweek'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-center mb-6">Points Progression</h2>
      <div className="h-[600px] w-full">
        {chartData && <Line data={chartData} options={options} />}
      </div>
    </div>
  );
};

export default PointsProgressionChart; 