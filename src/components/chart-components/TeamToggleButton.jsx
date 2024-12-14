import React from 'react';

const TeamToggleButton = ({ teamName, logo, isSelected, color, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: isSelected ? color : '#fff',
        color: isSelected ? '#fff' : '#000',
        border: `2px solid ${color}`,
        padding: '8px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
        justifyContent: 'flex-start'
      }}
    >
      <img 
        src={logo} 
        alt="" 
        style={{ 
          width: '24px', 
          height: '24px',
          objectFit: 'contain'
        }} 
      />
      <span style={{ 
        flex: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {teamName.replace(' FC', '')}
      </span>
    </button>
  );
};

export default TeamToggleButton; 