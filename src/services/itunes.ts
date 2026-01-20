import debounce from 'lodash.debounce';
import type { Song, ITunesSearchResponse, ITunesTrack } from '../types';

const ITUNES_API_BASE = 'https://itunes.apple.com';

/**
 * Maps iTunes API track to our Song type
 */
function mapITunesTrackToSong(track: ITunesTrack): Song {
    return {
        id: track.trackId.toString(),
        songTitle: track.trackName,
        artistName: track.artistName,
        albumName: track.collectionName,
        // Get higher resolution artwork (300x300 instead of 100x100)
        albumArtUrl: track.artworkUrl100.replace('100x100', '300x300'),
        audioPreviewUrl: track.previewUrl || null,
        durationMs: track.trackTimeMillis,
        releaseDate: track.releaseDate,
        genre: track.primaryGenreName,
    };
}

/**
 * Search songs from iTunes API
 * @param query - Search query string
 * @param limit - Maximum number of results (default: 25)
 * @returns Array of Song objects
 */
export async function searchSongsFromItunes(
    query: string,
    limit: number = 25
): Promise<Song[]> {
    if (!query.trim()) {
        return [];
    }

    try {
        const params = new URLSearchParams({
            term: query,
            media: 'music',
            entity: 'song',
            limit: limit.toString(),
        });

        const response = await fetch(`${ITUNES_API_BASE}/search?${params}`);

        if (!response.ok) {
            throw new Error(`iTunes API error: ${response.status}`);
        }

        const data: ITunesSearchResponse = await response.json();

        return data.results.map(mapITunesTrackToSong);
    } catch (error) {
        console.error('Error searching iTunes:', error);
        throw error;
    }
}

/**
 * Debounced search function to prevent rate limiting
 * iTunes API has a limit of ~20 requests per minute
 */
export const debouncedSearch = debounce(
    async (
        query: string,
        callback: (results: Song[], error?: Error) => void
    ) => {
        try {
            const results = await searchSongsFromItunes(query);
            callback(results);
        } catch (error) {
            callback([], error as Error);
        }
    },
    300 // 300ms debounce delay
);

/**
 * Get song details by track ID
 */
export async function getSongById(trackId: string): Promise<Song | null> {
    try {
        const params = new URLSearchParams({
            id: trackId,
            entity: 'song',
        });

        const response = await fetch(`${ITUNES_API_BASE}/lookup?${params}`);

        if (!response.ok) {
            throw new Error(`iTunes API error: ${response.status}`);
        }

        const data: ITunesSearchResponse = await response.json();

        if (data.results.length === 0) {
            return null;
        }

        return mapITunesTrackToSong(data.results[0]);
    } catch (error) {
        console.error('Error fetching song:', error);
        throw error;
    }
}
