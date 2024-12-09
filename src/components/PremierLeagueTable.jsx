import { useState, useEffect, useRef } from 'react';
import { fetchPremierLeagueData } from '../services/premierLeagueService';

// Font sizes
const TEXT_SIZES = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  'small': 'text-[13px]'
};

// Font weights
const FONT_WEIGHTS = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold'
};

// Colors
const COLORS = {
  header: 'bg-[#2f2f2f]',
  divider: 'border-gray-100'
};

const FormCircle = ({ result, isMostRecent }) => {
  const baseClasses = `w-5 h-5 rounded-full flex items-center justify-center ${TEXT_SIZES.xs} ${FONT_WEIGHTS.bold} text-white`;
  const lineColor = result === 'W' ? 'bg-green-500' : result === 'D' ? 'bg-gray-500' : result === 'L' ? 'bg-red-500' : 'bg-yellow-500';
  
  return (
    <div className="relative flex flex-col items-center">
      <div className={`${baseClasses} ${lineColor}`}>
        {result}
      </div>
      {isMostRecent && <div className={`w-5 h-1 ${lineColor} rounded-full mt-2 absolute bottom-[-5px]`}></div>}
    </div>
  );
};

const TeamName = ({ name, className = "" }) => {
  // Use slightly smaller text for teams with longer names
  const textSize = name.length > 15 ? TEXT_SIZES.small : TEXT_SIZES.sm;
  
  return (
    <span className={`block whitespace-nowrap ${textSize} ${className}`}>
      {name}
    </span>
  );
};

const NextMatch = ({ match, teamId }) => {
  if (!match) return <div className="text-gray-500 w-full">No upcoming matches</div>;

  const isHome = match.homeTeam.id === teamId;
  const opponent = isHome ? match.awayTeam : match.homeTeam;
  const matchDate = new Date(match.utcDate);
  
  return (
    <div className="grid grid-cols-[48px_24px_1fr] items-center gap-1">
      <div className={`${TEXT_SIZES.xs} text-gray-600`}>
        {matchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </div>
      <div className={`${TEXT_SIZES.xs} ${FONT_WEIGHTS.medium} ${isHome ? 'text-green-600' : 'text-blue-600'} text-center`}>
        {isHome ? 'H' : 'A'}
      </div>
      <div className="flex items-center gap-2">
        <img 
          src={opponent.crest} 
          alt={opponent.name}
          className="w-4 h-4 flex-shrink-0" 
        />
        <TeamName name={opponent.shortName || opponent.name} />
      </div>
    </div>
  );
};

const LastMatch = ({ match, teamId }) => {
  if (!match) return <div className="text-gray-500 w-full">No recent matches</div>;

  const isHome = match.homeTeam.id === teamId;
  const opponent = isHome ? match.awayTeam : match.homeTeam;
  const matchDate = new Date(match.utcDate);
  const goalsScored = isHome ? match.score.fullTime.home : match.score.fullTime.away;
  const goalsConceded = isHome ? match.score.fullTime.away : match.score.fullTime.home;
  
  return (
    <div className="grid grid-cols-[48px_24px_1fr_45px] items-center gap-1">
      <div className={`${TEXT_SIZES.xs} text-gray-600`}>
        {matchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </div>
      <div className={`${TEXT_SIZES.xs} ${FONT_WEIGHTS.medium} ${isHome ? 'text-green-600' : 'text-blue-600'} text-center`}>
        {isHome ? 'H' : 'A'}
      </div>
      <div className="flex items-center gap-2">
        <img 
          src={opponent.crest} 
          alt={opponent.name}
          className="w-4 h-4 flex-shrink-0" 
        />
        <TeamName name={opponent.shortName || opponent.name} />
      </div>
      <div className={`${TEXT_SIZES.xs} text-gray-600 text-center`}>
        {goalsScored !== null && goalsConceded !== null ? `${goalsScored}-${goalsConceded}` : 'PP'}
      </div>
    </div>
  );
};

const PremierLeagueTable = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPremierLeagueData();
        setTableData(data);
        setLoading(false);
      } catch (err) {
        console.error('API Error:', err);
        setError('Failed to fetch data: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mb-3"></div>
      <h2 className={`${TEXT_SIZES.lg} ${FONT_WEIGHTS.semibold} text-gray-700 mb-2`}>Loading Premier League Table</h2>
    </div>
  );

  if (error) return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded relative max-w-md text-sm">
        <strong className={FONT_WEIGHTS.bold}>Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-4">
      <h1 className={`${TEXT_SIZES['2xl']} ${FONT_WEIGHTS.bold} text-center mb-6`}>Premier League Table</h1>
      <div className="flex justify-center">
        <div className="overflow-x-auto rounded-lg shadow">
          <table className={`bg-white ${TEXT_SIZES.sm} border-collapse`}>
            <thead className={`${COLORS.header} text-white`}>
              <tr>
                <th className="px-4 py-3 text-center w-12">#</th>
                <th className="px-4 py-3 text-left w-64">Team</th>
                <th className="px-4 py-3 text-center w-12">MP</th>
                <th className="px-4 py-3 text-center w-12">W</th>
                <th className="px-4 py-3 text-center w-12">D</th>
                <th className="px-4 py-3 text-center w-12">L</th>
                <th className="px-4 py-3 text-center w-12">GF</th>
                <th className="px-4 py-3 text-center w-12">GA</th>
                <th className="px-4 py-3 text-center w-12">GD</th>
                <th className="px-4 py-3 text-center w-12">Pts</th>
                <th className="px-4 py-3 text-center w-40">Form</th>
                <th className="px-4 py-3 text-left w-72">Last Match</th>
                <th className="px-4 py-3 text-left w-64">Next Match</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {tableData.map((team, index) => (
                <tr key={team.team.id} className="hover:bg-gray-50 border-b">
                  <td className="px-4 py-3 text-center border-r ${COLORS.divider}">{index + 1}</td>
                  <td className="px-4 py-3 border-r ${COLORS.divider}">
                    <div className="flex items-center gap-3">
                      <img 
                        src={team.team.crest} 
                        alt={team.team.name} 
                        className="w-5 h-5 flex-shrink-0"
                      />
                      <TeamName name={team.team.name} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center border-r ${COLORS.divider}">{team.played}</td>
                  <td className="px-4 py-3 text-center border-r ${COLORS.divider}">{team.won}</td>
                  <td className="px-4 py-3 text-center border-r ${COLORS.divider}">{team.drawn}</td>
                  <td className="px-4 py-3 text-center border-r ${COLORS.divider}">{team.lost}</td>
                  <td className="px-4 py-3 text-center border-r ${COLORS.divider}">{team.goalsFor}</td>
                  <td className="px-4 py-3 text-center border-r ${COLORS.divider}">{team.goalsAgainst}</td>
                  <td className="px-4 py-3 text-center border-r ${COLORS.divider}">{team.goalsFor - team.goalsAgainst}</td>
                  <td className={`px-4 py-3 text-center ${FONT_WEIGHTS.bold} border-r ${COLORS.divider}`}>{team.points}</td>
                  <td className="px-4 py-3 border-r ${COLORS.divider}">
                    <div className="flex items-center justify-center gap-0.5">
                      {team.form.map((result, index) => (
                        <FormCircle key={index} result={result} isMostRecent={index === team.form.length - 1} />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 border-r ${COLORS.divider}">
                    <LastMatch match={team.lastMatch} teamId={team.team.id} />
                  </td>
                  <td className="px-4 py-3">
                    <NextMatch match={team.nextMatch} teamId={team.team.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PremierLeagueTable; 