export const processMatchData = (matches) => {
  const teams = new Set();
  const teamLogos = {};

  // Extract team information
  matches.forEach(match => {
    [match.homeTeam, match.awayTeam].forEach(team => {
      teams.add(team.name);
      teamLogos[team.name] = team.crest;
    });
  });

  return {
    teams: Array.from(teams).sort(),
    teamLogos,
    matches: matches.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
  };
}; 