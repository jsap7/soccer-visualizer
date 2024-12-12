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
  divider: 'border-gray-100',
  champions: 'before:bg-blue-500',
  europa: 'before:bg-green-500',
  conference: 'before:bg-orange-500',
  relegation: 'before:bg-red-500'
};

const MatchTooltip = ({ match, teamId, position }) => {
  if (!match) return null;
  
  const isHome = match.homeTeam.id === teamId;
  const homeTeam = match.homeTeam;
  const awayTeam = match.awayTeam;
  const matchDate = new Date(match.utcDate);
  const homeGoals = match.score.fullTime.home;
  const awayGoals = match.score.fullTime.away;
  
  const getScoreStyle = () => {
    if (match.status === 'POSTPONED') return 'text-gray-400';
    const teamGoals = isHome ? homeGoals : awayGoals;
    const opponentGoals = isHome ? awayGoals : homeGoals;
    if (teamGoals > opponentGoals) return 'text-green-400';
    if (teamGoals < opponentGoals) return 'text-red-400';
    return 'text-gray-300';
  };

  // For top 4 teams, show tooltip below
  const isTopTeam = position <= 4;
  const tooltipBaseClasses = `absolute ${isTopTeam ? 'top-full mt-2' : 'bottom-full mb-2'} left-1/2 -translate-x-1/2 bg-gray-800 text-white rounded-lg p-3 text-sm shadow-xl w-64 z-50 transform transition-opacity duration-150`;

  return (
    <div className={tooltipBaseClasses}>
      <div className="text-center mb-2 text-gray-300 text-xs">
        {matchDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col items-center gap-1">
          <img src={homeTeam.crest} alt={homeTeam.name} className="w-6 h-6" />
          <span className="text-xs text-center">{homeTeam.shortName || homeTeam.name}</span>
        </div>
        <div className={`font-bold text-lg ${getScoreStyle()}`}>
          {homeGoals !== null ? `${homeGoals} - ${awayGoals}` : 'PP'}
        </div>
        <div className="flex flex-col items-center gap-1">
          <img src={awayTeam.crest} alt={awayTeam.name} className="w-6 h-6" />
          <span className="text-xs text-center">{awayTeam.shortName || awayTeam.name}</span>
        </div>
      </div>
      <div className={`absolute ${isTopTeam ? 'top-[-6px]' : 'bottom-[-6px]'} left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-800 rotate-45`}></div>
    </div>
  );
};

const FormCircle = ({ result, isMostRecent, match, teamId, position }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const baseClasses = `w-5 h-5 rounded-full flex items-center justify-center ${TEXT_SIZES.xs} ${FONT_WEIGHTS.bold} text-white cursor-pointer transition-transform duration-150 hover:scale-110`;
  const lineColor = result === 'W' ? 'bg-green-500' : result === 'D' ? 'bg-gray-500' : result === 'L' ? 'bg-red-500' : 'bg-yellow-500';
  
  return (
    <div 
      className="relative flex flex-col items-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={`${baseClasses} ${lineColor}`}>
        {result}
      </div>
      {isMostRecent && (
        <div className={`w-5 h-1 ${lineColor} rounded-full mt-2 absolute bottom-[-5px]`}></div>
      )}
      {showTooltip && match && <MatchTooltip match={match} teamId={teamId} position={position} />}
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
  
  const getResultColor = () => {
    if (goalsScored === null || goalsConceded === null) return '';
    if (goalsScored > goalsConceded) return 'text-green-600';
    if (goalsScored < goalsConceded) return 'text-red-600';
    return 'text-gray-600';
  };
  
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
      <div className={`${TEXT_SIZES.xs} ${FONT_WEIGHTS.medium} text-center ${getResultColor()}`}>
        {goalsScored !== null && goalsConceded !== null ? `${goalsScored}-${goalsConceded}` : 'PP'}
      </div>
    </div>
  );
};

const Legend = () => (
  <div className="flex flex-wrap gap-4 justify-center mt-4 text-sm">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
      <span>Champions League</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-green-500"></div>
      <span>Europa League</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
      <span>Conference League</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-red-500"></div>
      <span>Relegation Zone</span>
    </div>
  </div>
);

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

  const getPositionIndicator = (position) => {
    if (position <= 4) return COLORS.champions;
    if (position === 5) return COLORS.europa;
    if (position === 6) return COLORS.conference;
    if (position >= 18) return COLORS.relegation;
    return '';
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <h1 className={`${TEXT_SIZES['2xl']} ${FONT_WEIGHTS.bold} text-center mb-6`}>Premier League Table</h1>
      <div className="flex justify-center">
        <div className="overflow-x-auto rounded-lg shadow">
          <table className={`bg-white ${TEXT_SIZES.sm} border-collapse relative`}>
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
              {tableData.map((team, index) => {
                const position = index + 1;
                const goalDiff = team.goalsFor - team.goalsAgainst;
                const goalDiffColor = goalDiff > 0 ? 'text-green-600' : 
                                    goalDiff < 0 ? 'text-red-600' : '';
                
                return (
                  <tr key={team.team.id} className="hover:bg-gray-50 border-b">
                    <td className={`px-4 py-3 text-center border-r ${COLORS.divider} relative before:absolute before:top-0 before:left-0 before:w-1 before:h-[calc(100%+1px)] ${getPositionIndicator(position)}`}>
                      {position}
                    </td>
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
                    <td className={`px-4 py-3 text-center border-r ${COLORS.divider} ${goalDiffColor} font-medium`}>{goalDiff}</td>
                    <td className={`px-4 py-3 text-center ${FONT_WEIGHTS.bold} border-r ${COLORS.divider}`}>{team.points}</td>
                    <td className="px-4 py-3 border-r ${COLORS.divider}">
                      <div className="flex items-center justify-center gap-0.5">
                        {team.form.map((result, index) => (
                          <FormCircle 
                            key={index} 
                            result={result} 
                            isMostRecent={index === team.form.length - 1}
                            match={team.formMatches?.[index]}
                            teamId={team.team.id}
                            position={position}
                          />
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Legend />
    </div>
  );
};

export default PremierLeagueTable; 