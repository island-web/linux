const shell = require('shelljs');
const fs = require('fs');
const db = require("croxydb");


shell.rm('-rf', '/home/pi/Desktop/TMM_RASPBERRY/tmm.zip');
shell.rm('-rf', '/home/pi/Desktop/install-raspberry');


shell.exec('sudo npx pm2 start /home/pi/Desktop/TMM_RASPBERRY/ecosystem.config.js')
shell.exec('sudo npx pm2 startup');
shell.exec('sudo npx pm2 save');
setInterval(() => {
    console.log('WAIT !!! NOW_DOWNLOAD_SONGS !!! IN_TERMINAL_NO_LOGS !!! ');
}, 10000);
