import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('../src/config.js',import.meta.url),'utf8');
for(const marker of ['ShopTest','Products','Guest checkout','submitLabel']) if(!source.includes(marker)) throw new Error(`Missing smoke marker: ${marker}`);
console.log('ShopTest smoke checks passed');
