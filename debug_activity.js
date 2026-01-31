
try {
    const lucide = require('lucide-react');
    console.log('lucide-react loaded');
    console.log('Activity in lucide-react:', !!lucide.Activity);
} catch (e) {
    console.log('lucide-react not found or error:', e.message);
}

try {
    const heroicons = require('@heroicons/react/24/outline');
    console.log('@heroicons/react/24/outline loaded');
    console.log('Activity in heroicons:', !!heroicons.Activity);
    // List some icons to be sure
    console.log('Keys in heroicons:', Object.keys(heroicons).slice(0, 5));
} catch (e) {
    console.log('heroicons not found or error:', e.message);
}

try {
    const ActivityCard = require('./src/components/ui/ActivityCard.tsx'); // This won't work directly in node without transform
    console.log('ActivityCard requires transform');
} catch (e) {
    // Expected
}
