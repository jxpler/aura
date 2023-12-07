import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import { LazyLoadImage } from 'react-lazy-load-image-component';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as fasHeart, faArrowRotateRight as farCircle, 
        faPause, 
        faPlay, 
        faSkull, 
        faVolumeHigh, 
        faPowerOff, 
        faQuestionCircle, 
        faHeart } from '@fortawesome/free-solid-svg-icons';

import { faGithub } from '@fortawesome/free-brands-svg-icons';
import {    cardDislikeAnimation as dislikeAnimation, 
            cardLikeAnimation as likeAnimation, 
            restartButtonAnimation, animateNewQueue, 
            newCardDislikeAnimation, emptyQueueDislikeAnimation,
            newCardLikeAnimation, emptyQueueLikeAnimation} from './Animations.tsx';
import 'react-lazy-load-image-component/src/effects/blur.css';



interface MainProps {
    token: string;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

type ItemType = {
  album: {
    images: {
      url: string;
    }[];
  };
  name: string;
  artists: {
    name: string;
  }[];
  preview_url: string;
  id: string;
  songPreview: string;
  songId: string;
  songName: string;
  artistName: string;
  songAlbum: string;
  songCover: string;
};

const Main: React.FC<MainProps> = ({ setIsLoggedIn }) => {
    const storedToken = localStorage.getItem('token');
    const storedPlaylistId = localStorage.getItem('playlistId');

    const [isLikeAnimated, setIsLikeAnimated] = useState(false);
    const [isDislikeAnimated, setIsDislikeAnimated] = useState(false);


    const [songQueue, setSongQueue] = useState();
    const [currentSong, setCurrentSong] = useState<ItemType | undefined>();
    const [isPlaying, setIsPlaying] = useState(false);
    const [audio, setAudio] = useState<HTMLAudioElement | undefined>();
    const [volume, setVolume] = useState(0.5);
    const [firstFetch, setFirstFetch] = useState(0);
    const [selectedTerm, setSelectedTerm] = useState("short_term");

    const [showInformation, setShowInformation] = useState(false);

    const handleTermChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTerm(event.target.value);
        if (audio) {
            audio.pause();
            setIsPlaying(false);
        }
        fetchData(event.target.value);
    };

  const fetchData = useCallback(async (selectedTerm: string) => {
    try {
      const dataResponse = await axios.get(
        `https://api.spotify.com/v1/me/top/artists?time_range=${selectedTerm}&limit=5&offset=0`, 
        {
          headers: {
            Authorization: "Bearer " + storedToken,
          },
        }
      );

      await new Promise((resolve) => setTimeout(resolve, 50));

      const artistIds = dataResponse.data.items.map((artist: { id: string}) => artist.id);

      const songsResponse = await axios.get(
        "https://api.spotify.com/v1/recommendations?",
        {
          headers: {
            Authorization: "Bearer " + storedToken,  
          },
          params: {
            limit: 50,
            seed_artists: artistIds.join(","),
          },
        }
      );

      await new Promise((resolve) => setTimeout(resolve, 50));

      const newSongs = songsResponse.data.tracks.map((item: ItemType) => ({
        songCover: item.album.images[0].url,
        songName: item.name,  
        artistName: item.artists[0].name,
        songPreview: item.preview_url,
        songId: item.id,
      }));

        await new Promise((resolve) => setTimeout(resolve, 50));

        setSongQueue(newSongs);
        setCurrentSong(newSongs[0]);

        if (currentSong !== undefined) {
        const element = document.getElementById(`song-${currentSong.id}`);
        if (element) {
          animateNewQueue(element);
          }
        }
        

    return songQueue;
    } catch (error: unknown) {
      console.error("Error fetching data:", error);
      //@ts-expect-error error is type of unknown
      if (error.response.status == 401) {
        setIsLoggedIn(false);
        alert("Session has expired. \nPlease log in again.");
      }
      //@ts-expect-error error is type of unknown
      if (error.response.status == 429) {
        alert("Whoops, it seems we hit the Rate Limit! \nPlease try again later.");  
      }
    }
  }, [currentSong, storedToken, setIsLoggedIn, songQueue]);

  useEffect(() => {
    if (firstFetch === 0) {
        setShowInformation(true);
        fetchData(selectedTerm);
        setFirstFetch(1);
        setTimeout(() => {
            setShowInformation(false);
        }, 15000);
    }
  }, [firstFetch, selectedTerm, fetchData]);

    const getNewSongs = () => {       
        if (isPlaying && audio) {
            audio.pause();
            setIsPlaying(false);
        }
        setTimeout(() => {
            fetchData(selectedTerm);
        }, 1500);
    };

    const handleDislike = async () => {
        const currentSongId = currentSong ? document.getElementById(`song-${currentSong.songId}`) : null;
        
        if (audio && isPlaying) {
            audio.pause();
            setIsPlaying(false);
        }
        // @ts-expect-error prevQueue is not undefined
        setSongQueue(prevQueue => {
            // @ts-expect-error prevQueue is not undefined
            const nextQueue = [...prevQueue];
            if (currentSongId) {
                if(nextQueue != null) {
                    dislikeAnimation(currentSongId, () => {});
                }
            }
            nextQueue.shift();
            setTimeout(() => {
            // @ts-expect-error songQueue is not null
            if (currentSongId && songQueue.length > 1) {
                newCardDislikeAnimation(currentSongId, () => {});
            } else {
            
                emptyQueueDislikeAnimation(currentSongId as HTMLElement, () => {});}
                setCurrentSong(nextQueue[0]);
            }, 600);

            return nextQueue;
        });
        setIsDislikeAnimated(true);
        setTimeout(() => {
            setIsDislikeAnimated(false);
        }, 300);
    };

    const handleLike = async () => {
        const currentSongId = currentSong ? document.getElementById(`song-${currentSong.songId}`): null;

        const addTrackResponse = await fetch(`https://api.spotify.com/v1/playlists/${storedPlaylistId}/tracks`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + storedToken
            },
            body: JSON.stringify({
                uris: [`spotify:track:${currentSong?.songId}`]
            })
        });
        
        if (!addTrackResponse.ok) {
            console.error('Error adding track:', addTrackResponse.statusText);
            return;
        }

        if (audio && isPlaying) {
            audio.pause();
            setIsPlaying(false);
        }
        // @ts-expect-error prevQueue is not undefined
        setSongQueue(prevQueue => {
            // @ts-expect-error prevQueue is not undefined
            const nextQueue = [...prevQueue];
            if (currentSongId) {
                if(nextQueue != null) {
                    likeAnimation(currentSongId, () => {});
                }
            }



            nextQueue.shift();
            setTimeout(() => {
                // @ts-expect-error songQueue is not undefined
            if (currentSongId && songQueue.length > 1) {
                newCardLikeAnimation(currentSongId, () => {});
            } else {
                // @ts-expect-error currentSongId 
                emptyQueueLikeAnimation(currentSongId, () => {});}
                setCurrentSong(nextQueue[0]);
            }, 600);
            
            return nextQueue;
        });
        setIsLikeAnimated(true);
        setTimeout(() => {
            setIsLikeAnimated(false);
        }, 300);
    };

    useEffect(() => {
        setAudio(new Audio());
    }, []);

    const handlePlayPause = () => {
        if (audio && isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            if (audio){
            setIsPlaying(true)
            audio.volume = volume;
            audio.play();
            }
        }
    };

    useEffect(() => {
        if (!audio || !currentSong || !currentSong.songPreview) return;
        audio.src = currentSong.songPreview;
        if (isPlaying) {
            audio.play();
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

    const handleShowInformation = () => {
        setShowInformation(true);
        setTimeout(() => {
            setShowInformation(false);
        }, 10000);
    }

    return (
        <>
        <div className="top-row">
            <button className="logout-btn" onClick={handleLogout}>
                <FontAwesomeIcon icon={faPowerOff} color="white" size="lg"/>
            </button>
            <button className='question-btn' onClick={handleShowInformation}>
                <FontAwesomeIcon icon={faQuestionCircle} color="white" size="lg"/>
            </button>
            {showInformation && 
            <p className="info">
            <br/>
                <strong>Quick guide:</strong>
            <br/>
            <br/>
                <FontAwesomeIcon icon={faPowerOff} color="white" size="xs"/>- logs you out
            <br/>
                <FontAwesomeIcon icon={faSkull} color='white' size="xs"/>/
                <FontAwesomeIcon icon={faHeart} color='white' size='xs'/>- dislikes/likes current song
            <br/>
                <FontAwesomeIcon icon={faPlay} color="white" size="xs"/>/
                <FontAwesomeIcon icon={faPause} color="white" size="xs"/>- plays/pauses current song
            <br/>
            <br/>
                The dropdown menu allows you to <br/>change the timeframe of the matches<br/>(Short, Medium, Long)
            <br/>
            <br/>
                <FontAwesomeIcon icon={faQuestionCircle} color="white" size="xs"/> - shows this menu
            </p>
            }
            <label className='slider'>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                className='level'
                />
            </label>
            <FontAwesomeIcon className='slider-icon' icon={faVolumeHigh} color="white" size="lg"/>
        </div>
        <div className="app-container">
            {currentSong && currentSong.songCover && currentSong.songName && currentSong.artistName ? (
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
        <div className="links">
            <a className='github-link' href='https://github.com/jxpler'>
                <FontAwesomeIcon icon={faGithub} color="white" size="2x" />
            </a>
            {storedPlaylistId ? (<a className="playlist-link" href={`https://open.spotify.com/playlist/${storedPlaylistId}`} target='_blank'>Access your playlist here</a>) : (
                <></>
            )}
        <div>
            <select className='term-select' value={selectedTerm} onChange={handleTermChange}>
                <option value="short_term">Short</option>
                <option value="medium_term">Medium</option>
                <option value="long_term">Long</option>
            </select>
            </div>
        </div>
        </>
        );
};

export default Main;