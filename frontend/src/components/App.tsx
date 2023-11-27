import React, { useState, useEffect } from 'react';
import './App.css';


const App: React.FC = () => {
  const [isBlurred, setIsBlurred] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const handleSpotifyLogin = () => {
    const client_id = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
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
  // Initialize hash with a string index signature.
  const hash: { [key: string]: unknown } = {};

  const hashValuesFromUrl = window.location.hash
    .substring(1)
    .split('&');

  hashValuesFromUrl.forEach((item) => {
    if (item) {
      const parts = item.split('=');
      hash[parts[0]] = decodeURIComponent(parts[1]);
    }
  });

  window.location.hash = '';

  if (hash.access_token) {
    setIsLoggedIn(true);
    setIsBlurred(false);
  }
  }, []);

  return (
      <>
      <div className={`app-container ${isBlurred ? 'blurred' : 'unblurred'}`}>
          <h1>Web App</h1>
          <p>content</p>
      </div>
      {!isLoggedIn && (
          <button className="spotify-btn btn-pos" onClick={handleSpotifyLogin} id="spotify-login-btn">
              Login with Spotify
          </button>
          )}
      </>
      );
};

export default App;