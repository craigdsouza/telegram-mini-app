import React from 'react';
import excitedSquirrelImg from '@/../assets/excited-squirrel.png';
import './Header.css';

export const Header: React.FC<{ title?: string }> = ({ title = 'Missions' }) => (
  <div className="header-root">
    <img src={excitedSquirrelImg} alt="Excited Squirrel" className="header-img" />
    <span className="header-title">{title}</span>
  </div>
); 