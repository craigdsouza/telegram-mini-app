import React, { useState } from 'react';
import { Check } from 'lucide-react';
import babySquirrelSittingImg from '@/../assets/baby-squirrel-sitting.png';
import studyingSquirrelImg from '@/../assets/studying-squirrel.png';
import { CheckBoxList } from './CheckBoxList';
import './MissionCard.css';

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
  descriptionItems?: Array<{ text: string; completed: boolean }>;
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
  descriptionItems
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
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

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  // Build CSS classes
  const cardClasses = [
    'mission-card',
    isCompleted ? 'completed' : '',
    isUnlocked ? 'unlocked' : '',
    isPressed ? 'pressed' : ''
  ].filter(Boolean).join(' ');

  const iconClasses = [
    'mission-icon',
    !isUnlocked ? 'locked' : ''
  ].filter(Boolean).join(' ');

  const titleClasses = [
    'mission-title'
  ].filter(Boolean).join(' ');

  const progressContainerClasses = [
    'progress-container',
    isCompleted ? '' : 'unlocked'
  ].filter(Boolean).join(' ');

  const progressBarClasses = [
    'progress-bar',
    isCompleted ? 'completed' : ''
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cardClasses}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >


      {/* Completion Badge */}
      {isCompleted && (
        <div className="completion-badge">
          <Check size={16} />
        </div>
      )}

      {/* Mission Header */}
      <div className="mission-header">
        <div className={iconClasses}>
          <img
            src={squirrelImage}
            alt={`${title} Squirrel`}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <div className="mission-content">
          <h3 className={titleClasses}>
            {title}
          </h3>
          {isExpanded && (
            descriptionItems ? (
              <CheckBoxList items={descriptionItems} />
            ) : (
              <p className="mission-description">
                {description}
              </p>
            )
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className={progressContainerClasses}>
        <div 
          className={progressBarClasses}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Progress Text */}
      <div className="progress-text">
        <span className="progress-label">
          {isCompleted ? 'Completed!' : `${progress} / ${target}`}
        </span>
        <span className="progress-percentage">
          {Math.round(progressPercentage)}%
        </span>
      </div>

      {/* Lock Icon for locked missions */}
      {!isUnlocked && (
        <div className="lock-icon">
          🔒
        </div>
      )}
    </div>
  );
}; 