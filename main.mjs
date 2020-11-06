#!/usr/bin/env node

import axios from 'axios';
import { config } from 'dotenv';
import { join } from 'path';
import { createWriteStream } from 'fs';
import youtubedl from 'youtube-dl';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

config();

const args = yargs(hideBin(process.argv)).argv;

const broadcasterName = args.broadcaster || process.env.BROADCASTER;
const twitchAuth = args.auth || process.env.TWITCH_AUTH;
const clientId = args.clientId || process.env.TWITCH_CLIENT_ID;
const maxDownloads = args.max || 3;
const clipsCount = args.clips || args.count || 10;

if (args.help) {
    printUsage();
}

if (!broadcasterName || !twitchAuth || !clientId) {
    printUsage();
}

function printUsage() {
    console.log('Usage: ');
    console.log('--help | Display this page');
    console.log('--broadcaster | Specify Broadcaster username');
    console.log('--auth | Twitch OAuth token (https://twitchtokengenerator.com)');
    console.log('--clientId | Twitch ClientId (https://twitchtokengenerator.com)');
    console.log('--max | Max amount of parallel downloads (Default: 3)');
    console.log('--count | Amount of clips to be downloaded (Default: 10) (Max: 100)');
    process.exit(0);
}

if (clipsCount > 100 || clipsCount < 0) {
    console.err('Count can only be 1-100');
    process.exit(-1);
}

const data = await axios.get(`https://api.twitch.tv/helix/users?login=${broadcasterName}`, {
    headers: {
        'Authorization': `Bearer ${twitchAuth}`,
        'Client-Id': clientId
    }
});
const broadcaster = data.data.data[0];


console.log('Using broadcaster with id: ' + broadcaster.id);
console.log('Broadcaster Status: ' + (broadcaster.broadcaster_type || 'none'));
console.log('Broadcaster Display Name: ' + broadcaster.display_name);

const clipsResponse = await axios.get(`https://api.twitch.tv/helix/clips?broadcaster_id=${broadcaster.id}&first=${clipsCount}`, {
    headers: {
        'Authorization': `Bearer ${twitchAuth}`,
        'Client-Id': clientId
    }
});

const clips = clipsResponse.data.data;

console.log(`Downloading ${clips.length} Clips!`);
let downloads = 0;

for (let clip of clips) {
    try {
        await downloadClip(clip);
    } catch (error) {
        console.error(error);
    }
}
function downloadClip(clip) {
    return new Promise(async (resolve, reject) => {

            try {
                const video = youtubedl(clip.url, [],
                    {
                        cwd: join('./', 'videos')
                    }
                );
                downloads++;
                video.on('info', (info) => {
                    console.log(`Starting download of "${clip.title}"`);
                });
                video.on('end', () => {
                    console.log(`Finished download of "${clip.title}"`);
                    downloads--;
                    resolve();
                });
                video.on('complete', () => {
                    console.log(`Clip "${clip.title}" has already been downloaded!`);
                    downloads--;
                });

                const filename = (clip.title + '_' + clip.id + '.mp4').replace(/[/\\?%*:|"<>]/g, '');
                video.pipe(createWriteStream(join('./', 'videos', filename)));

                if (downloads < maxDownloads) {
                    resolve();
                }
            } catch (err) {
                console.error(err);
            }
        
    });
}
