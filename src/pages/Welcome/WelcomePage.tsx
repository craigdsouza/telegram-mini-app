import React, { useMemo, useState , useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import squirrelImg from '@/../assets/excited-squirrel.png';
import { initDataState as _initDataState, useSignal } from '@telegram-apps/sdk-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { usePostHog } from 'posthog-js/react';
import './WelcomePage.css';

export const WelcomePage: React.FC = () => {
  const initDataState = useSignal(_initDataState);
  const user = useMemo(() => initDataState?.user, [initDataState]);
  const firstName = user?.first_name || 'Squirrel';
  const navigate = useNavigate();
  const fullSubtitleText = "Your journey to fun, simple expense tracking starts here."
  const [displayedText, setDisplayedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  
  const { loading, error, isComplete, completeStep } = useOnboarding();
  const posthog = usePostHog();



  // Test PostHog event when page loads
  useEffect(() => {
    console.log('    [POSTHOG WELCOME] Testing PostHog event capture...');
    console.log('    [POSTHOG WELCOME] PostHog instance:', posthog);
    
    if (posthog) {
      try {
        posthog.capture('welcome_page_loaded', { 
          user_id: user?.id,
          user_first_name: firstName,
          timestamp: new Date().toISOString()
        });
        console.log('    [POSTHOG WELCOME] Event captured successfully: welcome_page_loaded');
      } catch (error) {
        console.error('    [POSTHOG WELCOME] Failed to capture event:', error);
      }
    } else {
      console.warn('    [POSTHOG WELCOME] PostHog instance not available');
    }
  }, [posthog, user?.id, firstName]);

  // Redirect to home if onboarding is already completed
  useEffect(() => {
    if (isComplete) {
      console.log('🎯 [ONBOARDING WELCOME] User has completed onboarding, redirecting to home');
      navigate('/home');
    }
  }, [isComplete, navigate]);

  useEffect(() => {
    if (displayedText.length < fullSubtitleText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(fullSubtitleText.slice(0, displayedText.length + 1));
      }, 30); // 40ms per letter
      return () => clearTimeout(timeout);
    } else {
      setTypingDone(true);
    }
  }, [displayedText, fullSubtitleText]);

  useEffect(() => {
    if (typingDone) {
      const timeout = setTimeout(() => setBounce(true), 200);
      return () => clearTimeout(timeout);
    }
  }, [typingDone]);

  const handleButtonClick = async () => {
    setIsClicked(true);
    
    try {
      // Complete the welcome step (step 0)
      await completeStep(0, { completed_at: new Date().toISOString() });
      
      // Wait for the shrink animation to complete before navigating
      setTimeout(() => {
        navigate('/pledge');
      }, 500);
      
    } catch (error) {
      console.error('🎯 [ONBOARDING WELCOME] Error completing welcome step:', error);
      
      // Still navigate even if API call fails
      setTimeout(() => {
        navigate('/pledge');
      }, 500);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="welcome-root">
        <div className="welcome-flex1" />
        <div style={{ textAlign: 'center', color: '#888' }}>
          Loading...
        </div>
        <div className="welcome-flex2" />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="welcome-root">
        <div className="welcome-flex1" />
        <div style={{ textAlign: 'center', color: '#e74c3c' }}>
          Error: {error}
        </div>
        <div className="welcome-flex2" />
      </div>
    );
  }

  return (
    <div className="welcome-root">
      <div className="welcome-flex1" />
      <img
        src={squirrelImg}
        alt="Excited Squirrel"
        className="welcome-squirrel-img"
      />
      <h1 className="welcome-title">
        {`Welcome ${firstName}!`}
      </h1>
      <p className="welcome-desc">
        {displayedText}
      </p>
      <div className="welcome-flex2" />
      <button
        onClick={handleButtonClick}
        className={`welcome-go-btn ${bounce ? 'welcome-go-btn-bounce' : ''} ${isHovered ? 'welcome-go-btn-hovered' : ''} ${isClicked ? 'welcome-go-btn-clicked' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={loading}
      >
        Let's go!
      </button>
    </div>
  );
}; 