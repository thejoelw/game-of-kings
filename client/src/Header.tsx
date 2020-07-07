import React from 'react';

import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import RenameModal from './RenameModal';
import { userId } from './user';
import UserBadge from './UserBadge';
import BowIcon from './bow-icon.png';

export default () => (
  <div
    style={{
      height: '50px',
      backgroundColor: 'white',
      boxShadow: '0 0 8px 0 gray',
      zIndex: 4,
      display: 'flex',
      alignItems: 'center',
      padding: '16px',

      backgroundImage: `url(${BowIcon})`,
      backgroundSize: 'auto 80%',
      backgroundPosition: 'left center',
      backgroundRepeat: 'no-repeat',
      paddingLeft: '40px',
    }}
  >
    <h1
      style={{
        margin: '0',
        fontSize: '20px',
        verticalAlign: 'middle',
      }}
    >
      <a href="/" style={{ color: 'black' }}>
        gameofkings.io
      </a>
    </h1>
    <div style={{ flex: '1' }}></div>
    {/*
    <LoginModal />
    <div style={{ padding: '0.5em' }}>|</div>
    <RegisterModal />
    */}
    <UserBadge userId={userId} />
    <div style={{ padding: '0.5em' }}>|</div>
    <RenameModal />
  </div>
);
