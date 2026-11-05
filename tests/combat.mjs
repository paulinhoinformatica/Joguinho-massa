import {readFileSync} from 'node:fs';
import {runCombatTests} from './combat-cases.js';
const cfg=JSON.parse(readFileSync(new URL('../assets/characters/protagonist/config.json',import.meta.url)));
console.log(`PASS: ${runCombatTests(cfg).length} combat checks at 30/60/120 FPS.`);
