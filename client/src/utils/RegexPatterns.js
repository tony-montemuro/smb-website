/* ===== EXPORTS ===== */

// YouTube Regex
export const youtubePattern = /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be\.com\/\S*(?:watch|embed)(?:(?:(?=\/[-a-zA-Z0-9_]{11,}(?!\S))\/)|(?:\S*v=|v\/)))([-a-zA-Z0-9_]{11,})/;

// Twitch Regex
export const twitchPattern = /^(?:https?:\/\/)?(?:www\.)?(?:twitch\.tv\/(?:videos\/(\d{7,11})(?:\?t=([\dhms]+))?[^\s&]*(?:\?[\w=&-]*)?|[a-zA-Z0-9][\w]{2,24}\/clip\/([a-zA-Z0-9_-]+)(?:\?[\w=&-]*)?)|clips\.twitch\.tv\/([a-zA-Z0-9_-]+))(?:\?[\w=&-]*)?$/;

// Discord Username Regex
export const discordPattern = /^(?!.*\.{2})[a-z0-9_.]{2,32}$/;

// Email Regex
export const emailPattern =  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

// Username Regex
export const usernamePattern = /^[A-Za-z0-9][\w]{2,15}$/;

// Twitter Regex
export const twitterPatttern = /^(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)[/\S]*$/;

// YouTube Handle Regex
export const youtubeHandlePattern = /^@[\w.-]{3,30}$/;

// Twitch Username Regex
export const twitchUsernamePattern = /^[a-zA-Z0-9][\w]{1,23}$/;

// Twitter Handle Regex
export const twitterHandlePattern = /^@[\w]{4,15}$/;

// YouTube Timestamp Regex
export const youtubeTimestampPattern = /[?&]t=([\dhms]+)/;

// Timer Regex
export const timerPattern = /((\d*)h)?((\d*)m)?((\d*)s)?/;

// Imgur Regex
export const imgurPattern = /^(?:https?:\/\/)?(?:i\.)?(?:www\.)?(?:imgur\.com\/)?(?:a\/)?([a-zA-Z0-9]{7})(?:\.mp4)?$/;

// Google Drive Regex
export const googleDrivePattern = /^(?:https?:\/\/)?drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)(?:\/[^/?]+)?(?:\?.*)?$/;