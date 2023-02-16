const mysql = require('mysql2');
const db = require('croxydb');

const connection = mysql.createConnection({
    host: 'infiniti-pro.com',
    user: 'u_global_inf',
    database: 'global_infiniti',
    password: 'Pf1vUdyO'
})

connection.query(`SELECT id_program FROM stations_program WHERE id_station=${db.get("id")}`,
function (err, results) { 
    if(err){
        if (process.send) {
            process.send('ERROR CONNECTION TO [DATA PLAYLIST], SERVER DOWN');
        }    
    }
    else{
        if(process.send){
            process.send(results);
            db.set("id_program_music", results[0].id_program);
        }    
    }
});
connection.end();

