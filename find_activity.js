const fs = require('fs');
const content = fs.readFileSync('dist/assets/react-vendor.Ew23Lpep.js', 'utf8');
const regex = /\.Activity\s*=/g;
let match;
while ((match = regex.exec(content)) !== null) {
    console.log(`Found at ${match.index}:`);
    const start = Math.max(0, match.index - 50);
    const end = Math.min(content.length, match.index + 50);
    console.log(content.substring(start, end));
    console.log('---');
}
