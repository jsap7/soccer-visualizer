const TEXT_SIZES = {
  xs: 'text-xs',
  sm: 'text-sm',
  small: 'text-[13px]'
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

const TeamCell = ({ team }) => {
  return (
    <div className="flex items-center gap-3">
      <img 
        src={team.crest} 
        alt={team.name} 
        className="w-5 h-5 flex-shrink-0"
      />
      <TeamName name={team.name} />
    </div>
  );
};

export default TeamCell; 