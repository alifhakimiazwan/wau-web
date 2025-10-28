/**
 * URL validation helper functions for embeddable content
 */

/**
 * Check if URL is a valid YouTube URL
 * Supports: youtube.com/watch?v=, youtu.be/, youtube.com/embed/
 */
export function isYoutubeUrl(url: string): boolean {
  return /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/.test(
    url
  );
}

/**
 * Check if URL is a valid Spotify URL
 * Supports: track, album, playlist, episode, show
 */
export function isSpotifyUrl(url: string): boolean {
  return /spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/.test(
    url
  );
}

/**
 * Check if URL can be embedded (YouTube or Spotify)
 */
export function isEmbeddableUrl(url: string): boolean {
  return isYoutubeUrl(url) || isSpotifyUrl(url);
}
