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
import TeamSelector from './chart-components/TeamSelector';
import TeamStats from './TeamStats';
import { teamColors } from './chart-components/constants';
import { processMatchData } from '../utils/chartDataProcessor';
import { processPointsData } from '../utils/pointsDataProcessor';
import { processPositionsData } from '../utils/positionsDataProcessor';
import { fetchMatches } from '../services/premierLeagueService';

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

const DataChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTeams, setSelectedTeams] = useState(new Set());
  const [viewType, setViewType] = useState('points');
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        setLoading(true);
        const matches = await fetchMatches();
        
        if (!matches) {
          throw new Error('No match data received');
        }
        
        setMatches(matches);
        const basicData = processMatchData(matches);
        const pointsData = processPointsData(matches);
        const positionsData = processPositionsData(matches);
        
        setChartData({
          ...basicData,
          points: pointsData,
          positions: positionsData
        });
      } catch (err) {
        console.error('Error loading chart data:', err);
        setError(err.message || 'Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (chartData && selectedTeams.size === 0) {
      setSelectedTeams(new Set(chartData.teams));
    }
  }, [chartData]);

  const getChartOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#333',
        bodyColor: '#666',
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        boxPadding: 6,
        borderColor: 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context) => {
            return `Matchweek ${context[0].dataIndex + 1}`;
          },
          label: (context) => {
            const dataset = context.dataset;
            const matchweek = context.dataIndex + 1;
            const value = context.parsed.y;
            const matchDetails = dataset.matchDetails[matchweek - 1];

            const positionOrPoints = viewType === 'positions' 
              ? `${value}${getOrdinalSuffix(value)} place`
              : `${value} points`;

            if (!matchDetails) {
              return [`${dataset.label}`, `Current: ${positionOrPoints}`];
            }

            const venue = matchDetails.isHome ? 'Home' : 'Away';
            const [teamScore, opponentScore] = matchDetails.score.split('-').map(Number);
            let resultColor = '#666666';

            if (teamScore > opponentScore) resultColor = '#4CAF50';
            if (teamScore < opponentScore) resultColor = '#f44336';

            return [
              dataset.label,
              `Current: ${positionOrPoints}`,
              `${venue} vs ${matchDetails.opponent}`,
              `Result: ${matchDetails.score}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        display: true,
        reverse: viewType === 'positions',
        min: viewType === 'positions' ? 1 : 0,
        max: viewType === 'positions' ? 20 : undefined,
        position: 'left',
        ticks: {
          stepSize: 1,
          autoSkip: false,
          maxRotation: 0,
          font: {
            size: 12
          },
          padding: 10,
          z: 1,
          callback: function(value) {
            if (!Number.isInteger(value)) return '';
            if (viewType === 'positions') {
              return value >= 1 && value <= 20 ? `${value}${getOrdinalSuffix(value)}` : '';
            }
            return value;
          }
        },
        grid: {
          display: true,
          drawBorder: true,
          drawOnChartArea: true,
          drawTicks: true
        },
        border: {
          display: true,
          width: 1
        }
      },
      x: {
        display: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#666'
        },
        title: {
          display: true,
          text: 'Matchweek',
          color: '#666',
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      }
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 60,
        right: 60
      }
    },
    clip: false
  });

  const getChartData = () => {
    if (!chartData) return null;

    const { teams, teamLogos } = chartData;
    const currentData = chartData[viewType];
    const { teamData, teamMatches, lastPlayedMatchweek } = currentData;

    return {
      labels: Array.from({ length: 38 }, (_, i) => i + 1),
      datasets: teams
        .filter(teamName => selectedTeams.has(teamName))
        .map(teamName => {
          const color = teamColors[teamName] || '#000000';
          const lastPlayedWeek = lastPlayedMatchweek[teamName];
          const logoImage = new Image(20, 20);
          logoImage.src = teamLogos[teamName];

          const dataPoints = teamData[teamName][viewType === 'points' ? 'points' : 'positions']
            .map((value, week) => {
              if (week > lastPlayedWeek || value === null) return null;
              return {
                x: week + 1,
                y: value
              };
            }).filter(point => point !== null);

          return {
            label: teamName,
            data: dataPoints,
            borderColor: color,
            backgroundColor: color,
            pointBackgroundColor: (context) => {
              if (!context || !context.dataIndex) return color;
              const index = context.dataIndex;
              return index === lastPlayedWeek ? 'transparent' : color;
            },
            pointBorderColor: (context) => {
              if (!context || !context.dataIndex) return color;
              const index = context.dataIndex;
              return index === lastPlayedWeek ? 'transparent' : color;
            },
            borderWidth: 2,
            pointRadius: (context) => {
              if (!context || !context.dataIndex) return 4;
              const index = context.dataIndex;
              return index === lastPlayedWeek ? 15 : 4;
            },
            pointStyle: (context) => {
              if (!context || !context.dataIndex) return 'circle';
              const index = context.dataIndex;
              return index === lastPlayedWeek ? logoImage : 'circle';
            },
            pointHoverRadius: 6,
            tension: 0.1,
            fill: false,
            matchDetails: teamMatches[teamName],
            segment: {
              borderColor: () => color
            },
            parsing: {
              xAxisKey: 'x',
              yAxisKey: 'y'
            }
          };
        })
    };
  };

  const handleTeamToggle = (teamName) => {
    setSelectedTeams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teamName)) {
        newSet.delete(teamName);
      } else {
        newSet.add(teamName);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (chartData) {
      setSelectedTeams(new Set(chartData.teams));
    }
  };

  const handleClearAll = () => {
    setSelectedTeams(new Set());
  };

  const ViewSelector = () => (
    <div style={{ marginBottom: '20px' }}>
      <button
        onClick={() => setViewType('points')}
        style={{
          backgroundColor: viewType === 'points' ? '#4CAF50' : '#fff',
          color: viewType === 'points' ? '#fff' : '#000',
          padding: '8px 16px',
          marginRight: '10px',
          border: '1px solid #4CAF50',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Points
      </button>
      <button
        onClick={() => setViewType('positions')}
        style={{
          backgroundColor: viewType === 'positions' ? '#4CAF50' : '#fff',
          color: viewType === 'positions' ? '#fff' : '#000',
          padding: '8px 16px',
          border: '1px solid #4CAF50',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Positions
      </button>
    </div>
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!chartData) return null;

  return (
    <div className="chart-container" style={{ 
      width: '100%', 
      padding: '20px',
      marginLeft: '20px'
    }}>
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
        League {viewType === 'points' ? 'Points' : 'Positions'} Progression
      </h2>
      <ViewSelector />
      <div style={{ 
        height: '80vh', 
        marginBottom: '20px',
        marginLeft: '20px'
      }}>
        <Line options={getChartOptions()} data={getChartData()} />
      </div>
      <TeamSelector
        teams={chartData.teams}
        selectedTeams={selectedTeams}
        teamLogos={chartData.teamLogos}
        onTeamToggle={handleTeamToggle}
        onSelectAll={handleSelectAll}
        onClearAll={handleClearAll}
      />
      <TeamStats 
        matches={matches}
        selectedTeams={selectedTeams}
      />
    </div>
  );
};

const getOrdinalSuffix = (number) => {
  const j = number % 10;
  const k = number % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
};

export default DataChart; 