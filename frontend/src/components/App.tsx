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

  const handleSpotifyLogin = () => {
    const client_id = process.env.REACT_APP_SPOTIFY_CLIENT_ID; // TODO: CHANGE TO ENV VARIABLE
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
    const hash: { [key: string]: any } = {};
    const hashValuesFromUrl = window.location.hash.substring(1).split('&');

    hashValuesFromUrl.forEach((item) => {
      if (item) {
        const parts = item.split('=');
        hash[parts[0]] = decodeURIComponent(parts[1]);
      }
    });
    window.location.hash = '';
    if (hash.access_token) {
      setIsLoggedIn(true);
    }

  }, []);

  return (
    <>
    {isLoggedIn ? <Main /> : <Login onLogin={handleSpotifyLogin} />}
    </>
    );
}

export default App;