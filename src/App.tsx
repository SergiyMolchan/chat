import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import JoinPage from './pages/join-page';
import ChatPage from './pages/chat-page/chat-page';

function App() {


  return (
      <Router>
        <Switch>
          <Route exact path="/">
              <JoinPage />
          </Route>
          <Route exact path="/ChatPage">
              <ChatPage />
          </Route>
        </Switch>
      </Router>
  );
}

export default App;
