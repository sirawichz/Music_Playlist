import { useState, useCallback, useEffect, useRef } from 'react';
import { debouncedSearch } from '../services/itunes';
import type { Song, SearchState } from '../types';

interface UseMusicSearchReturn extends SearchState {
    setQuery: (query: string) => void;
    clearResults: () => void;
    clearError: () => void;
}

/**
 * Custom hook for searching music with debouncing
 * Prevents exceeding iTunes API rate limits
 */
export function useMusicSearch(): UseMusicSearchReturn {
    const [state, setState] = useState<SearchState>({
        query: '',
        results: [],
        isLoading: false,
        error: null,
    });

    const abortControllerRef = useRef<AbortController | null>(null);

    const setQuery = useCallback((query: string) => {
        setState((prev) => ({
            ...prev,
            query,
            isLoading: query.trim().length > 0,
            error: null,
        }));

        if (!query.trim()) {
            setState((prev) => ({
                ...prev,
                results: [],
                isLoading: false,
            }));
            return;
        }

        // Cancel previous debounced search
        debouncedSearch.cancel();

        // Execute debounced search
        debouncedSearch(query, (results: Song[], error?: Error) => {
            setState((prev) => ({
                ...prev,
                results: error ? prev.results : results,
                isLoading: false,
                error: error ? error.message : null,
            }));
        });
    }, []);

    const clearResults = useCallback(() => {
        debouncedSearch.cancel();
        setState({
            query: '',
            results: [],
            isLoading: false,
            error: null,
        });
    }, []);

    const clearError = useCallback(() => {
        setState((prev) => ({ ...prev, error: null }));
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
            abortControllerRef.current?.abort();
        };
    }, []);

    return {
        ...state,
        setQuery,
        clearResults,
        clearError,
    };
}
