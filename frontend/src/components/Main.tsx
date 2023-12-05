import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as fasHeart, faArrowRotateRight as farCircle, faPause, faPlay, faSkull } from '@fortawesome/free-solid-svg-icons';
import { cardDislikeAnimation as dislikeAnimation, newCardAnimation, cardLikeAnimation as likeAnimation, restartButtonAnimation, animateNewQueue } from './animations';
import axios from 'axios';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';


interface MainProps {
    token: string;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const Main: React.FC<MainProps> = ({ setIsLoggedIn }) => {
    const storedToken = localStorage.getItem('token');


    const [isLikeAnimated, setIsLikeAnimated] = useState(false);
    const [isDislikeAnimated, setIsDislikeAnimated] = useState(false);


    const [songQueue, setSongQueue] = useState();
    const [currentSong, setCurrentSong] = useState();
    const [isPlaying, setIsPlaying] = useState(false);
    const [audio, setAudio] = useState();
    const [volume, setVolume] = useState(0.5);
    const [previewError, setPreviewError] = useState(false);
    const [firstFetch, setFirstFetch] = useState(0);


  const fetchData = async () => {
    try {
      const dataResponse = await axios.get(
        "https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=5&offset=0", 
        {
          headers: {
            Authorization: "Bearer " + storedToken,
          },
        }
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const artistIds = dataResponse.data.items.map((artist) => artist.id);

      const songsResponse = await axios.get(
        "https://api.spotify.com/v1/recommendations?",
        {
          headers: {
            Authorization: "Bearer " + storedToken,  
          },
          params: {
            limit: 10,
            seed_artists: artistIds.join(","),
          },
        }
      );

      await new Promise((resolve) => setTimeout(resolve, 500));

      const newSongs = songsResponse.data.tracks.map((item) => ({
        songCover: item.album.images[0].url,
        songName: item.name,  
        artistName: item.artists[0].name,
        songPreview: item.preview_url,
        songId: item.id,
      }));

        await new Promise((resolve) => setTimeout(resolve, 500));

        setSongQueue(newSongs);
        setCurrentSong(newSongs[0]);

        const element = document.getElementById(`song-${currentSong.id}`);
        if (element) {
          animateNewQueue(element);
          }
        

    return songQueue;
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response.status == 401) {
        setIsLoggedIn(false);
      }
      if (error.response.status == 429) {
        alert("Whoops, it seems we hit the Rate Limit! \nPlease try again later.");  
      }
    }
  };

  useEffect(() => {
    if (firstFetch == 0) {
        fetchData();
        setFirstFetch(1);
    }
  }, [firstFetch]);

    const getNewSongs = () => {

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        }
        fetchData();
    };


    const handleDislike = async () => {
        const currentSongId = document.getElementById(`song-${currentSong.songId}`);
        
        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        }
        setSongQueue(prevQueue => {
            let nextQueue = [...prevQueue];
            if (currentSongId) {
                if(nextQueue != null) {
                dislikeAnimation(currentSongId, () => {
                    currentSongId.style.opacity = '1' 
                });
                }
            }
            
           

            setTimeout(() => {
            if (currentSongId) {
            setCurrentSong(nextQueue[1]);
            newCardAnimation(currentSongId, () => {
                currentSongId.style.scale = '1';
            });}
            }, 600);

            nextQueue.shift();
            setTimeout(() => {
                setCurrentSong(nextQueue[0]);
            }, 600);
            
            return nextQueue;
        });
        setIsDislikeAnimated(true);
        setPreviewError(false);
        setTimeout(() => {
            setIsDislikeAnimated(false);
        }, 300);
    };

    const handleLike = async () => {
        const currentSongId = document.getElementById(`song-${currentSong.songId}`);
        
        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        }
        setSongQueue(prevQueue => {
            let nextQueue = [...prevQueue];
            if (currentSongId) {
                if(nextQueue != null) {
                likeAnimation(currentSongId, () => {
                    currentSongId.style.opacity = '1'
                    
                });
                }
            }

            setTimeout(() => {
            
            if (currentSongId) {
            newCardAnimation(currentSongId, () => {
                currentSongId.style.scale = '1';
            });}
            }, 600);
            setCurrentSong(prev => ({ ...prev, songCover: null }));
            nextQueue.shift(); 

            setTimeout(() => {
                setCurrentSong(nextQueue[0]);
            }, 730);
            
            return nextQueue;
        });
        setIsLikeAnimated(true);
        setPreviewError(false);
        setTimeout(() => {
            setIsLikeAnimated(false);
        }, 300);
    };

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
        window.location.hash = '';
        window.location.reload();
    };

    const callRestartAnimation = () => {
        restartButtonAnimation('restart-btn');
    };

    const handleRestart = () => {
        callRestartAnimation();
        getNewSongs();
    };


    return (
        <><div className="app-container">
            <button className="restart-btn" onClick={getNewSongs}>
                <FontAwesomeIcon icon={farCircle} color="white" size="2x" />
            </button>
            {previewError && <div className="error-msg">No preview</div>}
            <button onClick={handleLogout}>Logout</button>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={e => setVolume(e.target.value)}
                className="volume-slider" />
            {currentSong && currentSong.songCover ? (
                <div id={`song-${currentSong.songId}`} className="cover-art">
                    <LazyLoadImage
                        src={currentSong.songCover}
                        alt="song cover art"
                        effect='blur' />
                    <div className="song-details">
                        <h2>{currentSong.songName}</h2>
                        <h3>{currentSong.artistName}</h3>
                    </div>
                </div>
            ) : (
                <div className="cover-art">
                    <div className="empty-song-card">
                        <div>
                            <strong>Oops you ran out of songs! </strong>
                            <br></br>
                            <br></br>
                            <strong>Press the button below to get new songs.</strong>
                        </div>
                        <button id="restart-btn" className="restart-btn" onClick={handleRestart}>
                            <FontAwesomeIcon icon={farCircle} color="white" size="2x" />
                        </button>
                    </div>
                </div>
            )}

            <div className="controls">
                <button className="dislike-btn" onClick={handleDislike}>
                    <FontAwesomeIcon icon={faSkull}
                        className={`${isDislikeAnimated && currentSong != null ? 'animate-icon' : ''} 
                                ${currentSong == null ? 'btn-disabled' : ''}`}
                        style={{ cursor: currentSong == null ? 'none' : 'pointer' }} />
                </button>
                <button onClick={handlePlayPause} className={currentSong == null || currentSong.songPreview == null || songQueue == null ? 'btn-disabled' : ''}>
                    <FontAwesomeIcon icon={isPlaying ? faPause : faPlay}
                        style={{ cursor: currentSong == null ? 'none' : 'pointer' }}
                        size="1x" />
                </button>
                <button onClick={handleLike}>
                    <FontAwesomeIcon icon={fasHeart}
                        className={`${isLikeAnimated && currentSong != null ? 'animate-icon' : ''} 
                                ${currentSong == null ? 'btn-disabled' : ''}`}
                        style={{ cursor: currentSong == null ? 'none' : 'pointer' }} />
                </button>
            </div>
        </div>
        </>
        );
};

export default Main;