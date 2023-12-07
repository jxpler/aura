import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Main from './Main';
import Login from './Login';
import Cursor from './Cursor';
import './App.css'; 


const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
    return storedIsLoggedIn === 'true' ? true : false;
  });

  const [firstVisit, setFirstVisit] = useState(() => {
    const isFirstVisit = localStorage.getItem('firstVisit');
    return isFirstVisit === null || isFirstVisit === undefined || isFirstVisit !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn.toString());
    }, [isLoggedIn]);

  const [isNewUser, setIsNewUser] = useState(() => {
    const isNewUser = localStorage.getItem('isNewUser');
    return isNewUser === null || isNewUser === undefined || isNewUser !== 'false';
  });

  const [token, setToken] = useState('')


  const handleSpotifyLogin = () => {
    const client_id = process.env.VITE_REACT_APP_CLIENT_ID; // TODO: CHANGE TO ENV VARIABLE
    const redirect_uri = "http://localhost:5173/";
    const scopes = 'user-read-private user-read-email playlist-modify-private user-top-read user-read-playback-state';

    window.location.href = `https://accounts.spotify.com/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${encodeURIComponent(scopes)}&response_type=token&show_dialog=true`;
  };
  
  const getUserId = async () => {
    const token = localStorage.getItem('token') as string;
    try {
      const response = await axios.get("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const userId = response.data.id;
      return userId;
    } catch (error: unknown) {
      console.error("Error fetching data:", error);
      //@ts-expect-error error is type of unknown
      if (error.response.status == 401) {
        setIsLoggedIn(false);
      }
      //@ts-expect-error error is type of unknown
      if (error.response.status == 429) {
        alert("Whoops, it seems we hit the Rate Limit! \nPlease try again later.");  
      }
  }
};

  const createPlaylist = useCallback(async () => {
    try {
    const token = localStorage.getItem('token') as string;
    const userId = await getUserId()

    const headers = {
      'Authorization': "Bearer " + token,
      'Content-Type': 'application/json'
    };

    const playlistName = 'Super-duper special playlist(made by Aura)';
    const playlistDescription = 'This is a super special(and private) playlist created by Aura!\n And curated by YOU!';

    const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        name: playlistName,
        description: playlistDescription,
        public: false,
      }),
    });

    if(createPlaylistResponse.ok){
      const playlistData = await createPlaylistResponse.json();
      localStorage.setItem('playlistId', playlistData.id);
    }

    } catch (error: unknown) {
      alert(`Error creating playlist: ${error}`);
    }
  }, []);


  useEffect(() => {
    if (isLoggedIn && isNewUser) {
      createPlaylist()
      localStorage.setItem('isNewUser', 'false');
      setIsNewUser(false);
    }
  }, [isLoggedIn, isNewUser, createPlaylist]);

  const changeFirstVisit = () => {
    localStorage.setItem('firstVisit', 'false');
    setFirstVisit(false);
  };


  useEffect(() => {
    const hash = new URL(window.location.href).hash;
    const params = new URLSearchParams(hash.substring(1));

    if (params.get('access_token')) {
      const token = params.get('access_token') as string;
      setToken(token);
      setIsLoggedIn(true);
      localStorage.setItem('token', token);
      window.location.hash = '';
    } else if (localStorage.getItem('token')) {
      const localStoredToken = localStorage.getItem('token') as string;
      setToken(localStoredToken);
      setIsLoggedIn(true);
      window.location.hash = '';
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <>
    {isLoggedIn ? (
    <>
    <Main token={token} setIsLoggedIn={setIsLoggedIn}/>
    
    </>
    ) : (
    <>
    <div className="login-container">
    <Login onLogin={handleSpotifyLogin} />
    </div>
    {firstVisit ? (
    <div className="firstvisit-bg">
    <div className="firstvisit">
    
      <h1>Hi there!</h1>
      <p>I've noticed it's your first time visiting!</p>
      <br/>
      <p>Let me quickly introduce Aura.</p>
      <p>Aura is a matcher for you and your song taste, it allows you to discover new songs that match your taste and turn that into an experience curated by you.</p>
      <br/>
      <p>I hope you enjoy my little app!</p>
      <button className="close-button" onClick={changeFirstVisit}>
        Close
      </button>
    </div>
  </div>
    ) : (
    <></>
    )}
    </>
    )}
    
    <Cursor />
    </>
    
    );
}

export default App;