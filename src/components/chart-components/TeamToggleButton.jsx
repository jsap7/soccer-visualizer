import React from 'react';

const TeamToggleButton = ({ teamName, logo, isSelected, color, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: isSelected ? color : '#fff',
        color: isSelected ? '#fff' : '#000',
        border: `1px solid ${color}`,
        padding: '6px 12px',
        borderRadius: '20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        transition: 'all 0.2s ease',
        height: '32px',
        whiteSpace: 'nowrap'
      }}
    >
      <img 
        src={logo} 
        alt="" 
        style={{ 
          width: '20px', 
          height: '20px',
          objectFit: 'contain'
        }} 
      />
      <span>
        {teamName.replace(' FC', '')}
      </span>
    </button>
  );
};

export default TeamToggleButton; 