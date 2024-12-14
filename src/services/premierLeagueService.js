import api from './api';

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
export const fetchMatches = async () => {
  try {
    const response = await api.get('/v4/competitions/PL/matches');
    return response.data.matches;
  } catch (error) {
    throw new Error('Failed to fetch matches: ' + error.message);
  }
};

export const fetchStandings = async () => {
  try {
    const response = await api.get('/v4/competitions/PL/standings');
    return response.data.standings[0].table;
  } catch (error) {
    throw new Error('Failed to fetch standings: ' + error.message);
  }
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

const getLastFiveMatches = (matches, teamId) => {
  const teamMatches = matches
    .filter(match => 
      (match.homeTeam.id === teamId || match.awayTeam.id === teamId) &&
      match.status === 'FINISHED'
    )
    .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate))
    .slice(0, 5);

  return teamMatches.map(match => {
    const isHome = match.homeTeam.id === teamId;
    const teamGoals = isHome ? match.score.fullTime.home : match.score.fullTime.away;
    const opponentGoals = isHome ? match.score.fullTime.away : match.score.fullTime.home;

    if (teamGoals > opponentGoals) return 'W';
    if (teamGoals < opponentGoals) return 'L';
    return 'D';
  }).reverse();
};

const getNextMatch = (matches, teamId) => {
  const currentDate = new Date();
  return matches
    .filter(match => 
      (match.homeTeam.id === teamId || match.awayTeam.id === teamId) &&
      (match.status === 'SCHEDULED' || match.status === 'TIMED') &&
      new Date(match.utcDate) > currentDate
    )
    .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))[0];
};

const getLastMatch = (matches, teamId) => {
  return matches
    .filter(match => 
      (match.homeTeam.id === teamId || match.awayTeam.id === teamId) &&
      match.status === 'FINISHED'
    )
    .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate))[0];
};

export const fetchTableData = async () => {
  try {
    // Fetch both standings and matches
    const [standingsResponse, matchesResponse] = await Promise.all([
      api.get('/v4/competitions/PL/standings'),
      api.get('/v4/competitions/PL/matches')
    ]);

    const standings = standingsResponse.data.standings[0].table;
    const matches = matchesResponse.data.matches;

    // Enhance standings with form and match data
    const enhancedStandings = standings.map(team => ({
      ...team,
      form: getLastFiveMatches(matches, team.team.id),
      formMatches: matches
        .filter(m => 
          (m.homeTeam.id === team.team.id || m.awayTeam.id === team.team.id) &&
          m.status === 'FINISHED'
        )
        .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate))
        .slice(0, 5)
        .reverse(),
      lastMatch: getLastMatch(matches, team.team.id),
      nextMatch: getNextMatch(matches, team.team.id)
    }));

    return enhancedStandings;
  } catch (error) {
    throw new Error('Failed to fetch table data: ' + error.message);
  }
}; 