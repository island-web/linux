//Функция проверки наличия файла
const db = require('croxydb');
const host = 'https://infiniti-pro.com/';
const https = require('https');
const fs = require('fs');
const shell = require('shelljs');

//****************************************************************************************************** */
//****************************************************************************************************** */
let count_songs_download = 0;
let songs;
function checkFile(name, path) {
    let flag = true;
    try {
        fs.accessSync(path + name, fs.F_OK);
    } catch (e) {
        flag = false;
    }
    return flag;
}

if(db.get('initialization') == 2) {
    songs = [];
    db.get('music_my_playlist').forEach(element => {
        if(!checkFile(`${element['artist']}-${element['name_song']}.mp3`, `music/`)){
            songs.push(`${element['artist']}-${element['name_song']}.mp3`);
        }
    });
}else{
    songs = db.get(`buffer_download`);
}

const download = (url, path, name) => {
    console.log(`START_DOWNLOAD ========== > ${songs[count_songs_download]}`)
    url = encodeURI(url);
    https.get(url, (res) => {
        const stream = fs.createWriteStream(path);
        res.pipe(stream);
        stream.on('finish', () => {
            stream.close();
            console.log(`END_DOWNLOAD ========== > ${songs[count_songs_download]}`)
            count_songs_download++;
            if (count_songs_download < songs.length) {
                download(`${host}/music/${songs[count_songs_download]}`, `music/${songs[count_songs_download]}`)
            }else{
                if(db.get('initialization') == 2) { 
                    db.set("initialization", "3"); 
                    shell.exec('sudo reboot');
                }else{ 
                    db.delete(`buffer_download`);
                }
                if (process.send) { process.send(`END_DOWNLOAD_SONGS`) }
            }
        });
    }).on('error', (err) => {
        console.log(err);
    });
};

download(`${host}/music/${songs[count_songs_download]}`, `music/${songs[count_songs_download]}`)
