const fs = require('node:fs');
const assert = require('node:assert/strict');

const read = path => fs.readFileSync(path, 'utf8');
const game = read('js/steering-game.js');
const css = read('css/steering-game.css');
const page = read('speelhal/autospel.html');
const hall = read('speelhal.html');
const track = read('js/mijn-spoor.js');
const shell = read('js/site-shell.js');

['reflex', 'relationRadar', 'compass', 'storyMaker'].forEach(id => assert.match(game, new RegExp(`${id}:\\{id:'${id}'`)));
['driver', 'front', 'back', 'outside'].forEach(id => assert.match(game, new RegExp(`${id}:\\{id:'${id}'`)));
['crossroads', 'voices', 'cargo', 'positions', 'council', 'trial', 'report'].forEach(id => assert.match(game, new RegExp(`\\b${id}\\b`)));

assert.match(game, /currentPosition:''.*,trialPosition:''/);
assert.match(game, /clearVoiceDependencies/);
assert.match(game, /recognized\.has\(raw\.loudestVoice\)/);
assert.match(game, /renderCarLayout\(\{positions,mode,title\}\)/);
assert.match(game, /onwijze-steering-game-v1/);
assert.match(game, /LEGACY_KEY = 'quizkast-progress-v1'/);
assert.doesNotMatch(game, /removeItem\(LEGACY_KEY\)/);
assert.doesNotMatch(game, /console\.(?:log|debug|info)/);
assert.doesNotMatch(game, /analytics/i);
assert.match(game, /Geen score, diagnose of persoonlijkheidsprofiel/);

assert.match(page, /data-steering-app/);
assert.match(page, /data-game-scene/);
assert.match(page, /steering-game\.css\?v=1/);
assert.match(page, /steering-game\.js\?v=3/);
assert.match(hall, /href="speelhal\/autospel\.html"/);
assert.match(track, /onwijze-steering-game-v1/);
assert.match(shell, /onwijze-steering-game-v1/);

assert.match(css, /@media\(max-width:760px\)/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
assert.match(css, /focus-visible/);
assert.match(css, /overflow-wrap:anywhere/);
assert.match(css, /\.result-car-comparison/);

console.log('Autospel smoke checks: OK');
