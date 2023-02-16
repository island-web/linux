const day = require('date-and-time');
const db = require("croxydb")
const mysql = require('mysql2');
const host = 'https://infiniti-pro.com/';
const https = require('https');
const colors = require('colors');

let connection = mysql.createConnection({
    host: 'infiniti-pro.com',
    user: 'u_adv_infini',
    database: 'adv_infinity',
    password: 'nBAw8R03mKti'
});

let connection_adv = mysql.createConnection({
    host: 'infiniti-pro.com',
    user: 'u_adv_infini',
    database: 'adv_infinity',
    password: 'nBAw8R03mKti'
});

let today = day.format(new Date(), 'YYYY/MM/DD');
  

connection.query(`SELECT id_program FROM stations_program WHERE id_station = ${db.get("id")}`,
    function (err, results) {
        if (err) {
            if (process.send) {
                process.send('ERROR CONNECTION TO [ DATA_ADV ], SERVER DOWN');
            }
        }
        else {
            db.delete('adv');
            results.forEach(ad => {
                connection_adv.query(`SELECT * FROM adv_program WHERE id_program = ${ad.id_program}`,
                    function (err, results_adv) {
                        if (err) {
                            if (process.send) {
                                process.send('ERROR CONNECTION TO [ DATA_ADV ], SERVER DOWN');
                            }
                        }
                        else {
                            results_adv.forEach(r_ad => {
                                if (day.format(r_ad.date_stop, 'YYYY/MM/DD') >= today) {
                                    db.push('adv', r_ad);
                                }
                            });
                        }
                    });
            });
            connection_adv.end();

            if (process.send) {
                process.send('');
            }
        }
    });
connection.end();
