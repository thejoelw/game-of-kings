import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import Match from './Match';
import Lobby from './Lobby';

const App = () => (
  <BrowserRouter>
    <Switch>
      <Route path="/match/:matchId">
        <Match />
      </Route>
      <Route path="/">
        <Lobby />
      </Route>
    </Switch>
  </BrowserRouter>
);

export default App;
