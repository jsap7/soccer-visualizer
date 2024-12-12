const TEXT_SIZES = {
  xs: 'text-xs',
  sm: 'text-sm',
  small: 'text-[13px]'
};

const FONT_WEIGHTS = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold'
};

const TeamName = ({ name }) => {
  const textSize = name.length > 15 ? TEXT_SIZES.small : TEXT_SIZES.sm;
  return (
    <span className={`block whitespace-nowrap ${textSize}`}>
      {name}
    </span>
  );
};

const MatchCell = ({ match, teamId, type = 'next' }) => {
  if (!match) return (
    <div className="text-gray-500 w-full">
      {type === 'next' ? 'No upcoming matches' : 'No recent matches'}
    </div>
  );

  const isHome = match.homeTeam.id === teamId;
  const opponent = isHome ? match.awayTeam : match.homeTeam;
  const matchDate = new Date(match.utcDate);
  
  const getResultColor = () => {
    if (!match.score?.fullTime) return '';
    const goalsScored = isHome ? match.score.fullTime.home : match.score.fullTime.away;
    const goalsConceded = isHome ? match.score.fullTime.away : match.score.fullTime.home;
    
    if (goalsScored === null || goalsConceded === null) return '';
    if (goalsScored > goalsConceded) return 'text-green-600';
    if (goalsScored < goalsConceded) return 'text-red-600';
    return 'text-gray-600';
  };

  const baseClasses = "grid items-center gap-1";
  const gridCols = type === 'next' 
    ? 'grid-cols-[48px_24px_1fr]' 
    : 'grid-cols-[48px_24px_1fr_45px]';

  return (
    <div className={`${baseClasses} ${gridCols}`}>
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
      {type === 'last' && (
        <div className={`${TEXT_SIZES.xs} ${FONT_WEIGHTS.medium} text-center ${getResultColor()}`}>
          {match.score?.fullTime.home !== null && match.score?.fullTime.away !== null
            ? `${isHome ? match.score.fullTime.home : match.score.fullTime.away}-${isHome ? match.score.fullTime.away : match.score.fullTime.home}`
            : 'PP'
          }
        </div>
      )}
    </div>
  );
};

export default MatchCell; 