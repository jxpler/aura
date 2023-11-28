import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { faHeart as fasHeart } from '@fortawesome/free-solid-svg-icons';
import { faArrowRotateRight as farCircle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

interface MainProps {
    token: string;
    setIsLoggedIn: React.Dispact<React.SetStateAction<boolean>>;
}

const Main: React.FC<MainProps> = ({ token, setIsLoggedIn }) => {
    const [isFilled, setIsFilled] = useState(false);
    const [isToggled, setIsToggled] = useState(false);
    const [songQueue, setSongQueue] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);

    const fetchSongs = async () => {
        const params ={
            limit: 30,
            seed_genres: 'pop',
        };
        try {
            const response = await axios.get('https://api.spotify.com/v1/recommendations', {
                headers: {
                    Authorization: 'Bearer ' + token
                },
                params: params
            });
            return response.data.tracks.map(item => ({
                songCover: item.album.images[0].url,
                songName: item.name,
                artistName: item.artists[0].name
            }));
        } catch (error) {
            window.alert('Error fetching songs from Spotify\n', error);
            return [];
        }
    };

    const restartSongs = () => {
        fetchSongs().then(newSongs => {
            setSongQueue(newSongs);
            setCurrentSong(newSongs[0]);
        });
    };

    const handleLike = () => {
        setIsToggled(true);
        setTimeout(() => {
            setIsFilled(!isFilled);
            setIsToggled(false);
            setSongQueue(prevQueue => {
                let nextQueue = [...prevQueue];
                setCurrentSong(nextQueue.shift());
                return nextQueue;
            });
            }, 300);
    };
    
    useEffect(() => {
        setIsFilled(false);
    },  [currentSong]);

    useEffect(() => {
        fetchSongs().then(initialSongs => {
            setSongQueue(initialSongs);
            setCurrentSong(initialSongs[0]);
        });
        }, []);

    const handleLogout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem('token');
        window.location.hash = '';
        window.location.reload();
    };


    return (
        <div className="app-container">
            <button onClick={handleLogout}>Logout</button>
            {currentSong && currentSong.songCover && currentSong.songName && currentSong.artistName ? (
                <div className="cover-art">
                    <img src={currentSong.songCover} alt="cover art"/>
                    <div className="song-details">
                        <h2>{currentSong.songName}</h2>
                        <h3>{currentSong.artistName}</h3>
                    </div>
                </div>
                ) : (
                    <div className="cover-art">
                        <div className="empty-song-card">
                            <div>
                                <p>Press restart to get more songs</p>
                            </div>
                            <button className="restart-btn" onClick={restartSongs}>
                                <FontAwesomeIcon icon={farCircle} color="white" size="2x"/>
                            </button>
                        </div>
                    </div>
                    )}

            <div className="controls">
                <button className="dislike-btn">X</button>
                <button onClick={handleLike}>
                    <FontAwesomeIcon
                        icon={isFilled ? fasHeart : farHeart}
                        color={isFilled ? 'red' : 'white'}
                        className={isToggled ? 'animate-heart' : ''}
                    />
                </button>
            </div>
        </div>
        );
};

export default Main;