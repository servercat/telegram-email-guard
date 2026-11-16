import {spawnSync} from 'node:child_process';import {writeFileSync} from 'node:fs';import {pathToFileURL} from 'node:url';
const result=spawnSync('.cache/moli/moli.exe',['fetch','--layout','--dump','screenshot_full','http://127.0.0.1:5173/docs/design/guide-bilingual.html'],{maxBuffer:10000000});if(result.status!==0)throw Error(result.stderr.toString());writeFileSync('public/guide.png',result.stdout);console.log('Bilingual guide rendered:',result.stdout.length);

