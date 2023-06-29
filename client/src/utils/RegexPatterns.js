/* ===== EXPORTS ===== */

// YouTube Regex
export const youtubePattern = /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be\.com\/\S*(?:watch|embed)(?:(?:(?=\/[-a-zA-Z0-9_]{11,}(?!\S))\/)|(?:\S*v=|v\/)))([-a-zA-Z0-9_]{11,})/;

// Twitch Regex
export const twitchPattern = /^(?:https?:\/\/)?(?:www\.)?(?:twitch\.tv\/(?:videos\/\d{7,11}(?:\?[\w=&-]*)?|[a-zA-Z0-9][\w]{2,24}\/clip\/[a-zA-Z0-9_-]+(?:\?[\w=&-]*)?)|clips\.twitch\.tv\/[a-zA-Z0-9_-]+)$/;

// Discord Username Regex
export const discordPattern = /^(?!.*\.{2})[a-z0-9_.]{2,32}$/;

// Email Regex
export const emailPattern =  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

// Username Regex
export const usernamePattern = /^[A-Za-z0-9_]*$/;

// Twitter Regex
export const twitterPatttern = /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)\S*$/;

// YouTube Handle Regex
export const youtubeHandlePattern = /^@[A-Za-z0-9_.-]{3,30}$/;

// Twitch Username Regex
export const twitchUsernamePattern = /^[a-zA-Z0-9][\w]{0,24}$/;