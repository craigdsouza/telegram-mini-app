import React from 'react';
import { Check, IndianRupee } from 'lucide-react';
import babySquirrelSittingImg from '@/../assets/baby-squirrel-sitting.png';
import studyingSquirrelImg from '@/../assets/studying-squirrel.png';

interface MissionCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  budgetSet?: boolean;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  id,
  title,
  description,
  // icon,
  progress,
  target,
  isCompleted,
  isUnlocked,
  budgetSet
}) => {
  const progressPercentage = Math.min((progress / target) * 100, 100);

  // Determine which squirrel image to use based on mission id
  const getSquirrelImage = () => {
    switch (id) {
      case 'babySteps':
        return babySquirrelSittingImg;
      case 'juniorAnalyst':
        return studyingSquirrelImg;
      default:
        return babySquirrelSittingImg; // fallback
    }
  };

  const squirrelImage = getSquirrelImage();

  return (
    <div style={{
      background: isCompleted ? 'var(--color-bg-light)' : isUnlocked ? 'var(--color-bg-light)' : 'var(--color-bg-light)',
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      boxShadow: isCompleted
        ? '0 4px 12px rgb(255, 233, 143)'
        : isUnlocked
        ? '0 4px 12px rgba(255, 255, 255, 0.3)'
        : '0 2px 8px rgba(0,0,0,0.1)',
      border: '2px solid #ddd',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Budget Indicator (only for Junior Budget Analyst) */}
      {id === 'juniorAnalyst' && (
        <div style={{
          position: 'absolute',
          top: 12,
          right: budgetSet ? 44 : 12, // Position to the left of completion checkmark if budget is set
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          {/* Budget Status Text */}
          <span style={{
            fontSize: 14,
            color: 'var(--color-text-dark)',
            fontFamily: 'var(--font-primary)',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}>
            /budget
          </span>
          
          {/* Budget Status Icon */}
          <div style={{
            background: budgetSet ? 'var(--color-primary)' : 'var(--color-secondary)',
            color: budgetSet ? 'var(--color-text-dark)' : 'var(--color-text-light)',
            borderRadius: '50%',
            width: 26,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 'bold',
            border: '2px solid var(--color-text-dark)',
            transition: 'all 0.3s ease',
          }}>
            {budgetSet ? <IndianRupee size={16} /> : <IndianRupee size={16} />}
          </div>
        </div>
      )}

      {/* Completion Badge */}
      {isCompleted && (
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'var(--color-bg-light)',
          color: 'var(--color-text-dark)',
          borderRadius: '50%',
          border: '2px solid var(--color-text-dark)',
          width: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 'bold',
        }}>
          <Check size={16} />
        </div>
      )}

      {/* Mission Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: 12,
      }}>
        <div
          style={{
            width: 48,
            height: 48,
            marginRight: 12,
            opacity: isUnlocked ? 1 : 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={squirrelImage}
            alt={`${title} Squirrel`}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--color-text-dark)',
              marginBottom: 4,
              fontFamily: 'var(--font-primary)',
              letterSpacing: 'var(--tracking-wide)',
              lineHeight: 'var(--leading-tight)',
            }}
          >
            {title}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: 'var(--color-text-dark)',
              lineHeight: 'var(--leading-relaxed)',
              fontFamily: 'var(--font-primary)',
              fontWeight: 400,
            }}
          >
            {description}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          background: isCompleted ? 'var(--color-text-dark)' : 'var(--color-bg-light)',
          borderRadius: 8,
          height: 8,
          marginBottom: 8,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            background: isCompleted ? 'var(--color-primary)' : isUnlocked ? 'var(--color-primary)' : 'var(--color-bg-light)',
            height: '100%',
            width: `${progressPercentage}%`,
            borderRadius: 8,
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Progress Text */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 14,
          color: 'var(--color-text-dark)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-primary)',
            fontWeight: 500,
          }}
        >
          {isCompleted ? 'Completed!' : `${progress} / ${target}`}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-primary)',
            fontWeight: 600,
          }}
        >
          {Math.round(progressPercentage)}%
        </span>
      </div>

      {/* Lock Icon for locked missions */}
      {!isUnlocked && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 48,
            color: 'var(--color-text-dark)',
            opacity: 0.3,
          }}
        >
          🔒
        </div>
      )}
    </div>
  );
}; 