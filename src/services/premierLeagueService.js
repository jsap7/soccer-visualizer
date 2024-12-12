import axios from 'axios';

//--------------------------------------------------
// Calculate Team Statistics
//--------------------------------------------------
export const calculateTeamStats = (matches, teamId) => {
  // Initialize team statistics
  let stats = {
    team: null,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
    form: [],
    formMatches: [],
    nextMatch: null,
    lastMatch: null
  };

  // Get the current date
  const currentDate = new Date();
  
  //--------------------------------------------------
  // Filter Matches for Specific Team
  //--------------------------------------------------
  const teamMatches = matches.filter(match => 
    match.homeTeam.id === teamId || match.awayTeam.id === teamId
  );

  // Determine the team object from the first match
  const firstMatch = teamMatches[0];
  stats.team = firstMatch.homeTeam.id === teamId ? firstMatch.homeTeam : firstMatch.awayTeam;

  //--------------------------------------------------
  // Process Finished Matches
  //--------------------------------------------------
  const finishedMatches = teamMatches
    .filter(match => new Date(match.utcDate) <= currentDate)
    .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

  finishedMatches.forEach(match => {
    if (match.status === 'POSTPONED') {
      stats.form.push('PP'); // Add 'PP' to form if match is postponed
      return;
    }

    const isHome = match.homeTeam.id === teamId;
    const goalsScored = isHome ? match.score.fullTime.home : match.score.fullTime.away;
    const goalsConceded = isHome ? match.score.fullTime.away : match.score.fullTime.home;

    // Update stats based on match results
    stats.played++;
    stats.goalsFor += goalsScored;
    stats.goalsAgainst += goalsConceded;

    if (match.score.winner === (isHome ? 'HOME_TEAM' : 'AWAY_TEAM')) {
      stats.won++;
      stats.points += 3;
    } else if (match.score.winner === 'DRAW') {
      stats.drawn++;
      stats.points += 1;
    } else {
      stats.lost++;
    }
  });

  //--------------------------------------------------
  // Update Form and Determine Next/Last Match
  //--------------------------------------------------
  const lastFiveMatches = finishedMatches.slice(-5);
  stats.formMatches = lastFiveMatches;
  stats.form = lastFiveMatches.map(match => {
    if (match.status === 'POSTPONED') return 'PP';
    const isHome = match.homeTeam.id === teamId;
    if (match.score.winner === (isHome ? 'HOME_TEAM' : 'AWAY_TEAM')) return 'W';
    if (match.score.winner === 'DRAW') return 'D';
    return 'L';
  });

  // Find the next scheduled match
  stats.nextMatch = teamMatches
    .filter(match => 
      (match.status === 'TIMED' || match.status === 'SCHEDULED') &&
      new Date(match.utcDate) > currentDate
    )
    .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))[0];

  // Get the last finished match
  stats.lastMatch = finishedMatches[finishedMatches.length - 1];

  return stats;
};

//--------------------------------------------------
// Fetch Premier League Data
//--------------------------------------------------
export const fetchPremierLeagueData = async () => {
  // Fetch matches data from the API
  const matchesResponse = await axios.get('/api/v4/competitions/PL/matches');
  const matches = matchesResponse.data.matches;

  //--------------------------------------------------
  // Collect Unique Team IDs
  //--------------------------------------------------
  const teamIds = new Set();
  matches.forEach(match => {
    teamIds.add(match.homeTeam.id);
    teamIds.add(match.awayTeam.id);
  });

  //--------------------------------------------------
  // Calculate and Sort Team Statistics
  //--------------------------------------------------
  const teamStats = Array.from(teamIds).map(teamId => 
    calculateTeamStats(matches, teamId)
  );

  return sortTeamStats(teamStats);
};

//--------------------------------------------------
// Sort Team Statistics
//--------------------------------------------------
export const sortTeamStats = (teamStats) => {
  return teamStats.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const aGD = a.goalsFor - a.goalsAgainst;
    const bGD = b.goalsFor - b.goalsAgainst;
    if (bGD !== aGD) return bGD - aGD;
    return b.goalsFor - a.goalsFor;
  });
}; 