# spoticord `0.0.2`
**Display your current Spotify song on Discord using the RPC API:**
![N|Solid](https://s.phineas.io/share/DiscordProfile-RR_50.png)

## Dependencies
  - NodeJS >=8
  - Discord Canary (preferred)
  - Spotify >= 1.0

## Setup

  - Clone the repo `git clone git@github.com:nations/spoticord.git`
  - Install the modules `npm i`
  - Open Discord & Spotify
  - Start the RPC app `node app.js`


## Useful links

* [RPC API Documentation](https://discordapp.com/developers/docs/topics/rpc)
* [Rich Presence Documentation](https://discordapp.com/developers/docs/rich-presence/how-to)

## Troubleshooting
### It says the song is being updated but it isn't being displayed on my profile?
  - Go to Discord settings
  - Go to "Games"
  - Make sure "Display currently running game as a status message" is ticked

### Invalid token function (or something similar)
  - Make sure your node is updated, you need at LEAST version 8.0.0!

### `stdout maxBuffer exceeded` or some XML/CSV parse error
  - This is due to an outdated library which tries to help with Windows support
  - Go to node_modules, go to wintools, go to lib
  - Open ps.js
  - On line 11, replace the whole line with:
  `exec('wmic process list /format:csv', {maxBuffer: 2000*1024}, function (err, stdout, stderr) {`
