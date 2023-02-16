const db = require("croxydb");
const fs = require('fs');
const date = require('date-and-time');
const mpg321 = require('mpg321');
const send_info_to_server = require('./logs.js');
const fork = require('child_process').fork;
const colors = require('colors');
let now = date.format(new Date(), 'YYYY/MM/DD HH:mm:ss');
const killProcess = require('kill-process-by-name');
const { time } = require("console");
const child_interval = fork('player_adv_interval');
const child_fixed = fork('player_fixed');

//let now_full_day = date.format(new Date(), 'YYYY/MM/DD HH:mm:ss');
let volume_song = 70;
let flag_play_adv = false;
let buffer_for_wait = [];
let OS = process.platform;
console.log(OS)

///PLAYERS///////////////////////////////////////////////////////////////////
/**FOR_SONG */
let count_list_songs = 0;
let player_songs = mpg321().remote();
player_songs.gain(volume_song);
/**FOR_INTERVAL */
let player_interval = mpg321().remote();
/**FOR_FIX */
let player_fixed = mpg321().remote();
/////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////

///PLAY_INTERVAL_ADV///////////////////////////////////////////////////////////////////
function start_interval(list_adv) {
    list_adv = list_adv[0];
    let count = 0;

    send_info_to_server.send_status();
    send_info_to_server.send_log(`START_PLAY_INTERVAL_ADV ===> ${list_adv[count]}`, 0, 'play', now, 'adv');
    player_interval.play(`adv/${list_adv[count]}`);
    player_interval.on('end', function () {
        count++;
        if (count == list_adv.length) {
            if (buffer_for_wait.length == 0) {

                flag_play_adv = false;
                volume_song = 70;
                player_songs.gain(volume_song);
                player_songs.play(`music/${list_music[count_list_songs]}`)
                send_info_to_server.send_log(`END_PAUSE_PLAY_SONG ===>  ${list_music[count_list_songs]} `, 0, 'play', date.format(new Date(), 'YYYY/MM/DD HH:mm:ss'));
            }
            else {
                let temp = buffer_for_wait;
                start_interval(temp);
                buffer_for_wait = [];
            }
        } else if (count < list_adv.length) {
            send_info_to_server.send_status();
            send_info_to_server.send_log(`START_PLAY_INTERVAL_ADV ===> ${list_adv[count]}`, 0, 'play', now, 'adv');
            player_interval.play(`adv/${list_adv[count]}`);
        }
    })
}
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

///CHECK_TIME_FIX_ADV//////////////////////////////////////////////////////
function check_time_fix_adv(all_duration) {
    let f = true;
    let start_interval = new Date();
    let end_interval = new Date(start_interval.getTime() + all_duration * 1000);

    if (db.get('adv_fixed')) {
        db.get('adv_fixed').forEach(obj => {
            if (date.format(start_interval, 'HH:mm:ss') <= obj.fix && date.format(end_interval, 'HH:mm:ss') >= obj.fix) {
                f = false;
                console.log(f);
            }
        });
    }
    return f;
}
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////


///SORT////////////////////////////////////////////////////////////////////
function shuffle(arr) {
    var j, temp;
    for (var i = arr.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        temp = arr[j];
        arr[j] = arr[i];
        arr[i] = temp;
    }
    return arr;
}
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

let list_music = [];

(db.get("music_my_playlist")).forEach(song => {
    if (song['artist'] && song['name_song'] != '') {
        list_music.push(`${song['artist']}-${song['name_song']}.mp3`);
    }
});

list_music = shuffle(list_music);


send_info_to_server.send_status();
send_info_to_server.send_log(`START_PLAY_SONG ===> ${list_music[count_list_songs]} `, 0, 'play', date.format(new Date(), 'YYYY/MM/DD HH:mm:ss'));
player_songs.play(`music/${list_music[count_list_songs]}`)



player_songs.on('end', function () {
    count_list_songs++;
    if (count_list_songs == list_music.length) {
        count_list_songs = 0;
        list_music = shuffle(list_music);
    }

    send_info_to_server.send_status();
    send_info_to_server.send_log(`START_PLAY_SONG ===>  ${list_music[count_list_songs]} `, 0, 'play', date.format(new Date(), 'YYYY/MM/DD HH:mm:ss'));
    player_songs.play(`music/${list_music[count_list_songs]}`);
});

player_songs.on('error', function (e) {
    send_info_to_server.send_log(`PLAYER_PLAY_ERROR: =====> ${e}`, 0, 'error', date.format(new Date(), 'YYYY/MM/DD HH:mm:ss'), 'error');
    send_info_to_server.send_status();
    console.log(`PLAYER_PLAY_ERROR: ${e}`);
    setTimeout(function () {
        killProcess('mpg321');
        killProcess('node');
    }, 5000)
})


child_interval.on('message', message => {
    if (message == 'RESTART') {
        let pause_interval = setInterval(function () {
            volume_song -= 5;
            player_songs.gain(volume_song);
            if (volume_song == 0) {
                killProcess('mpg321');
                fs.writeFileSync(`server/logs.js`, `//RESTART STATION\n`, { flag: 'a' });
            }
        }, 500);
    } else if (flag_play_adv || !check_time_fix_adv(message[1])) {
        buffer_for_wait = buffer_for_wait.concat(message);
    } else {
        flag_play_adv = true;
        let pause_interval = setInterval(function () {
            volume_song -= 5;
            player_songs.gain(volume_song);
            if (volume_song == 0) {
                player_songs.pause();
                start_interval(message);
                clearInterval(pause_interval);
            }
        }, 500);
    }
})

child_fixed.on('message', message => {
    flag_play_adv = true;

    let pause_interval = setInterval(function () {
        volume_song -= 5;
        player_songs.gain(volume_song);
        if (volume_song == 0) {
            player_songs.pause();
            player_fixed.gain(message.volume);
            player_fixed.play(`adv/${message.name_adv}`);
            send_info_to_server.send_log(`START_PLAY_FIXED_ADV ===> ${message.name_adv}`, 0, 'play', now, 'adv');
            send_info_to_server.send_status();
            clearInterval(pause_interval);
        }
    }, 500);

    player_fixed.on('end', function () {
        if (buffer_for_wait.length == 0) {
            flag_play_adv = false;
            volume_song = 70;
            player_songs.gain(volume_song);
            player_songs.play(`music/${list_music[count_list_songs]}`)
            send_info_to_server.send_log(`END_PAUSE_PLAY_SONG ===>  ${list_music[count_list_songs]} `, 0, 'play', date.format(new Date(), 'YYYY/MM/DD HH:mm:ss'));

        } else {
            let temp = buffer_for_wait;
            start_interval(temp);
            buffer_for_wait = [];
        }
    })

})