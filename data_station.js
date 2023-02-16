const mysql = require('mysql2');
const db = require('croxydb');

const connection = mysql.createConnection({
    host: 'infiniti-pro.com',
    user: 'u_stations_lj',
    database: 'stations_list_infiniti',
    password: 'fpCB4MZ5'
})

connection.query(`SELECT * FROM station WHERE id_station=${db.get("id")}`,
    function (err, results) {
        if(err){
            if (process.send) {
                process.send('ERROR CONNECTION TO [DATA_STATION], SERVER DOWN');
            }    
        }
        else{
            if (process.send) {
                db.set("data_station", results);
                process.send(results);
            }    
        }
    });
connection.end();
