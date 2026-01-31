const fs = require('fs');
const content = fs.readFileSync('dist/assets/react-vendor.Ew23Lpep.js', 'utf8');
const regex = /Activity/g;
let match;
let count = 0;
while ((match = regex.exec(content)) !== null) {
    count++;
    if (count > 20) break; // Limit output
    console.log(`Found "Activity" at ${match.index}:`);
    const start = Math.max(0, match.index - 50);
    const end = Math.min(content.length, match.index + 50);
    console.log(content.substring(start, end));
    console.log('---');
}
