import React from 'react';
import TeamToggleButton from './TeamToggleButton';
import { teamColors } from './constants';

const TeamSelector = ({ teams, selectedTeams, teamLogos, onTeamToggle, onSelectAll, onClearAll }) => {
  return (
    <div className="team-toggles" style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '10px',
      padding: '15px',
      background: '#f5f5f5',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
      <button
        onClick={onSelectAll}
        style={{
          padding: '8px 12px',
          borderRadius: '6px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%'
        }}
      >
        <span style={{ flex: 1, textAlign: 'center' }}>Select All Teams</span>
      </button>
      <button
        onClick={onClearAll}
        style={{
          padding: '8px 12px',
          borderRadius: '6px',
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%'
        }}
      >
        <span style={{ flex: 1, textAlign: 'center' }}>Clear All Teams</span>
      </button>
    </div>
  );
};

export default TeamSelector; 