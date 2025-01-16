# FS25 Sync Tool - readme.md
###### v1.2.5
   
Syncs mods for Farming Simulator 22 or 25 across multiple pc's.   
Client-side application.   
Needs [FS25-Mod-Sync-Server](https://github.com/spliffz/FS25-Mod-Sync-Server) in combination usage.
   
![FS25 Mod Sync Tool by Spliffz](http://fs25.rotjong.xyz/githubpage/FS25-mst-02.png)   

---

#### Question? Issues? Ideas? Join the Discord: [https://discord.gg/cxs9hcE2X6](https://discord.gg/cxs9hcE2X6)   

[<img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png">](https://www.buymeacoffee.com/Spliffz)

---
# Important Update Notice
If after updating the program you start seeing missing paths, or settings that aren't right you might need to delete your `config.json`.   
This is located in `%appdata%/fs25-sync-tool`. Just delete the whole folder and it will make a new config when you run it.

---

### [Features]
  - ## **Also for use with Farming Simulator 22 (FS22)!**
  - Easy to use (but ugly) interface. 
  - It accounts for the use of OneDrive or custom location.
  - Auto updates to a new version on release.
  - Ability to backup mods before updating.
  - Periodic Sync that runs in the background. 
  - A smiling cow.
  - My everlasting gratitude for using my software!

### [How it works]
It simply compares your mods folder (Located in *'My Documents\My Games\Farmingsimulator2025\mods'*) with the mods on the server running [F25-Mod-Sync-Server](https://github.com/spliffz/FS25-Mod-Sync-Server).   
If it finds new or updated mods it will automatically download them and overwrite the old ones.   
Mods will **never** be deleted. This is by design so single player savegames won't get corrupted.


### [Requirements]
 - Farming Simulator 22 or 25.
 - Currently only supports Windows.
 - [F25-Mod-Sync-Server](https://github.com/spliffz/FS25-Mod-Sync-Server).

### [Installation]
 - Download the last build from [Releases](https://github.com/spliffz/FS25-Sync-Tool/releases).
 - Install it, it should launch after installation.
 - Enter your server hostname.
 - If you use it for FS22 you need to change the Version in Settings.
 - Click "Check Mods" and grab a coffee.

### [Build it yourself]
  - Clone or download the repo.
  - Edit `package.json` to your liking.
  - Edit the USER VARIABLES in `src/main/index.js` located on line 12.
    - If you want to use a private github repo you can set `isPrivateRepo = true` and put your Access Token in the `GH_TOKEN_token` variable like this: `GH_TOKEN_token = 'YOUR_TOKEN_HERE'`.
    You can get an access token from   
    `Github Settings > Applications > My Github Apps > Personal Access Tokens > Fine-grained tokens`.
  - Run `npm install` to install the modules.
  - Run `npm run build:win` for building the windows client. It will be located in the `dist` folder.
  - See `package.json` for all runnable scripts and options.
  - For publishing with electron-forge you need to edit `forge.config.js`.
  - (Preferred) For publishing with electron-builder you need to put an Personal Access Token with read/write access to the repo and set it as a Environment Variable for the current Windows User.   
  Easiest way of doing this is by using Powershell:   
    1. Open a Powershell window (Start menu > powershell)
    2. Paste or type and edit this in there and hit enter:   
    `[Environment]::SetEnvironmentVariable("GH_TOKEN","<TOKEN>","User")`   
    with `<TOKEN>` being replaced by your Personal Access Token.

### [Build with]
  - Electron
  - Vue.js
  - Bootstrap

Eventually i'll make a better looking interface. *Eventually.*

### [Transparency regarding data collection]
I'm no fan of data collecting. I recommend Ublock Origin as default.   
But in order to have any idea about how many times my program is installed I had to include very basic data collection.   
Besides the IP (since you connect to a webserver over the internet, it gets logged automatically) I only collect the HWID.   
This is a string of random characters that is unique to your machine. It holds no identifier what so ever. It is **impossible** to link that to any personal or private identifier of your machine. It looks like this: `33198d3e-bdc6-7a22-9291-244bfe9a2a4c`.
I collect that so I can check for unique installations.
The collecting happens at start, and you can check what it does here: `/src/main/stats.js`.   
I've made it opt-out, which you can do in the 'Settings' tab.
But I would really really *really* appreciate it if you let me collect this to satisfy my analytics needs.    

Thus, out of transparency I've made a page on my server that shows the stats.   
If you're interested you can find it here: [https://fs25.rotjong.xyz/stats.php](https://fs25.rotjong.xyz/stats.php)

### [Changelog]
[v1.2.5]
- added minimum anonymous statistics: Hardware ID and IP address. I've no other way of knowing how many times the program is used and I like to have a minimum amount of statistics so I know a bit more about the usage. That's all. All the code is contained in `/src/main/stats.js` if you want to take a look. Anyway.. it's better than implementing Google Analytics.
- Out of transparency I've made the statistics public, so you see what I see. Stats here: [https://fs25.rotjong.xyz/stats.php](https://fs25.rotjong.xyz/stats.php)

[v1.2.4]
- fixed a crucial typo that could break it completely.

[v1.2.3]
- added periodic check feature [Issue #1](https://github.com/spliffz/FS25-Sync-Tool/issues/1) - just let it run in the background and get updates
- changed app icon
- added tray icon + menu
- added 'About' page
- rewrote some IPC calls
- some minor things that aren't worth mentioning (basically I forgot..)
- added minimize to tray feature. - Clicking the tray icon will **always** minimize to tray
- added 1 time removal of config file to have a fresh start. Yep sorry but it's needed to reset some code base changes.
- fixed it trying to make a backup of a non-existing file. Now it skips like it should.
- added more information on startup

[v1.2.2]
- Fixing the mess that was 1.2.1 *sigh* For some reason a lot was broken.
So fixed the initial config, the urls, the path, the switching of version. Only not broken was the backup function -_-

[v1.2.1]
- New feature: Mod Backups. Disabled by default. If enabled it will make a backup named `*.backup` in the mods folder before updating it.
- New Feature: Delete backups on disable mod backups. If chosen all the .backup files will be deleted upon switching Mod Backup to Disabled.

[v1.2.0]
- added settings page
  - added support for FS22: you can now also use this for Farming Simulator 22.
  - added mods folder location - for if you have it somewhere else like Z:\
- added 'INFO' or 'ERROR' indicator for writeLog() messages





