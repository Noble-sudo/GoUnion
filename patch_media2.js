import fs from 'fs';

let code = fs.readFileSync('frontend/components/ui/MediaPlayer.jsx', 'utf8');

// Update isVideoUrl to detect Cloudinary video paths or other video hints
const newIsVideoUrl = `export function isVideoUrl(url) {
    if (!url)
        return false;
    const clean = url.split("?")[0].toLowerCase();
    const ext = clean.split(".").pop() ?? "";
    if (url.includes('/video/upload/')) return true;
    return VIDEO_EXTENSIONS.includes(ext);
}`;

code = code.replace(
    /export function isVideoUrl\(url\) \{[\s\S]*?return VIDEO_EXTENSIONS\.includes\(ext\);\n\}/,
    newIsVideoUrl
);

// Also pass mediaType into MediaPlayer
code = code.replace(
    /export const MediaPlayer = \(\{ url, alt, onLoad, onLoadedData, autoPlayOnVisible, objectCover, maxHeight \}\) => isVideoUrl\(url\)/,
    `export const MediaPlayer = ({ url, mediaType, alt, onLoad, onLoadedData, autoPlayOnVisible, objectCover, maxHeight }) => (mediaType === "video" || isVideoUrl(url))`
);

fs.writeFileSync('frontend/components/ui/MediaPlayer.jsx', code);

// Now update PostCard.jsx to pass mediaType
let postCardCode = fs.readFileSync('frontend/components/feed/PostCard.jsx', 'utf8');
postCardCode = postCardCode.replace(
    /url: post\.imageUrl,/g,
    'url: post.imageUrl, mediaType: post.mediaType,'
);
fs.writeFileSync('frontend/components/feed/PostCard.jsx', postCardCode);

console.log('Patched MediaPlayer and PostCard for videos');
