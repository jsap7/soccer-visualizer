import { useState } from 'react';

// Constants
const TEXT_SIZES = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  'small': 'text-[13px]'
};

const FONT_WEIGHTS = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold'
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

const TrendIndicator = ({ form }) => {
  const calculateTrend = () => {
    if (!form || form.length === 0) return 'neutral';
    
    const recentForm = [...form].reverse();
    let trendScore = 0;
    let consecutiveLosses = 0;
    let consecutiveWins = 0;
    
    recentForm.forEach((result, index) => {
      const isRecent = index < 3;
      
      switch (result) {
        case 'W':
          consecutiveLosses = 0;
          consecutiveWins++;
          trendScore += isRecent ? 2 : 1;
          if (consecutiveWins > 1) trendScore += 1;
          break;
        case 'L':
          consecutiveWins = 0;
          consecutiveLosses++;
          trendScore -= isRecent ? 3 : 2;
          if (consecutiveLosses > 1) trendScore -= 2;
          break;
        case 'D':
          if (consecutiveLosses > 0) {
            trendScore += 0.5;
            consecutiveLosses = 0;
          } else if (consecutiveWins > 0) {
            trendScore -= 0.5;
            consecutiveWins = 0;
          }
          break;
        default: break;
      }
    });

    if (trendScore >= 2) return 'up';
    if (trendScore <= -2) return 'down';
    return 'neutral';
  };

  const trend = calculateTrend();
  
  const getArrow = () => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
    }
  };

  return (
    <div className="flex items-center ml-2" title={`Form trend: ${trend}`}>
      {getArrow()}
    </div>
  );
};

const FormIndicator = ({ form = [], formMatches = [], teamId, position }) => {
  if (!Array.isArray(form)) return null;
  
  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center justify-center gap-0.5">
        {form.map((result, index) => (
          <FormCircle 
            key={index} 
            result={result} 
            isMostRecent={index === form.length - 1}
            match={formMatches?.[index]}
            teamId={teamId}
            position={position}
          />
        ))}
      </div>
      <TrendIndicator form={form} />
    </div>
  );
};

export default FormIndicator; 