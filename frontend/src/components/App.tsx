import React, { useState, useEffect } from 'react';
import Main from './Main';
import Login from './Login';
import './App.css';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
    return storedIsLoggedIn === 'true' ? true : false;
  });

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn.toString());
    }, [isLoggedIn]);

  const [isNewUser, setIsNewUser] = useState(false);
  const [token, setToken] = useState('')

  const handleSpotifyLogin = () => {
    const client_id = ""; // TODO: CHANGE TO ENV VARIABLE
    const redirect_uri = "http://localhost:5173/";
    const scopes = 'user-read-private user-read-email playlist-modify-public playlist-modify-private user-top-read user-read-recently-played';

    window.location.href = `https://accounts.spotify.com/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${encodeURIComponent(scopes)}&response_type=token&show_dialog=true`;
  };

  useEffect(() => {
    const isFirstVisit = localStorage.getItem('firstVisit');
    if(!isFirstVisit) {
      setIsNewUser(true);
      localStorage.setItem('firstVisit', 'no');
    }
  }, []);

  useEffect(() => {
    if (isNewUser) {
      alert('First timer');
    }
  }, [isNewUser]);

  useEffect(() => {
    const hash = new URL(window.location.href).hash;
    const params = new URLSearchParams(hash.substr(1));

    if (params.get('access_token')) {
      const token = params.get('access_token') as string;
      setToken(token);
      setIsLoggedIn(true);
      localStorage.setItem('token', token);
    } else if (localStorage.getItem('token')) {
      const localStoredToken = localStorage.getItem('token') as string;
      setToken(localStoredToken);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <>
    {isLoggedIn ? <Main token={token} setIsLoggedIn={setIsLoggedIn} /> : <Login onLogin={handleSpotifyLogin} />}
    </>
    );
}

export default App;