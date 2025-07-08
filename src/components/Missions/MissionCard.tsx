import React from 'react';

interface MissionCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  isCompleted: boolean;
  isUnlocked: boolean;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  id,
  title,
  description,
  icon,
  progress,
  target,
  isCompleted,
  isUnlocked
}) => {
  const progressPercentage = Math.min((progress / target) * 100, 100);
  
  return (
    <div style={{
      background: isCompleted ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' : 
                 isUnlocked ? 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)' :
                 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      boxShadow: isCompleted ? '0 4px 12px rgba(76, 175, 80, 0.3)' :
                 isUnlocked ? '0 4px 12px rgba(33, 150, 243, 0.3)' :
                 '0 2px 8px rgba(0,0,0,0.1)',
      border: isCompleted ? '2px solid #4CAF50' :
              isUnlocked ? '2px solid #2196F3' :
              '2px solid #e0e0e0',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Completion Badge */}
      {isCompleted && (
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: '#4CAF50',
          color: 'white',
          borderRadius: '50%',
          width: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 'bold'
        }}>
          ✓
        </div>
      )}
      
      {/* Mission Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: 12
      }}>
        <div style={{
          fontSize: 32,
          marginRight: 12,
          opacity: isUnlocked ? 1 : 0.5
        }}>
          {icon}
        </div>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 600,
            color: isCompleted ? 'white' : isUnlocked ? '#1976D2' : '#666',
            marginBottom: 4
          }}>
            {title}
          </h3>
          <p style={{
            margin: 0,
            fontSize: 14,
            color: isCompleted ? 'rgba(255,255,255,0.9)' : isUnlocked ? '#666' : '#999',
            lineHeight: 1.4
          }}>
            {description}
          </p>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div style={{
        background: isCompleted ? 'rgba(255,255,255,0.3)' : '#e0e0e0',
        borderRadius: 8,
        height: 8,
        marginBottom: 8,
        overflow: 'hidden'
      }}>
        <div style={{
          background: isCompleted ? 'white' : isUnlocked ? '#2196F3' : '#ccc',
          height: '100%',
          width: `${progressPercentage}%`,
          borderRadius: 8,
          transition: 'width 0.3s ease'
        }} />
      </div>
      
      {/* Progress Text */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 14,
        color: isCompleted ? 'white' : isUnlocked ? '#1976D2' : '#999'
      }}>
        <span>
          {isCompleted ? 'Completed!' : `${progress} / ${target}`}
        </span>
        <span style={{ fontWeight: 500 }}>
          {Math.round(progressPercentage)}%
        </span>
      </div>
      
      {/* Lock Icon for locked missions */}
      {!isUnlocked && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 48,
          color: '#ccc',
          opacity: 0.3
        }}>
          🔒
        </div>
      )}
    </div>
  );
}; 