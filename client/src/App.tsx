import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import Header from './Header';
import Match from './Match';
import Lobby from './Lobby';

const App = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <BrowserRouter>
      <Switch>
        <Route path="/match/:matchId">
          <Header />
          <Match />
        </Route>
        <Route path="/">
          <Header />
          <Lobby />
        </Route>
      </Switch>
    </BrowserRouter>
  </div>
);

export default App;
