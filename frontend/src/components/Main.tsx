import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { faHeart as fasHeart } from '@fortawesome/free-solid-svg-icons';

const HeartIcon = ({ isFilled, isToggled }) => {
    return (
        <FontAwesomeIcon
            icon={isFilled ? fasHeart : farHeart}
            color={isFilled ? 'red' : 'white'}
            className={isToggled ? 'animate-heart' : ''}
            />
    )
}

const Main: React.FC = () => {
    const [isFilled, setIsFilled] = useState(false);
    const [isToggled, setIsToggled] = useState(false);
    
    const handleLike = () => {
        setIsToggled(true);
        setTimeout(() => {
            setIsFilled(!isFilled);
            setIsToggled(false);
            }, 300);
    };
    
    return (
        <div className="app-container">
            <div className="cover-art">
                <img src="src\assets\img\placeholder.jpg" alt="Song cover art"/>
            </div>
            <div className="controls">
                <button className="dislike-btn">X</button>
                <button onClick={handleLike}>
                    <HeartIcon isFilled={isFilled} isToggled={isToggled} />
                </button>
            </div>
        </div>
    );
};

export default Main;