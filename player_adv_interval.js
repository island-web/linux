const db = require("croxydb");
const fork = require('child_process').fork;
const date = require('date-and-time');
const killProcess = require('kill-process-by-name');
const fs = require('fs');
const colors = require('colors');

setTimeout(() => {

    let in_additional = [];
    let arr = db.get('adv_interval')
    if ((typeof arr) == 'object') {
        arr.forEach(obj => {

            let push_play = [];
            let dur = 0;

            if (!in_additional.includes(obj[1].list_adv[0]['id_string'])) {

                in_additional.push(obj[1].list_adv[0]['id_string']);
                let play_list = [obj[1].list_adv[0]];

                arr.forEach(add_obj => {
                    if (add_obj[0].interval == obj[0].interval && !in_additional.includes(add_obj[1].list_adv[0]['id_string'])) {
                        in_additional.push(add_obj[1].list_adv[0]['id_string']);
                        play_list.push(add_obj[1].list_adv[0]);
                    }
                })
                console.log(colors.underline.bgBlack(`[ interval - ${obj[0].interval} ] :`));
                play_list.forEach(adv => {
                    console.log(colors.underline.bgBlue(`[${adv.name_adv} ===> ${adv.time_start} - ${adv.time_stop}]`));
                    if (adv.time_stop > date.format(new Date(), 'HH:mm:ss') && adv.time_start <= date.format(new Date(), 'HH:mm:ss')) {

                        push_play.push(adv.name_adv);
                        dur += adv.duration;
                    }
                });
                setInterval(function () {
                    let f = false;

                    play_list.forEach(adv => {
                        if (adv.time_stop > date.format(new Date(), 'HH:mm:ss') && adv.time_start <= date.format(new Date(), 'HH:mm:ss') && !push_play.includes(adv.name_adv)) {
                            f = true;
                            process.send('RESTART');
                        } else if (adv.time_stop < date.format(new Date(), 'HH:mm:ss') && push_play.includes(adv.name_adv)) {
                            f = true;
                            process.send('RESTART'); process.exit();
                        }
                    })


                    if (!f && push_play.length > 0) {
                        process.send([push_play, dur]);
                        console.log(push_play);
                    }
                }, dur * 1000 + obj[0].interval * 60000)
            }
        });
    }


}, 2000)
