const { Client } = require('discord-rpc'),
      spotifyWeb = require('./spotify'),
      log = require("fancy-log"),
      events = require('events'),
      fs = require('fs'),
      keys = require('./keys.json');

/**
 * Check if user is blocking open.spotify.com before establishing RPC connection
 * Works only on Linux based systems that use /etc/hosts, if not this not provided
 * user will be in loop of ECONNRESET [changed address]:80 or recieve false data.
 **/
function checkHosts(file) {
  if (file.includes("open.spotify.com")) throw new Error("Arr' yer be pirating, please remove \"open.spotify.com\" rule from your hosts file.");
}
if (process.platform !== "win32" && fs.existsSync("/etc/hosts")) {
  checkHosts(fs.readFileSync("/etc/hosts", "utf-8"));
}

const rpc = new Client({ transport: keys.rpcTransportType }),
      s = new spotifyWeb.SpotifyWebHelper(),
      appClient = keys.appClientID,
      largeImageKey = keys.imageKeys.large,
      smallImageKey = keys.imageKeys.small,
      smallImagePausedKey = keys.imageKeys.smallPaused;

var songEmitter = new events.EventEmitter(),
    currentSong = {};

async function checkSpotify() {
  s.getStatus(function(err, res) {
    if (err) {
      log.error("Failed to fetch Spotify data:", err);
      return;
    }

    if (!res.track.track_resource || !res.track.artist_resource) return;

    if (currentSong.uri && res.track.track_resource.uri == currentSong.uri && (res.playing != currentSong.playing)) {
      currentSong.playing = res.playing;
      currentSong.position = res.playing_position;
      songEmitter.emit('songUpdate', currentSong);
      return;
    }

    if (res.track.track_resource.uri == currentSong.uri) return;

    let start = parseInt(new Date().getTime().toString().substr(0, 10)),
        end = start + (res.track.length - res.playing_position);

    var song = {
      uri: res.track.track_resource.uri,
      name: res.track.track_resource.name,
      album: res.track.album_resource.name,
      artist: res.track.artist_resource.name,
      playing: res.playing,
      position: res.playing_position,
      length: res.track.length,
      start,
      end
    };
    currentSong = song;

    songEmitter.emit('newSong', song);
  });
}

/**
 * Initialise song listeners
 * newSong: gets emitted when the song changes to update the RP
 * songUpdate: currently gets executed when the song gets paused/resumes playing.
 **/
songEmitter.on('newSong', song => {
  rpc.setActivity({
    details: `🎵  ${song.name}`,
    state: `👤  ${song.artist}`,
    startTimestamp: song.start,
    endTimestamp: song.end,
    largeImageKey,
    smallImageKey,
    largeImageText: `⛓  ${song.uri}`,
    smallImageText: `💿  ${song.album}`,
    instance: false,
  });

  log(`Updated song to: ${song.artist} - ${song.name}`);
});

songEmitter.on('songUpdate', song => {
  let startTimestamp = song.playing ?
    parseInt(new Date().getTime().toString().substr(0, 10)) - song.position :
    undefined,
    endTimestamp = song.playing ?
    startTimestamp + song.length :
    undefined;

  rpc.setActivity({
    details: `🎵  ${song.name}`,
    state: `👤  ${song.artist}`,
    startTimestamp,
    endTimestamp,
    largeImageKey,
    smallImageKey: startTimestamp ? smallImageKey : smallImagePausedKey,
    largeImageText: `⛓  ${song.uri}`,
    smallImageText: `💿  ${song.album}`,
    instance: false,
  });

  log(`Song state updated (playing: ${song.playing})`)
});

rpc.on('ready', () => {
  log(`Connected to Discord! (${appClient})`);

  setInterval(() => {
    checkSpotify();
  }, 1500);
});

rpc.login(appClient).catch(log.error);
