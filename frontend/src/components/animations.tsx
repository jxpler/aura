import anime from 'animejs/lib/anime.es.js'

export const cardDislikeAnimation = (element: HTMLElement, onComplete?: () => void) => {
    anime({
        targets: element,
        opacity: [1, 0.1],
        translateX: ['0%', '-70%'],
        filter: ['blur(0px)', 'blur(25px)'],
        duration: 600,
        easing: 'easeInQuad',
        complete: onComplete,
    });
};

export const newCardDislikeAnimation = (element: HTMLElement, onComplete?: () => void) => {
    anime({
        targets: element,
        translateX: ['-70%', '0%'],
        filter: ['blur(50px)', 'blur(0px)'],
        opacity: [0.1, 1],
        duration: 600,
        easing: 'easeInQuad',
        complete: onComplete,
    });
};

export const emptyQueueDislikeAnimation = (element: HTMLElement, onComplete?: () => void) => {
    anime({
        targets: element,
        translateX: ['-70%', '0%'],
        filter: ['blur(50px)', 'blur(0px)'],
        opacity: [0.1, 1],
        duration: 600,
        easing: 'easeInQuad',
        complete: onComplete,
    });
};

export const newCardLikeAnimation = (element: HTMLElement, onComplete?: () => void) => {
    anime({
        targets: element,
        translateX: ['+70%', '0%'],
        translateY: ['0%', '0%'],
        filter: ['blur(50px)', 'blur(0px)'],
        opacity: [0.1, 1],
        duration: 600,
        easing: 'easeInQuad',
        complete: onComplete,
    });
};

export const emptyQueueLikeAnimation = (element: HTMLElement, onComplete?: () => void) => {
    anime({
        targets: element,
        translateX: ['+70%', '0%'],
        filter: ['blur(50px)', 'blur(0px)'],
        opacity: [0.1, 1],
        duration: 600,
        easing: 'easeInQuad',
        complete: onComplete,
    });
};

export const cardLikeAnimation = (element: HTMLElement, onComplete?: () => void) => {
    anime({
        targets: element,
        opacity: [1, 0.1],
        translateX: ['0%', '+70%'],
        filter: ['blur(0px)', 'blur(25px)'],
        duration: 600,
        easing: 'easeInQuad',
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