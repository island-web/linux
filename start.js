const db = require('croxydb');
const fork = require('child_process').fork;
const fs = require('fs');
const https = require('https');
const host = 'https://infiniti-pro.com/';

//GET FIRST DATA /////////////////////////////////////////////
if (db.get("initialization") == 0) {
  
  const child_data_file = 'data_station';
  const child_data_station = fork(child_data_file);
  child_data_station.on('message', message => {
    console.log(message);
    if(message != 'ERROR CONNECTION TO [DATA_STATION], SERVER DOWN'){
      console.log(`SAVE DATA STATION FOR ${message[0]['name_station']}. CHECK ID PROGRAM PLAYLISTS...`)
      if(process.send){
        process.send('INITIALIZATION_NEXT_STEP');
      }
    }
  })
  const child_playlist_file = 'data_playlist';
  const child_data_playlist = fork(child_playlist_file);
  child_data_playlist.on('message', message => {
    console.log(message);
    if(message != 'ERROR CONNECTION TO [DATA PLAYLIST], SERVER DOWN'){console.log(`SAVE ID PROGRAM PLAYLISTS ...`)}
  })
  
} else if (db.get("initialization") == 1) {
  //GET PLAYLIST ////////////////////////////////////////////
  const child_get_playlist_file = 'get_playlists';
  const child_data_allplaylist = fork(child_get_playlist_file);
  child_data_allplaylist.on('message', message => {
    console.log(message);
    const get_songs_file = 'get_songs_playlist';
    const child_songs_playlist = fork(get_songs_file);
    child_songs_playlist.on('message', message => {
      console.log(message);
    })  
  })
  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////

  //GET ALL ADV /////////////////////////////////////////////////
  const child_get_adv_file = 'get_adv';
  const child_data_adv = fork(child_get_adv_file);
  child_data_adv.on('message', message => {
    console.log(message);
  })
  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////

  //GET ADDITIONAL SHADEL ///////////////////////////////////////

  const child_get_addshad_file = 'get_addshad';
  const child_data_addshad = fork(child_get_addshad_file);
  child_data_addshad.on('message', message => {
    console.log(message);
  })
  ///////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////
  if(process.send){
    process.send('INITIALIZATION_FINISH');
  }
} else if (db.get("initialization") == 2) {
  if(process.send){ process.send('DOWNLOAD_SONGS'); }
}
