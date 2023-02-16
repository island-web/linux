//Функция проверки наличия файла
const db = require('croxydb');
const host = 'https://infiniti-pro.com/';
const https = require('https');
const fs = require('fs');
//****************************************************************************************************** */
//****************************************************************************************************** */
let count_adv_download = 0;
let adv;

if(db.get('initialization') == 2) {
    adv = [];
    db.get('adv').forEach(element => {
        adv.push(`${element['name']}.mp3`);
    });
}else{
    adv = db.get(`buffer_download_adv`);
}

const download_adv = (url, path) => {
    console.log(`START_DOWNLOAD ========== > ${adv[count_adv_download]}`)
    url = encodeURI(url);
    https.get(url, (res) => {
        const stream = fs.createWriteStream(path);
        res.pipe(stream);
        stream.on('finish', () => {
            stream.close();
            console.log(`END_DOWNLOAD ========== > ${adv[count_adv_download]}`)
            count_adv_download++;
            if (count_adv_download < adv.length) {
                download_adv(`${host}/adv/${adv[count_adv_download]}`, `adv/${adv[count_adv_download]}`)
            }else{
                (db.get('initialization') == 2) ? db.set("initialization", "3") : db.delete(`buffer_download_adv`);
                if (process.send) { process.send(`END_DOWNLOAD_ADV`) }
            }
        });
    }).on('error', (err) => {
        console.log(err);
    });
};

download_adv(`${host}/adv/${adv[count_adv_download]}`, `adv/${adv[count_adv_download]}`)
