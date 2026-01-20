import { create } from 'zustand';
import type { Song, AudioPlayerState } from '../types';

interface AudioPlayerActions {
    // Playback controls
    play: () => void;
    pause: () => void;
    togglePlay: () => void;

    // Song management
    setSong: (song: Song) => void;
    setQueue: (songs: Song[], startIndex?: number) => void;
    addToQueue: (song: Song) => void;

    // Navigation
    nextSong: () => void;
    previousSong: () => void;

    // Time controls
    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;

    // Volume controls
    setVolume: (volume: number) => void;
    toggleMute: () => void;

    // Reset
    reset: () => void;
}

const initialState: AudioPlayerState = {
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isMuted: false,
    queue: [],
    queueIndex: 0,
};

export const useAudioPlayerStore = create<AudioPlayerState & AudioPlayerActions>((set, get) => ({
    ...initialState,

    play: () => set({ isPlaying: true }),

    pause: () => set({ isPlaying: false }),

    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

    setSong: (song) => set({
        currentSong: song,
        isPlaying: true,
        currentTime: 0,
    }),

    setQueue: (songs, startIndex = 0) => set({
        queue: songs,
        queueIndex: startIndex,
        currentSong: songs[startIndex] || null,
        isPlaying: true,
        currentTime: 0,
    }),

    addToQueue: (song) => set((state) => ({
        queue: [...state.queue, song],
    })),

    nextSong: () => {
        const { queue, queueIndex } = get();
        if (queueIndex < queue.length - 1) {
            const nextIndex = queueIndex + 1;
            set({
                queueIndex: nextIndex,
                currentSong: queue[nextIndex],
                currentTime: 0,
                isPlaying: true,
            });
        }
    },

    previousSong: () => {
        const { queue, queueIndex, currentTime } = get();
        // If more than 3 seconds into song, restart it
        if (currentTime > 3) {
            set({ currentTime: 0 });
            return;
        }
        // Otherwise go to previous song
        if (queueIndex > 0) {
            const prevIndex = queueIndex - 1;
            set({
                queueIndex: prevIndex,
                currentSong: queue[prevIndex],
                currentTime: 0,
                isPlaying: true,
            });
        }
    },

    setCurrentTime: (time) => set({ currentTime: time }),

    setDuration: (duration) => set({ duration }),

    setVolume: (volume) => set({ volume, isMuted: volume === 0 }),

    toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

    reset: () => set(initialState),
}));
