import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pledgeSquirrelImg from '@/../assets/pledge-taking-squirrel.png';
import { useOnboarding } from '@/hooks/useOnboarding';
import './PledgePage.css';

export const PledgePage: React.FC = () => {
  const navigate = useNavigate();
  const { completeStep } = useOnboarding();
  
  const [pledgeText, setPledgeText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const expectedPledge = "I pledge, to act always, keeping my long term financial well being in mind";
  const placeholderText = expectedPledge;

  const handleSubmit = async () => {
    if (!pledgeText.trim()) {
      setError('Please enter the pledge text');
      return;
    }

    if (pledgeText.trim() !== expectedPledge) {
      setError('Please enter the exact pledge text');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await completeStep(1, { 
        pledge_text: pledgeText.trim(),
        completed_at: new Date().toISOString()
      });
      
      // Navigate to home after successful pledge
      navigate('/home');
    } catch (error) {
      console.error('Error completing pledge step:', error);
      setError('Failed to submit pledge. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="pledge-root">
          <div className="pledge-flex1" />
      <h1 className="pledge-title">
        Take the pledge of financial responsibility with Squirrel!
      </h1>
      {/* <p className="pledge-desc">
        Type the pledge below to continue your journey
      </p> */}
      <img
        src={pledgeSquirrelImg}
        alt="Pledge Taking Squirrel"
        className="pledge-squirrel-img"
      />

      <div className="pledge-form">
        <textarea
          className="pledge-textarea"
          placeholder={placeholderText}
          value={pledgeText}
          onChange={(e) => setPledgeText(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={3}
          disabled={isSubmitting}
        />
        {error && (
          <div className="pledge-error">
            {error}
          </div>
        )}
      </div>
      
      <div className="pledge-flex2" />
      <button
        onClick={handleSubmit}
        className={`pledge-submit-btn ${isSubmitting ? 'pledge-submit-btn-loading' : ''}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Pledge'}
      </button>
    </div>
  );
}; 