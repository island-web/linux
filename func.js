const fs = require('fs');
const mysql = require('mysql2');
const https = require('https');
const db = require("croxydb");
const colors = require('colors');
const date = require('date-and-time');
let station = db.get('data_station');
const killProcess = require('kill-process-by-name');
const send_info_to_server = require('./logs.js');
const fork = require('child_process').fork;

module.exports.delete_old_adv = function () {
    if (db.get('adv')) {
        fs.readdir(`adv/`, (err, files) => {
            files.forEach(file => {
                let flag = 0;
                db.get('adv').forEach(el => {
                    if (el.name_adv == file) {
                        flag = 1;
                    }
                })
                if (flag !== 1 && file !== '.DS_Store') {
                    fs.unlinkSync(`adv/${file}`);
                    send_info_to_server.send_log(`DELETE_OLD_ADV - ${file}`, 0, `song`);
                }
            });
        });
    }
}

module.exports.get_new_data = function () {
    if(station[0].update_adv == 1){
        setTimeout(function () { fs.writeFileSync(`server/logs.js`, `//RESTART STATION\n`, { flag: 'a' }); }, 10000 )
    }
    
    const connection_station_data = mysql.createConnection({
        host: 'infiniti-pro.com',
        user: 'u_stations_lj',
        database: 'stations_list_infiniti',
        password: 'fpCB4MZ5'
    })


    const COLLUMS = ['update_playlist', 'update_adv', 'updata_additional', 'updata_settings'];

    connection_station_data.query(`SELECT * FROM station WHERE id_station=${db.get("id")}`,
        function (err, results) {
            
            if (err) {
                send_info_to_server.send_log(`CONNECT_DATABASE_ERROR: =====> `, 0, 'error', date.format(new Date(), 'YYYY/MM/DD HH:mm:ss'), 'error');
            }
            if(results){
                let f = false;
                db.set('data_station', results);
                COLLUMS.forEach(element => {
                    if (results[0][element] == 1) {
                        f = true;
                        send_info_to_server.send_log(`NEW_DATA_FROM_SERVER [ ${element} ]`, 0, 'work', date.format(new Date(), 'YYYY/MM/DD HH:mm:ss'), 'adv');
                        reset(element, db.get("id"));
                    }
                })
                if(f) {
                    setTimeout(function () {
                        killProcess('mpg321');
                        fs.writeFileSync(`server/logs.js`, `//RESTART STATION\n`, { flag: 'a' });
                    },10000)}
            }
        });
    connection_station_data.end();
}

function reset(col, id_station, val = 0) {
    let connection_reset = mysql.createConnection({ host: 'infiniti-pro.com', user: 'u_stations_lj', database: 'stations_list_infiniti', password: 'fpCB4MZ5'});
    connection_reset.query(`UPDATE station set ${col} = ${val} WHERE id_station=${id_station}`,function (err) {});

    if(db.get('update_playlist') == 1){ 
        db.set('update_playlist', 2); 
        const child_update_playlist = fork('get_playlists');
        child_update_playlist.on('message', message => { console.log(message) }) 
    }
}