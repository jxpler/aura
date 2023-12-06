import React, { useState, useEffect } from 'react';
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

  const [isNewUser, setIsNewUser] = useState(true);
  const [token, setToken] = useState('')


  const handleSpotifyLogin = () => {
    const client_id = ""; // TODO: CHANGE TO ENV VARIABLE
    const redirect_uri = "http://localhost:5173/";
    const scopes = 'user-read-private user-read-email playlist-modify-public playlist-modify-private user-top-read user-read-playback-state';

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
      if (error.response.status == 401) {
        setIsLoggedIn(false);
      }
      if (error.response.status == 429) {
        alert("Whoops, it seems we hit the Rate Limit! \nPlease try again later.");  
      }
  }
};

  const createPlaylist = async () => {
    try {
    const token = localStorage.getItem('token') as string;
    const userId = await getUserId()

    const headers = {
      'Authorization': "Bearer " + token,
      'Content-Type': 'application/json'
    };

    const playlistName = 'Super-duper special playlist';
    const playlistDescription = 'This is a super special(private 😉) playlist made by YOU using Aura ❤';
    const playlistImage = [{ url: 'playlistCover.png', width: 300, height: 300 }];

    const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        name: playlistName,
        images: playlistImage,
        description: playlistDescription,
        public: false,
      }),
    });

    if(createPlaylistResponse.ok){
      const playlistData = await createPlaylistResponse.json();
      return playlistData;
    }

    } catch (error: unknown) {
      alert(`Error creating playlist: ${error}`);
    }
  };


  useEffect(() => {
    if (isLoggedIn && isNewUser) {
      // TODO: something
    }
  }, [isLoggedIn, isNewUser]);

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
    <Main token={token} setIsLoggedIn={setIsLoggedIn} />
    </>
    ) : (
    <>
    <Login onLogin={handleSpotifyLogin} />
    {firstVisit ? (
    <div className="firstvisit-bg">
    <div className="firstvisit">
      <h1>Hi there!</h1>
      <p>I've noticed it's your first time visiting!</p>
      <br/>
      <p>What is Aura?</p>
      <p>Aura is a matcher for you and your songs, it allows you to create a playlist based on your likes on Aura.</p>
      <p>I hope you enjoy my little app!</p>
      <button className="close-button" onClick={()=> setFirstVisit(false)}>
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