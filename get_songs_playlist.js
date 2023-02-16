const mysql = require('mysql2');
const db = require('croxydb');

const connection = mysql.createConnection({
    host: 'infiniti-pro.com',
    user: 'u_global_inf',
    database: 'global_infiniti',
    password: 'Pf1vUdyO'
})

if((db.get("playlist")).length != 0){
    db.set(`music_my_playlist`, `[]`);
    db.get("playlist").forEach(el => {
        sql = `SELECT * FROM music_for_pl WHERE id_playlist = ${el.id_playlist}`;
        connection.query(sql, function(err, results){
            if(err){
                if (process.send) {
                    process.send('ERROR CONNECTION TO [DATA_PLAYLIST], SERVER DOWN');
                }    
            }
            else{
                results.forEach(song =>{
                    db.push(`music_my_playlist`, song);
                })
            }
        })
    })
    if(process.send){
        process.send(`MUSIC_PLAYLIST_UDATE_OK`);
    }
}