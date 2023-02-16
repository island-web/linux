const fs = require('fs');
const mysql = require('mysql2');
const https = require('https');
const db = require("croxydb");
const colors = require('colors');
const date = require('date-and-time');
let station = db.get('data_station');

module.exports.send_log = function (message, id_song, status, current_time, type = null) {
    let connection = mysql.createConnection({
        host: 'infiniti-pro.com',
        user: 'u_logs_for_sr',
        database: 'logs_for_station_infiniti',
        password: 'qSMrdZhK'
    });
    
    let data = [message, id_song, status];
    connection.query(`INSERT INTO ${station[0].login_station} set date=CURRENT_DATE(), time=CURRENT_TIME(), info=?, id_song=?, status=?`,
    data, function (err) { if(err) console.log(colors.red(` ERROR_CONNECT_DB_LOGS_STR_25 ========> ${err}`)) });
    if(type == null) console.log(colors.green(`LOG_SEND: [ ${date.format(new Date(), "YYYY/MM/DD HH:mm:ss")} ] --- [${message}]`));
    else if (type == 'adv') console.log(colors.cyan(`LOG_SEND: [ ${date.format(new Date(), "YYYY/MM/DD HH:mm:ss")} ] --- [${message}]`));
    else if (type == 'error') console.log(colors.rainbow(`LOG_SEND: [ ${date.format(new Date(), "YYYY/MM/DD HH:mm:ss")} ] --- [${message}]`));
    connection.end();
}

module.exports.send_status = function () {
    let connection_online = mysql.createConnection({
        host: 'infiniti-pro.com',
        user: 'u_stations_lj',
        database: 'stations_list_infiniti',
        password: 'fpCB4MZ5'
    });
    
    connection_online.query(`UPDATE station set online_time=CURRENT_TIME(), version='22.0.4' WHERE id_station=${station[0].id_station}`,
        function (err) { 
            if(err) console.log(` ERROR_CONNECT_DB_LOGS_STR_30 ========> ${err}`);

        })
    connection_online.query(`UPDATE station set online_date=CURRENT_DATE() WHERE id_station=${station[0].id_station}`,
        function (err) { if(err) console.log(` ERROR_CONNECT_DB_LOGS_STR_32 ========> ${err}`) })
    connection_online.end();
    //console.log(colors.green('STATUS_ONLINE_STATION_SEND_TO_SERVER'));
}
