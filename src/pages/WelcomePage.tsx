import React, { useMemo, useState , useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import squirrelImg from '@/../assets/excited-squirrel.png';
import { initDataState as _initDataState, useSignal } from '@telegram-apps/sdk-react';
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
        onClick={() => navigate('/home')}
        className={`welcome-go-btn ${bounce ? 'welcome-go-btn-bounce' : ''}`}
      >
        Let's go!
      </button>
    </div>
  );
}; 