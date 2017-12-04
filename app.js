const { Client } = require('discord-rpc');
const { resolve } = require('path');
const Spotify = require('./spotify');
const cfg = require('./config.json');
const log = require('fancy-log');
const fs = require('fs');
const client = new Client(cfg);
const spotify = new Spotify();

/**
 * Check if user is blocking open.spotify.com before establishing RPC connection
 * user will be in loop of ECONNRESET [changed address]:80 or recieve false data.
 **/
try {
	const path = process.platform === 'win32' ? resolve(process.env.SYSTEMROOT, 'System32', 'drivers', 'etc', 'hosts')  : '/etc/hosts';
	const file = fs.readFileSync(path);
	if (file.includes('open.spotify.com')) {
		log(`Arr' yer be pirating! Please remove your "open.spotify.com" rule from your hosts file located in ${path}`);
		process.exit(1);
	}
} catch (error) {} // eslint-disable-line no-empty

const activity = {
	details: '🎵  Nothing',
	largeImageKey: cfg.images.large,
	smallImageKey: cfg.images.smallPaused
};

let timeout;
let time = 0;

/**
 * Function that checks if we can set the activity
 * if not, it'll set a timeout until we can
 **/
function setActivity() {
	const timeLeft = time + 15e3 - Date.now();
	if (timeLeft < 0) {
		client.setActivity(activity);
		time = Date.now();
	} else {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			client.setActivity(activity);
			time = Date.now();
		}, timeLeft);
	}
}

/**
 * Helper function to change the activity data
 **/
function update(song, image = cfg.images.smallPaused) {
	activity.smallImageKey = image;
	if (song) {
		activity.details = `🎵  ${song.title}`;
		activity.state = `👤  ${song.artist.name || 'Unknown'}`;
		activity.largeImageText = `🔗  ${song.id || 'Unknown'}`;
		activity.smallImageText = `💿  ${song.album.id || 'Unknown'}`;
		activity.startTimestamp = Math.floor(Date.now() / 1000) - song.played;
		activity.endTimestamp = activity.startTimestamp + song.length;
	} else {
		activity.details = '🎵  Nothing';
		delete activity.state;
		delete activity.smallImageText;
		delete activity.largeImageText;
		delete activity.startTimestamp;
		delete activity.endTimestamp;
	}
	setActivity();
}

client.on('ready', () => {
	log(`Connected to Discord! (${cfg.id})`);
	spotify.run();
});

spotify.on('song', song => {
	log(`Updated song to: ${song.artist.name} - ${song.title}`);
	update(song, cfg.images.small);
});
spotify.on('unpause', song => update(song, cfg.images.small));
spotify.on('pause', update);
spotify.on('stop', update);
spotify.on('error', log.error);

client.login(cfg.id).catch(log.error);