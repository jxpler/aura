import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as fasHeart, faArrowRotateRight as farCircle, faPause, faPlay, faSkull } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

interface MainProps {
    token: string;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const Main: React.FC<MainProps> = ({ token, setIsLoggedIn }) => {
    const EXPIRY = 60 * 60 * 1000;
    const storedData = JSON.parse(localStorage.getItem('songQueue') || '[]');

    const storedSongs = storedData.songs;
    const timestamp = storedData.timestamp;

    const [isLikeAnimated, setIsLikeAnimated] = useState(false);
    const [isDislikeAnimated, setIsDislikeAnimated] = useState(false);
    const [songQueue, setSongQueue] = useState((Date.now() - timestamp < EXPIRY) ? storedSongs : []);
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audio, setAudio] = useState(null);
    const [volume, setVolume] = useState(0.5);
    const [previewError, setPreviewError] = useState(false);
    const [genres, setGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);


    const fetchGenres = async () => {
        try {
          const response = await axios.get('https://api.spotify.com/v1/recommendations/available-genre-seeds',
            {
              headers: {
                Authorization: 'Bearer ' + token,
              },
            }
          );

        setGenres(response.data.genres);

        } catch (error) {
            if (error.response.status === 401) {
                setIsLoggedIn(false);
            }
            if (error.response.status === 429) {
                console.error(error);
                return null;
            }
        }
    };
    
    const handleGenreChange = () => {
        const ulElement = document.querySelector("#userSelectedGenres");
        const selectedOptions = Array.from(ulElement.children, (li) => li.textContent);
        setSelectedGenres(selectedOptions);
    };
    
    const fetchSongs = async () => {
        try {
            const response = await axios.get('https://api.spotify.com/v1/recommendations', {
                headers: {
                    Authorization: 'Bearer ' + token
                },
                params: {
                    limit: 50,
                    seed_genres: selectedGenres.join(',')
                }
            });
            return response.data.tracks.map(item => ({
                songCover: item.album.images[0].url,
                songName: item.name,
                artistName: item.artists[0].name,
                songPreview: item.preview_url
            }));
        } catch (error) {
            if (error.response.status === 401) {
                setIsLoggedIn(false);
            }
            if (error.response.status === 429) {
                console.error(error);
                return null;
            }
            return null;
        }
    };

    useEffect(() => {
        fetchGenres();
      }, []);
    

    const handleDislike = async () => {
        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        }
        setSongQueue(prevQueue => {
            let nextQueue = [...prevQueue];
            nextQueue.shift();
            if (nextQueue.length === 5) {
                fetchSongs().then(newSongs => {
                    nextQueue = [...nextQueue, ...newSongs];
                });
            }
            return nextQueue;
        });
        setIsDislikeAnimated(true);
        setPreviewError(false);
        setTimeout(() => {
            setIsDislikeAnimated(false);
        }, 300);
    };

    const handleLike = async () => {
        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        }
        setSongQueue(prevQueue => {
            let nextQueue = [...prevQueue];
            nextQueue.shift();
            if (nextQueue.length === 5) {
                fetchSongs().then(newSongs => {
                    nextQueue = [...nextQueue, ...newSongs];
                });
            }
            return nextQueue;
        });
        setIsLikeAnimated(true);
        setPreviewError(false);
        setTimeout(() => {
            setIsLikeAnimated(false);
        }, 300);
    };

    useEffect(() => {
        if (songQueue.length === 0 && selectedGenres.length > 0) {
            fetchSongs().then(initialSongs => {
                setSongQueue(initialSongs);
            });
        }
    }, [songQueue, selectedGenres]);

    useEffect(() => {
        localStorage.setItem('songQueue', JSON.stringify({songs: songQueue, timestamp: Date.now()}));
        if (songQueue.length > 0) {
            setCurrentSong(songQueue[0]);
        } else {
            fetchSongs().then(newSongs => {
                setSongQueue(newSongs);
            });
        }
    }, [songQueue]);

    useEffect(() => {
        setAudio(new Audio());
    }, []);

    const handlePlayPause = () => {
        if (!currentSong.songPreview) {
            setPreviewError(true);
            return;
        }

    if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
    } else {
        setIsPlaying(true);
        setPreviewError(false);
        audio.volume = volume;
        audio.play();
    }
    };

    useEffect(() => {
        if (!audio || !currentSong || !currentSong.songPreview) return;
        audio.src = currentSong.songPreview;
        if (isPlaying) {
            audio.play();
        }

        if (currentSong.songPreview) {
            setPreviewError(false);
        }
    }, [audio, currentSong, isPlaying]);

    useEffect(() => {
        if (!audio) return;
        audio.volume = volume;
        }, [audio, volume]);

    const handleLogout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem('token');
        localStorage.removeItem('songQueue');
        window.location.hash = '';
        window.location.reload();
    };

    return (
        <div className="app-container">
            {previewError && <div className="error-msg">No preview</div>}
            <button onClick={handleLogout}>Logout</button>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={e => setVolume(e.target.value)}
                className="volume-slider"
            />
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
                    {selectedGenres.length > 0  ? (
                    <div className="empty-song-card">
                        <div>
                            <p>Press the button to get more songs</p>
                        </div>
                        <button className="restart-btn" onClick={() => fetchSongs().then(newSongs => setSongQueue(newSongs))}>
                            <FontAwesomeIcon icon={farCircle} color="white" size="2x"/>
                        </button>
                    </div>

                ) : (
                    <div className="cover-art">
                        <div className="empty-song-card">
                            <label htmlFor="genreSelect">Select up to 5 genres</label>
                            <select multiple onChange={handleGenreChange}>
                                {genres.map((genre) => (
                                    <option key={genre} value={genre}>
                                    {genre}
                                    </option>
                                ))}
                                </select>
                            </div>
                            <div>
                                <ul id="userSelectedGenres">
                                {selectedGenres.map((genre) => (
                                    <li key={genre}>{genre}</li>
                                ))}
                                </ul>
                                <div>
                                    <button onClick={fetchSongs}>Get Recommendations</button>
                                </div>
                            </div>
                        </div>
                    )}
                    </div>
                )}
            
            <div className="controls">
                <button className="dislike-btn" onClick={handleDislike}>
                    <FontAwesomeIcon icon={faSkull} className={isDislikeAnimated ? 'animate-icon' : ''}/>
                </button>
                <button onClick={handlePlayPause}>
                    <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} size="1x"/>
                </button>
                <button onClick={handleLike}>
                    <FontAwesomeIcon icon={fasHeart} className={isLikeAnimated ? 'animate-icon' : ''}/>
                </button>
            </div>
        </div>
        );
};

export default Main;