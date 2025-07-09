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
  console.log(id, title, description, icon, progress, target, isCompleted, isUnlocked)
  
  return (
    <div style={{
      background: isCompleted ? 'solidrgb(255, 233, 143)' : 
                 isUnlocked ? '#f9f9f9' :
                 '#f5f5f5',
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      boxShadow: isCompleted ? '0 4px 12px solidrgb(255, 233, 143)' :
                 isUnlocked ? '0 4px 12px rgba(255, 255, 255, 0.3)' :
                 '0 2px 8px rgba(0,0,0,0.1)',
      border: isCompleted ? '2px solid #ddd' :
              isUnlocked ? '2px solid #ddd' :
              '2px solid #ddd',
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
          background: '#f9f9f9',
          color: '#333',
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
            color: isCompleted ? '#333' : isUnlocked ? '#333' : '#333',
            marginBottom: 4,
            fontFamily: 'var(--font-primary)',
            letterSpacing: 'var(--tracking-wide)',
            lineHeight: 'var(--leading-tight)'
          }}>
            {title}
          </h3>
          <p style={{
            margin: 0,
            fontSize: 14,
            color: isCompleted ? '#666' : isUnlocked ? '#666' : '#666',
            lineHeight: 'var(--leading-relaxed)',
            fontFamily: 'var(--font-primary)',
            fontWeight: 'var(--font-normal)'
          }}>
            {description}
          </p>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div style={{
        background: isCompleted ? '#666' : '#e0e0e0',
        borderRadius: 8,
        height: 8,
        marginBottom: 8,
        overflow: 'hidden'
      }}>
        <div style={{
          background: isCompleted ? '#666' : isUnlocked ? '#2196F3' : '#ccc',
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
        color: isCompleted ? '#666' : isUnlocked ? '#666' : '#666'
      }}>
        <span style={{
          fontFamily: 'var(--font-primary)',
          fontWeight: 'var(--font-medium)'
        }}>
          {isCompleted ? 'Completed!' : `${progress} / ${target}`}
        </span>
        <span style={{ 
          fontFamily: 'var(--font-primary)',
          fontWeight: 'var(--font-semibold)'
        }}>
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