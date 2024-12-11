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
import axios from 'axios';

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

// Team colors mapping with official club colors
const teamColors = {
  'Liverpool FC': '#C8102E',
  'Chelsea FC': '#034694',
  'Arsenal FC': '#EF0107',
  'Manchester City FC': '#6CABDD',
  'Nottingham Forest FC': '#E53233',
  'Aston Villa FC': '#670E36',
  'Brighton & Hove Albion FC': '#0057B8',
  'AFC Bournemouth': '#DA291C',
  'Brentford FC': '#E30613',
  'Fulham FC': '#CC0000',
  'Tottenham Hotspur FC': '#132257',
  'Newcastle United FC': '#241F20',
  'Manchester United FC': '#DA291C',
  'West Ham United FC': '#7A263A',
  'Everton FC': '#003399',
  'Leicester City FC': '#003090',
  'Crystal Palace FC': '#1B458F',
  'Ipswich Town FC': '#0033A0',
  'Wolverhampton Wanderers FC': '#FDB913',
  'Southampton FC': '#D71920'
};

const DataChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTeams, setSelectedTeams] = useState(new Set());

  useEffect(() => {
    const processMatchData = (matches) => {
      const teamData = {};
      const teamMatches = {};
      const lastPlayedMatchweek = {};
      const teamLogos = {};

      // Initialize team data
      matches.forEach(match => {
        [match.homeTeam, match.awayTeam].forEach(team => {
          if (!teamData[team.name]) {
            teamData[team.name] = {
              points: Array(38).fill(0)
            };
            teamMatches[team.name] = Array(38).fill(null);
            lastPlayedMatchweek[team.name] = 0;
            teamLogos[team.name] = team.crest;
          }
        });
      });

      // Sort matches chronologically
      const sortedMatches = matches.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

      // Process each match
      sortedMatches.forEach(match => {
        if (match.status !== 'FINISHED') return;

        const matchweek = match.matchday - 1;
        const homeTeam = match.homeTeam.name;
        const awayTeam = match.awayTeam.name;
        const homeGoals = match.score.fullTime.home;
        const awayGoals = match.score.fullTime.away;

        // Update last played matchweek
        lastPlayedMatchweek[homeTeam] = Math.max(lastPlayedMatchweek[homeTeam], matchweek);
        lastPlayedMatchweek[awayTeam] = Math.max(lastPlayedMatchweek[awayTeam], matchweek);

        // Calculate match points
        const homePoints = match.score.winner === 'HOME_TEAM' ? 3 : match.score.winner === 'DRAW' ? 1 : 0;
        const awayPoints = match.score.winner === 'AWAY_TEAM' ? 3 : match.score.winner === 'DRAW' ? 1 : 0;

        // Update cumulative points for this matchweek and carry forward
        for (let week = matchweek; week < 38; week++) {
          teamData[homeTeam].points[week] = (teamData[homeTeam].points[week - 1] || 0) + homePoints;
          teamData[awayTeam].points[week] = (teamData[awayTeam].points[week - 1] || 0) + awayPoints;
        }

        // Store match details for tooltips
        teamMatches[homeTeam][matchweek] = {
          opponent: awayTeam,
          score: `${homeGoals}-${awayGoals}`,
          isHome: true
        };
        teamMatches[awayTeam][matchweek] = {
          opponent: homeTeam,
          score: `${awayGoals}-${homeGoals}`,
          isHome: false
        };
      });

      return {
        teams: Object.keys(teamData).sort(),
        teamData,
        teamMatches,
        lastPlayedMatchweek,
        teamLogos
      };
    };

    const loadData = async () => {
      try {
        const matchesResponse = await axios.get('/api/v4/competitions/PL/matches');
        const matches = matchesResponse.data.matches;
        const processedData = processMatchData(matches);
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

  useEffect(() => {
    // When chartData is loaded, initialize selectedTeams with all teams
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
        callbacks: {
          label: (context) => {
            const dataset = context.dataset;
            const matchweek = context.dataIndex;
            const value = context.parsed.y;
            const matchDetails = dataset.matchDetails[matchweek];

            if (!matchDetails) {
              return `${dataset.label}: ${value} points`;
            }

            const venue = matchDetails.isHome ? 'H' : 'A';
            return [
              `${dataset.label}: ${value} points`,
              `${venue} vs ${matchDetails.opponent}: ${matchDetails.score}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        display: true,
        beginAtZero: true,
        ticks: {
          display: true,
          color: '#666',
          stepSize: 5,
          callback: function(value) {
            return Number.isInteger(value) ? value : '';
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        title: {
          display: true,
          text: 'Points',
          color: '#666',
          font: {
            size: 14,
            weight: 'bold'
          }
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
        top: 50,
        bottom: 50,
        left: 50,
        right: 20
      }
    }
  });

  const getChartData = () => {
    if (!chartData) return null;

    const { teams, teamData, teamMatches, lastPlayedMatchweek, teamLogos } = chartData;

    // Function to find teams with same points at a given week
    const findTiedTeams = (week, points) => {
      if (points === null) return [];
      return teams.filter(team => 
        teamData[team].points[week] === points && 
        lastPlayedMatchweek[team] >= week
      );
    };

    return {
      labels: Array.from({ length: 38 }, (_, i) => i + 1),
      datasets: teams
        .filter(teamName => selectedTeams.has(teamName))
        .map(teamName => {
          const color = teamColors[teamName] || '#000000';
          const lastPlayedWeek = lastPlayedMatchweek[teamName];
          const logoImage = new Image(20, 20);
          logoImage.src = teamLogos[teamName];

          const dataPoints = teamData[teamName].points.map((points, week) => {
            if (week > lastPlayedWeek || points === null) return null;
            
            // Only adjust x position for the last point if there are ties
            if (week === lastPlayedWeek) {
              const tiedTeams = findTiedTeams(week, points);
              if (tiedTeams.length > 1) {
                const tiedIndex = tiedTeams.indexOf(teamName);
                const offset = (tiedIndex - (tiedTeams.length - 1) / 2) * 0.3;
                return {
                  x: week + 1 + offset,
                  y: points
                };
              }
            }
            return {
              x: week + 1,
              y: points
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
    const newSelectedTeams = new Set(selectedTeams);
    if (newSelectedTeams.has(teamName)) {
      newSelectedTeams.delete(teamName);
    } else {
      newSelectedTeams.add(teamName);
    }
    setSelectedTeams(newSelectedTeams);
  };

  const handleSelectAll = () => {
    if (chartData) {
      setSelectedTeams(new Set(chartData.teams));
    }
  };

  const handleClearAll = () => {
    setSelectedTeams(new Set());
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!chartData) return null;

  return (
    <div className="chart-container" style={{ height: '80vh', width: '100%', padding: '20px' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>League Points Progression</h2>
      <div style={{ height: 'calc(100% - 160px)', marginBottom: '20px' }}>
        <Line options={getChartOptions()} data={getChartData()} />
      </div>
      <div className="team-toggles" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '10px',
        padding: '15px',
        background: '#f5f5f5',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {chartData.teams.sort().map(teamName => (
          <button
            key={teamName}
            onClick={() => handleTeamToggle(teamName)}
            style={{
              backgroundColor: selectedTeams.has(teamName) ? teamColors[teamName] : '#fff',
              color: selectedTeams.has(teamName) ? '#fff' : '#000',
              border: `2px solid ${teamColors[teamName]}`,
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              boxShadow: selectedTeams.has(teamName) ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
              justifyContent: 'flex-start'
            }}
          >
            <img 
              src={chartData.teamLogos[teamName]} 
              alt="" 
              style={{ 
                width: '24px', 
                height: '24px',
                objectFit: 'contain'
              }} 
            />
            <span style={{ 
              flex: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {teamName.replace(' FC', '')}
            </span>
          </button>
        ))}
        <button
          onClick={handleSelectAll}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%'
          }}
        >
          <span style={{ 
            flex: 1,
            textAlign: 'center'
          }}>
            Select All Teams
          </span>
        </button>
        <button
          onClick={handleClearAll}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%'
          }}
        >
          <span style={{ 
            flex: 1,
            textAlign: 'center'
          }}>
            Clear All Teams
          </span>
        </button>
      </div>
    </div>
  );
};

export default DataChart; 