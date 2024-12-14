export const processPointsData = (matches) => {
  const teamData = {};
  const teamMatches = {};
  const lastPlayedMatchweek = {};

  // Initialize team data
  matches.forEach(match => {
    [match.homeTeam, match.awayTeam].forEach(team => {
      if (!teamData[team.name]) {
        teamData[team.name] = {
          points: Array(38).fill(0)
        };
        teamMatches[team.name] = Array(38).fill(null);
        lastPlayedMatchweek[team.name] = 0;
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

    // Update points and match details
    for (let week = matchweek; week < 38; week++) {
      teamData[homeTeam].points[week] = (teamData[homeTeam].points[week - 1] || 0) + homePoints;
      teamData[awayTeam].points[week] = (teamData[awayTeam].points[week - 1] || 0) + awayPoints;
    }

    teamMatches[homeTeam][matchweek] = {
      opponent: awayTeam,
      score: homeGoals !== null && awayGoals !== null ? `${homeGoals}-${awayGoals}` : 'PP',
      isHome: true,
      homeGoals,
      awayGoals
    };
    teamMatches[awayTeam][matchweek] = {
      opponent: homeTeam,
      score: homeGoals !== null && awayGoals !== null ? `${awayGoals}-${homeGoals}` : 'PP',
      isHome: false,
      homeGoals,
      awayGoals
    };
  });

  return {
    teamData,
    teamMatches,
    lastPlayedMatchweek
  };
}; 