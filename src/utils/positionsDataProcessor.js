export const processPositionsData = (matches) => {
  const teamData = {};
  const teamMatches = {};
  const lastPlayedMatchweek = {};

  // Initialize team data
  matches.forEach(match => {
    [match.homeTeam, match.awayTeam].forEach(team => {
      if (!teamData[team.name]) {
        teamData[team.name] = {
          points: Array(38).fill(0),
          goalDifference: Array(38).fill(0),
          goalsFor: Array(38).fill(0),
          positions: Array(38).fill(20),
          matchesPlayed: Array(38).fill(0)
        };
        teamMatches[team.name] = Array(38).fill(null);
        lastPlayedMatchweek[team.name] = -1;
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

    // Update current matchweek data
    teamData[homeTeam].points[matchweek] = (teamData[homeTeam].points[Math.max(0, matchweek - 1)] || 0) + homePoints;
    teamData[awayTeam].points[matchweek] = (teamData[awayTeam].points[Math.max(0, matchweek - 1)] || 0) + awayPoints;
    
    teamData[homeTeam].goalsFor[matchweek] = (teamData[homeTeam].goalsFor[Math.max(0, matchweek - 1)] || 0) + homeGoals;
    teamData[awayTeam].goalsFor[matchweek] = (teamData[awayTeam].goalsFor[Math.max(0, matchweek - 1)] || 0) + awayGoals;
    
    teamData[homeTeam].goalDifference[matchweek] = (teamData[homeTeam].goalDifference[Math.max(0, matchweek - 1)] || 0) + (homeGoals - awayGoals);
    teamData[awayTeam].goalDifference[matchweek] = (teamData[awayTeam].goalDifference[Math.max(0, matchweek - 1)] || 0) + (awayGoals - homeGoals);

    teamData[homeTeam].matchesPlayed[matchweek] = (teamData[homeTeam].matchesPlayed[Math.max(0, matchweek - 1)] || 0) + 1;
    teamData[awayTeam].matchesPlayed[matchweek] = (teamData[awayTeam].matchesPlayed[Math.max(0, matchweek - 1)] || 0) + 1;

    // Carry forward data to future weeks
    for (let week = matchweek + 1; week < 38; week++) {
      teamData[homeTeam].points[week] = teamData[homeTeam].points[matchweek];
      teamData[awayTeam].points[week] = teamData[awayTeam].points[matchweek];
      
      teamData[homeTeam].goalsFor[week] = teamData[homeTeam].goalsFor[matchweek];
      teamData[awayTeam].goalsFor[week] = teamData[awayTeam].goalsFor[matchweek];
      
      teamData[homeTeam].goalDifference[week] = teamData[homeTeam].goalDifference[matchweek];
      teamData[awayTeam].goalDifference[week] = teamData[awayTeam].goalDifference[matchweek];

      teamData[homeTeam].matchesPlayed[week] = teamData[homeTeam].matchesPlayed[matchweek];
      teamData[awayTeam].matchesPlayed[week] = teamData[awayTeam].matchesPlayed[matchweek];
    }

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

  // Calculate positions for each matchweek
  for (let week = 0; week < 38; week++) {
    // First, carry forward positions from previous week for teams that haven't played
    if (week > 0) {
      Object.keys(teamData).forEach(team => {
        if (teamData[team].matchesPlayed[week] === teamData[team].matchesPlayed[week - 1]) {
          teamData[team].positions[week] = teamData[team].positions[week - 1];
        }
      });
    }

    // Get all teams and their current stats
    const weekData = Object.keys(teamData).map(team => ({
      name: team,
      points: teamData[team].points[week],
      goalDifference: teamData[team].goalDifference[week],
      goalsFor: teamData[team].goalsFor[week],
      matchesPlayed: teamData[team].matchesPlayed[week],
      pointsPerMatch: teamData[team].matchesPlayed[week] > 0 
        ? teamData[team].points[week] / teamData[team].matchesPlayed[week]
        : 0
    }));

    // Sort teams by points per match (to account for games in hand), then regular tiebreakers
    weekData.sort((a, b) => {
      // First sort by points per match
      const ppgDiff = b.pointsPerMatch - a.pointsPerMatch;
      if (Math.abs(ppgDiff) > 0.01) return ppgDiff;

      // If PPG is equal, sort by total points
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      // If points are equal, sort by goal difference
      if (b.goalDifference !== a.goalDifference) {
        return b.goalDifference - a.goalDifference;
      }

      // If goal difference is equal, sort by goals scored
      if (b.goalsFor !== a.goalsFor) {
        return b.goalsFor - a.goalsFor;
      }

      // If everything is equal, sort alphabetically
      return a.name.localeCompare(b.name);
    });

    // Assign positions
    weekData.forEach((team, index) => {
      teamData[team.name].positions[week] = index + 1;
    });
  }

  return {
    teamData,
    teamMatches,
    lastPlayedMatchweek
  };
};