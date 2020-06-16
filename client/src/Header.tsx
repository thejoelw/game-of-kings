import React from 'react';

import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

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
    }}
  >
    <h1
      style={{
        margin: '0',
        fontSize: '20px',
        verticalAlign: 'middle',
      }}
    >
      gameofkings.io
    </h1>
    <div style={{ flex: '1' }}></div>
    <LoginModal />
    <div style={{ padding: '0.5em' }}>|</div>
    <RegisterModal />
  </div>
);
