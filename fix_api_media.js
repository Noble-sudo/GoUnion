const fs = require('fs');

let content = fs.readFileSync('frontend/services/api.js', 'utf8');
if (!content.includes('media: { upload: uploadFile }')) {
  content = content.replace(
    /export const api = \{/,
    `export const api = {
      media: { upload: uploadFile },`
  );
  fs.writeFileSync('frontend/services/api.js', content);
}
console.log('Added media.upload to api');
