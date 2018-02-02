# **Deprecated**
**In favor of [Discord's Spotify Connection](https://support.discordapp.com/hc/en-us/articles/360000167212).**

# spoticord `0.0.4` [![discordxd](https://discordapp.com/api/guilds/297142682894073856/embed.png)](https://discord.gg/nations)
**Display your current Spotify song on Discord using the RPC API:**
![N|Solid](https://s.phineas.io/share/68747470733acx.png)

## Dependencies
  - NodeJS >=8
  - npm (>=5) or Yarn (>=1.2)
  - Discord Canary (preferred)
  - Spotify >= 1.0
  - Git

## Setup

  - Clone this repository: `$ git clone https://github.com/nations/spoticord.git`
  - Move into the repository: `$ cd spoticord`
  - Install the modules: `$ npm i` (requires [Node.JS](https://nodejs.org)) or `$ yarn` (requires [Yarn](https://yarnpkg.com/en/docs/install)).
  - Open both Discord & Spotify
  - Start the RPC app `node app.js`
  
  You'll need to have Terminal/Command Prompt open to run this unless you follow these steps:
  
## How to run in the background

  - Install pm2 `$ npm i pm2 -g` (requires [Node.JS](https://nodejs.org))
  - Start the app `$ pm2 start app.js --name="spoticord"`
  - Use `$ pm2 log spoticord` to view the logs
  - Restart the app using `$ pm2 restart spoticord`

## Updating
  - To update SpotiCord, enter the "spoticord" directory and run `$ git fetch` in your terminal.

## FAQ
  Q: Can I get banned or punished by Discord for using this?  
  A: **No. The RPC was made by Discord themselves and Spoticord has been recommended and used by Discord staff**

  Q: I don't see the progress bar, where's it gone?  
  A: **Make sure you're using Discord Canary. Even still, Discord might remove this feature from time to time to update it since canary is a development version of Discord. Get Canary at:
  https://discordapp.com/api/download/canary?platform=win
  https://discordapp.com/api/download/canary?platform=osx
  https://discordapp.com/api/download/canary?platform=linux**

  Q: Can I host this on an external server?  
  A: **No, the Discord RPC api runs on your local Discord client, and unless you want to port forward a few things and create necessary firewall rules to do it, it's not worth it. You'd have to repeat that with the Spotify web helper api, too.**

  Q: I'm not experienced with this scope of programming, are there any tutorials?  
  A: **Yes! I found a few on YouTube:**  
        - https://www.youtube.com/watch?v=9Gsop2h64Uo  
        - https://www.youtube.com/watch?v=bTP2t6VgAv8  
        - https://www.youtube.com/watch?v=KhQtXUH4jlU  
        - https://www.youtube.com/watch?v=Rntn6Jg8cHk


  Q: I found an obscure error not mentioned in the troubleshooting section, what should I do?  
  A: **First, check the closed (and open) issues on this repo, we might have answered it there already. If not, create a new one with the WHOLE error and when it occurred (during start, runtime, etc). Thank you!**

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
