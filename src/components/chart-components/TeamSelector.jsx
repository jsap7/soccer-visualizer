import React from 'react';
import TeamToggleButton from './TeamToggleButton';
import { teamColors } from './constants';

const TeamSelector = ({ teams, selectedTeams, teamLogos, onTeamToggle, onSelectAll, onClearAll }) => {
  return (
    <div className="team-toggles" style={{ 
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      width: '100%',
      padding: '20px 0'
    }}>
      <div style={{ 
        display: 'flex', 
        gap: '12px',
        justifyContent: 'center'
      }}>
        <button
          onClick={onSelectAll}
          style={{
            padding: '8px 24px',
            borderRadius: '8px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            width: '120px'
          }}
        >
          Select All
        </button>
        <button
          onClick={onClearAll}
          style={{
            padding: '8px 24px',
            borderRadius: '8px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            width: '120px'
          }}
        >
          Clear All
        </button>
      </div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        justifyContent: 'center'
      }}>
        {teams.sort().map(teamName => (
          <TeamToggleButton
            key={teamName}
            teamName={teamName}
            logo={teamLogos[teamName]}
            isSelected={selectedTeams.has(teamName)}
            color={teamColors[teamName]}
            onClick={() => onTeamToggle(teamName)}
          />
        ))}
      </div>
    </div>
  );
};

export default TeamSelector; 