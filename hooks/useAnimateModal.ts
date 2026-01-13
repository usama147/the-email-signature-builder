import { useState, useCallback } from 'react';
import { Theme } from '../App';

// A simple hook to manage modal open/close animations
export const useAnimateModal = (onCloseCallback: () => void, theme: Theme) => {
    const [isClosing, setIsClosing] = useState(false);
    
    const isLiquid = theme === 'liquid-glass';

    const modalAnimationClass = isClosing
        ? 'modal-panel-animate-out'
        : isLiquid ? 'modal-panel-animate-spring-in' : 'modal-panel-animate-in';
    
    const backdropAnimationClass = isClosing ? 'modal-bg-animate-out' : 'modal-bg-animate-in';

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            onCloseCallback();
            setIsClosing(false); 
        }, 200); // Animation duration
    }, [onCloseCallback]);

    return { isClosing, modalAnimationClass, backdropAnimationClass, handleClose };
}