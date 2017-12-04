// https://github.com/lloti/spoticord/blob/master/src/utils/spotify.js
const { execSync, spawn } = require('child_process');
const { EventEmitter } = require('events');
const { resolve } = require('path');
const { get } = require('snekfetch');

class Song {
	constructor(data) {
		this.title = data.track.track_resource.name;
		this.id = data.track.track_resource.uri.slice('spotify:track:'.length);
		this.played = Math.floor(data.playing_position);
		this.length = data.track.length;
		this.artist = {
			id: data.track.artist_resource ? data.track.artist_resource.uri.slice('spotify:artist:'.length) : '',
			name: data.track.artist_resource ? data.track.artist_resource.name : ''
		};
		this.album = {
			id: data.track.album_resource ? data.track.album_resource.uri.slice('spotify:album:'.length) : '',
			name: data.track.album_resource ? data.track.album_resource.name : ''
		};
	}
}

class Spotify extends EventEmitter {
	constructor() {
		super();
		if (process.platform === 'win32') this._path = resolve(process.env.USERPROFILE, 'AppData', 'Roaming', 'Spotify', 'Data', 'SpotifyWebHelper.exe');
		this._port = 4381;
		this._open = 'https://open.spotify.com';
		this._base = `http://localhost:${this._port}`;
		this._playing = null;
		this._stopped = null;
		this._song = '';
	}

	_get(path, query = {}) {
		return get(`${this._base}${path}`).set('Origin', this._open).query(query);
	}
	
	_running() {
		return process.platform === 'win32' ? execSync('tasklist').includes('SpotifyWebHelper.exe') : true;
	}

	async check() {
		try {
			const { body } = await this._get('/remote/status.json', this._query);
			if (!body.track || !body.track.track_resource || body.track.track_type === 'ad') {
				if (this._stopped === false) this.emit('stop');
				return;
			} else this._stopped = true;
			const song = new Song(body);
			if (this._playing === null) this._playing = body.playing;
			if (this._playing !== body.playing) {
				this._playing = body.playing;
				this.emit(`${this._playing ? 'un' : ''}pause`, song);
			} else {
				if (this._song !== song.id) {
					this._song = song.id;
					this.emit('song', song);
				}
			}
		} catch (error) {
			this.emit('error', error);
		}
	}

	async run() {
		try {
			if (!this._running()) spawn(this._path, { detached: true, stdio: 'ignore' }).unref();
			const { body: token } = await get(`${this._open}/token`).set('Origin', this._open);
			const { body: csrf } = await this._get('/simplecsrf/token.json');
			this._query = { csrf: csrf.token, oauth: token.t };
			this._interval = setInterval(() => this.check(), 2e3);
		} catch (error) {
			this.emit('error', error);
			setTimeout(() => this.run(), 5e3);
		}
		return this;
	}
}

module.exports = Spotify;