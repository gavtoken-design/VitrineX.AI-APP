import * as pkg from '@google/genai';
if (pkg.Models) {
    console.log('pkg.Models keys:', Object.keys(pkg.Models));
} else {
    console.log('pkg.Models is undefined');
}
