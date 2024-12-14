import { useMemo, useState } from 'react';
import { teamColors } from './chart-components/constants';

const StatColumn = ({ title, teams, statKey, isReverse = false, formatter = (val) => val }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const sortedTeams = [...teams].sort((a, b) => {
    const valA = typeof statKey === 'function' ? statKey(a[1]) : a[1][statKey];
    const valB = typeof statKey === 'function' ? statKey(b[1]) : b[1][statKey];
    return isReverse ? valA - valB : valB - valA;
  });

  const displayTeams = isExpanded ? sortedTeams : sortedTeams.slice(0, 5);

  return (
    <div className="flex-1 min-w-[300px]">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {displayTeams.map(([team, stats], index) => {
          const value = typeof statKey === 'function' ? statKey(stats) : stats[statKey];
          return (
            <div 
              key={team}
              className="flex items-center justify-between p-2 rounded bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-600 w-6">{index + 1}.</span>
                <img 
                  src={stats.teamLogo} 
                  alt={team} 
                  className="w-6 h-6 object-contain"
                />
                <span style={{ color: teamColors[team] || '#000000' }} className="font-semibold">
                  {team}
                </span>
              </div>
              <span className="font-bold">{formatter(value)}</span>
            </div>
          );
        })}
      </div>
      {teams.length > 5 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  );
};

const TeamStats = ({ matches, selectedTeams }) => {
  const teamStats = useMemo(() => {
    const stats = {};
    
    // Initialize stats for each team
    selectedTeams.forEach(team => {
      stats[team] = {
        goalsFor: 0,
        goalsAgainst: 0,
        cleanSheets: 0,
        matchesPlayed: 0,
        wins: 0,
        teamLogo: null // Will be set from first match
      };
    });

    // Process matches to calculate stats
    matches.forEach(match => {
      if (match.status !== 'FINISHED') return;

      const homeTeam = match.homeTeam.name;
      const awayTeam = match.awayTeam.name;
      const homeGoals = match.score.fullTime.home;
      const awayGoals = match.score.fullTime.away;

      // Only process stats for selected teams
      if (selectedTeams.has(homeTeam)) {
        if (!stats[homeTeam].teamLogo) {
          stats[homeTeam].teamLogo = match.homeTeam.crest;
        }
        stats[homeTeam].goalsFor += homeGoals;
        stats[homeTeam].goalsAgainst += awayGoals;
        if (awayGoals === 0) stats[homeTeam].cleanSheets++;
        if (homeGoals > awayGoals) stats[homeTeam].wins++;
        stats[homeTeam].matchesPlayed++;
      }

      if (selectedTeams.has(awayTeam)) {
        if (!stats[awayTeam].teamLogo) {
          stats[awayTeam].teamLogo = match.awayTeam.crest;
        }
        stats[awayTeam].goalsFor += awayGoals;
        stats[awayTeam].goalsAgainst += homeGoals;
        if (homeGoals === 0) stats[awayTeam].cleanSheets++;
        if (awayGoals > homeGoals) stats[awayTeam].wins++;
        stats[awayTeam].matchesPlayed++;
      }
    });

    return stats;
  }, [matches, selectedTeams]);

  if (selectedTeams.size === 0) return null;

  const teamEntries = Object.entries(teamStats);
  const formatDecimal = (num) => num.toFixed(2);
  const formatPercentage = (num) => `${(num * 100).toFixed(1)}%`;

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Team Rankings</h2>
      <div className="flex flex-wrap gap-8">
        <StatColumn 
          title="Goals Scored" 
          teams={teamEntries} 
          statKey="goalsFor" 
        />
        <StatColumn 
          title="Goals Against" 
          teams={teamEntries} 
          statKey="goalsAgainst" 
          isReverse={true}
        />
        <StatColumn 
          title="Clean Sheets" 
          teams={teamEntries} 
          statKey="cleanSheets" 
        />
        <StatColumn 
          title="Goals Per Match" 
          teams={teamEntries} 
          statKey={(stats) => stats.goalsFor / stats.matchesPlayed}
          formatter={formatDecimal}
        />
        <StatColumn 
          title="Goals Against Per Match" 
          teams={teamEntries} 
          statKey={(stats) => stats.goalsAgainst / stats.matchesPlayed}
          formatter={formatDecimal}
          isReverse={true}
        />
        <StatColumn 
          title="Win Rate" 
          teams={teamEntries} 
          statKey={(stats) => stats.wins / stats.matchesPlayed}
          formatter={formatPercentage}
        />
      </div>
    </div>
  );
};

export default TeamStats; 