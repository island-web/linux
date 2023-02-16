const db = require("croxydb")
const mysql = require('mysql2');

let connection = mysql.createConnection({ host: 'infiniti-pro.com', user: 'u_global_inf', database: 'global_infiniti', password: 'Pf1vUdyO' })

    sql = `SELECT * FROM playlist_for_program WHERE id_program=${db.get("id_program_music")}`;
    connection.query(sql, function (err, results) {
        if(err){ process.send('ERROR CONNECTION TO [DATA_PLAYLIST], SERVER DOWN'); }    
        else{ db.set("playlist", results); }
    });
    
    sql = `SELECT * FROM speciallist_for_program WHERE id_program=${db.get("id_program_music")}`;
    connection.query(sql, function (err, results) {
        if(err){ process.send('ERROR CONNECTION TO [DATA_SPECIALLIST], SERVER DOWN'); }    
        else{ db.set("speciallist", results); }
    });

    process.send('UPDATE_ALL_PLAYLISTS');

connection.end();