const db = require("croxydb")
const mysql = require('mysql2');

let add_shad = mysql.createConnection({
    host: 'infiniti-pro.com',
    user: 'u_stations_lj',
    database: 'stations_list_infiniti',
    password: 'fpCB4MZ5'
})

sql = `SELECT * FROM additional_schedule WHERE id_station=${db.get("id")}`;
add_shad.query(sql, function (err, results) {
    if(err){
        if (process.send) {
            process.send('ERROR CONNECTION TO [ADDITIONAL_SCHEDULE], SERVER DOWN');
        }    
    }
    else{
        if (results.length != 0) {
            if(process.send) {
                process.send(results);
                db.set("additional_schedule", results);
            }
        }    
    }
})
add_shad.end();
