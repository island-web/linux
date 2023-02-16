const db = require("croxydb");
const fork = require('child_process').fork;
const date = require('date-and-time');
const colors = require('colors');

let play_now
let arr = db.get('adv_fixed')
if ((typeof arr) == 'object') {
    fixed_interval = setInterval(() => {

        arr.forEach(obj => {


            if (date.format(new Date(), 'HH:mm') == obj.fix.slice(0, 5) && obj.id_string != play_now) {
                play_now = obj.id_string;
                process.send(obj); process.exit();
            }
        });

    }, 1000);
}
