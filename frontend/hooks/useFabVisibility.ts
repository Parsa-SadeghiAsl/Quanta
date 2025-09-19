import { useState, useRef, useCallback } from 'react';

export const useFabVisibility = () => {
    const [isFabVisible, setIsFabVisible] = useState(true);
    const lastScrollY = useRef(0);

    const handleScroll = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const scrollDirection = currentScrollY > lastScrollY.current ? 'down' : 'up';
        const scrollThreshold = 10; // A small buffer

        if (scrollDirection === 'down' && currentScrollY > scrollThreshold && isFabVisible) {
            setIsFabVisible(false);
        } else if (scrollDirection === 'up' && currentScrollY < lastScrollY.current && !isFabVisible) {
            setIsFabVisible(true);
        }

        lastScrollY.current = currentScrollY;
    }, [isFabVisible]);

    return { isFabVisible, handleScroll };
};