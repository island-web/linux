
const AutoGitUpdate = require('auto-git-update');

const config = {
  repository: 'https://github.com/island-web/island-web',
  fromReleases: true,
  tempLocation: '/tmp/'
}
const updater = new AutoGitUpdate(config);
updater.autoUpdate();


const fs = require('fs');
const pm2 = require('pm2');
const shell = require('shelljs');
const db = require('croxydb');
const fork = require('child_process').fork;
const host = 'https://infiniti-pro.com/';
const killProcess = require('kill-process-by-name');

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

//INITIALIZATION////////////////////////////////////////////////
(db.get("initialization") != 3) ? child_file_start = 'start' : child_file_start = 'work_modules';
const child = fork(child_file_start)
child.on('message', message => {
  command(message);
})
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

//EVENTS WORK PROCESS//////////////////////////////////////////
function command(mes) {
  switch (mes) {

    //******EVENT DOWNLOAD CONTENT*********************************    
    case `DOWNLOAD_SONGS`:
      const child_download_songs = fork(`download_songs`);
      child_download_songs.on('message', m => {
        console.log(m);
        setTimeout(function () { 
          killProcess('mpg321');
          fs.writeFileSync(`server/logs.js`, `//RESTART STATION\n`, { flag: 'a+' });
        }, 10000)
      })
    break;  

    case `UPDATE_SONGS`:
      const child_update_songs = fork(`get_songs_playlist`);
      const child_update_songs_sp = fork(`get_songs_speciallist`);
      child_update_songs.on('message', mpl => { 
        child_update_songs_sp.on('message', mspl => { 
          console.log(mspl); 
          setTimeout(function () { killProcess('mpg321'); fs.writeFileSync(`server/logs.js`, `//RESTART STATION\n`, { flag: 'a' }); }, 10000);
        })  
      })
    break;  

    case `DOWNLOAD_ADV`:
      const child_download_adv = fork(`download_adv`);
      child_download_adv.on('message', m => {
        console.log(m);
        setTimeout(function () {
          killProcess('mpg321');
          fs.writeFileSync(`server/logs.js`, `//RESTART STATION\n`, { flag: 'a' });
        },
          10000)
      })
    break;


    case `START_WORK_STATION`:

      const child_start_play = fork(`player`);
      child_start_play.on('message', m => {
        console.log(m);
      })

      const child_get_adv = fork(`get_adv`);
      child_get_adv.on('message', m => {
        console.log(m);
      })

      break;


    case `INITIALIZATION_FINISH`:

      setTimeout(function () {
        db.set("initialization", "2");
        process.exit()
      },
        10000)
      break;


    case `INITIALIZATION_NEXT_STEP`:
      setTimeout(function () {
        db.set("initialization", "1");
        fs.writeFileSync(`server/logs.js`, `//RESTART STATION\n`, { flag: 'a+' });
      }, 10000)
      break;

  }
}
//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////