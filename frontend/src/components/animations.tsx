import anime from 'animejs/lib/anime.es.js'

export const cardDislikeAnimation = (element: HTMLElement, onComplete?: () => void) => {
    anime({
        targets: element,
        opacity: [1, 0.1],
        scale: [1, 1],
        translateX: ['0%', '-90%'],
        duration: 750,
        easing: 'easeInOutQuad',
        complete: onComplete,
    });
};

// TODO: do seperate animations for newcard on like and dislike(translatex)
export const newCardAnimation = (element: HTMLElement, onComplete?: () => void) => {
    anime({
        targets: element,
        translateX: ['0%', '0%'],
        translateY: ['0%', '0%'],
        scale: 1,
        opacity: [0.1, 1],
        duration: 600,
        easing: 'easeInOutQuad',
        complete: onComplete,
    });
};

export const cardLikeAnimation = (element: HTMLElement, onComplete?: () => void) => {
    anime({
        targets: element,
        opacity: [1, 0],
        scale: [1, 0.8],
        translateX: ['0%', '+40%'],
        duration: 750,
        easing: 'easeInOutQuad',
        complete: onComplete,
    });
};

export const restartButtonAnimation = (elementId: string) => {
    const element = document.getElementById(elementId);

    if (element) {
        anime({
            targets: element,
            rotate: '+=360', 
            duration: 1000, 
            loop: true, 
            easing: 'linear', 
        });
    }
};

export const animateNewQueue = (element: HTMLElement) => {
    anime({
        targets: element,
        opacity: [0, 1],
        scale: [0.5, 1],
        duration: 500,
        easing: 'linear', 
    });
};