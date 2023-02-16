const fs = require('fs');
const md5 = require('md5');
const db = require("croxydb");
const date = require('date-and-time');
const mysql = require('mysql2');
const host = 'https://infiniti-pro.com/';
const https = require('https');
const send_info_to_server = require('./logs.js');
const make = require('./func.js');
const { Console } = require('console');
let now_full_day = date.format(new Date(), 'YYYY/MM/DD HH:mm:ss');


let today = date.format(new Date(), 'YYYY/MM/DD');
let now_time = date.format(new Date(), 'HH:mm:ss');

sortAdv();
make.delete_old_adv();
make.get_new_data();
let data_station = db.get("data_station")[0];

//****************************************************************************************************** */
//****************************************************************************************************** */
let status = 0;
if (now_time > data_station.start_work && now_time < data_station.stop_work && db.get("initialization") > 2) {

    status = 1;

    setInterval(() => {
        
        if (db.get('update_playlist') == 2) process.send('UPDATE_SONGS');
        checkAudioForDownload(db.get('adv'), 'adv/');
        checkAudioForDownload(db.get('music_my_playlist'), 'music/');
        sortAdv();
        make.get_new_data();

    }, 60000);

    
    setTimeout(() => { send_info_to_server.send_log(`START_WORK_STATION`, 0, `work`, now_full_day);}, 1000)
    setTimeout(() => { process.send(`START_WORK_STATION`) }, 3000)
    

} else {
    status = 0;
    console.log(`SLEEP STATION - ${data_station.name_station}`);
}
//****************************************************************************************************** */
//****************************************************************************************************** */

//CHECK TIME START AND STOP WORK************************************************************************ */
setInterval(function () {
    if (date.format(new Date(), 'HH:mm:ss') == data_station.start_work) {
        sortAdv();
        make.delete_old_adv();
        make.get_new_data();
        killProcess('node');
    }else if(date.format(new Date(), 'HH:mm:ss') == data_station.stop_work){
        killProcess('mpg321');
        killProcess('node');
    }
    if(status == 0) { make.get_new_data(); }
}, 1000)
//****************************************************************************************************** */
//****************************************************************************************************** */
//if(db.get('status_work_day') == false) { make.get_new_data(); }
//EVENT ADD NEW MODULES  
const buttonPressesLogFile = 'server/modules.js';
let md5Previous = null;
let fsWait = false;
fs.watch(buttonPressesLogFile, (event, filename) => {
    if (filename) {
        if (fsWait) return;
        fsWait = setTimeout(() => { fsWait = false; }, 100);
        const md5Current = md5(fs.readFileSync(buttonPressesLogFile));
        if (md5Current === md5Previous) { return; }
        md5Previous = md5Current;
        if (process.send) { process.send(`NEW_MODULES`) }
    }
});
//*********************************************************** */
//********************************************************** */

//DOWNLOAD SONGS AFTER START STATION
function checkFile(name, path) {
    let flag = true;
    try {
        fs.accessSync(path + name, fs.F_OK);
    } catch (e) {
        flag = false;
    }
    return flag;
}

function checkAudioForDownload(arr, path) {

    let buff;
    let func;
    let name;
    if(arr){
        (arr).forEach(el => {

           
           
           
    
                if (path == 'adv/') { name = el.name_adv; buff = 'buffer_download_adv'; func = 'DOWNLOAD_ADV'; }
                else { name = `${el['artist']}-${el['name_song']}.mp3`; buff = 'buffer_download'; func = 'DOWNLOAD_SONGS'; }
    
                if (!checkFile(name, path)) db.push(buff, name);
            
        });
    
        if (db.get(buff)) { console.log(func); process.send(func) }
    
    }

}

//****************************************************************************************************** */
//****************************************************************************************************** */
function sortAdv() {
    if (db.get('adv')) {

        db.set('adv_interval', []);
        db.set('adv_fixed', []);
        db.get('adv').forEach(element => {
            if (today >= date.format(new Date(element.date_start), 'YYYY/MM/DD') && today <= date.format(new Date(element.date_stop), 'YYYY/MM/DD')) {
                if (element.type == 'fix') {
                    db.push('adv_fixed', element);
                }
                else if (element.type == 'interval_t') {
                    db.push('adv_interval', [{ interval: element.interval_t }, { list_adv: [element] }]);
                }
            }
        });
    }
}

