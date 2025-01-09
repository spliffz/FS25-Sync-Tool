# FS25 Sync Tool - readme.md
###### v1.2.3
   
Syncs mods for Farming Simulator 22 or 25 across multiple pc's.   
Client-side application.   
Needs [F25-Mod-Sync-Server](https://github.com/spliffz/FS25-Mod-Sync-Server) in combination usage.
   
![FS25 Mod Sync Tool by Spliffz](http://fs25.rotjong.xyz/FS25-mst-01.png)   

---

#### Discord: [https://discord.gg/cxs9hcE2X6](https://discord.gg/cxs9hcE2X6)   

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

### [Changelog]
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





