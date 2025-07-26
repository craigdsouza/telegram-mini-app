import React, { useRef, useEffect, useState } from 'react';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const expectedPledge = "I pledge, to act always, keeping my long term financial well being in mind";

  // Focus textarea and set cursor at start on mount with 2s delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(0, 0);
      }
    }, 4000); // 4 second delay

    return () => clearTimeout(timer);
  }, []);

  // Handle typing: only allow typing the expected pledge, char by char
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    // Only allow up to the length of the expected pledge
    let next = input.slice(0, expectedPledge.length);
    // Only allow matching characters at each position
    let valid = '';
    for (let i = 0; i < next.length; i++) {
      if (next[i] === expectedPledge[i]) {
        valid += next[i];
      } else {
        break;
      }
    }
    setPledgeText(valid);
  };

  // Handle keydown for blinking cursor and Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

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
        completed_at: new Date().toISOString(),
      });
      navigate('/home');
    } catch (error) {
      console.error('Error completing pledge step:', error);
      setError('Failed to submit pledge. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the overlayed pledge text with typed chars at full opacity and the rest faded
  const renderOverlayText = () => {
    const chars = expectedPledge.split('');
    return (
      <span className="pledge-overlay-text">
        {/* Only show cursor at start if nothing typed */}
        {pledgeText.length === 0 && <span className="pledge-overlay-cursor" />}
        {chars.map((char, idx) => {
          // Only show cursor at current typing position if at least one char is typed
          const showCursor = pledgeText.length > 0 && idx === pledgeText.length;
          const isTyped = idx < pledgeText.length;
          return (
            <React.Fragment key={idx}>
              {showCursor && <span className="pledge-overlay-cursor" />}
              <span
                className={isTyped ? 'pledge-overlay-typed' : 'pledge-overlay-placeholder'}
              >
                {char}
              </span>
            </React.Fragment>
          );
        })}
      </span>
    );
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
        <div className="pledge-overlay-container">
          <textarea
            ref={textareaRef}
            className="pledge-textarea"
            value={pledgeText}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={3}
            disabled={isSubmitting}
            maxLength={expectedPledge.length}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            autoComplete="off"
            style={{ color: 'transparent', caretColor: 'transparent', background: 'transparent', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', resize: 'none', zIndex: 2 }}
          />
          <div className="pledge-overlay" aria-hidden="true">
            {renderOverlayText()}
          </div>
        </div>
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
        disabled={isSubmitting || pledgeText.length !== expectedPledge.length}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Pledge'}
      </button>
    </div>
  );
}; 