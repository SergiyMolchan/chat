import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import JoinPage from './pages/join-page';
import ChatPage from './pages/chat-page';

const App: React.FC = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <JoinPage />
        </Route>
        <Route exact path="/ChatPage">
          <ChatPage />
        </Route>
        <Redirect to="/"/>
      </Switch>
    </Router>
  );
}

export default App;
