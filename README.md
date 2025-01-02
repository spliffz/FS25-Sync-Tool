# FS25 Sync Tool - readme.md
###### v1.2.0
   
Syncs mods for Farming Simulator 25 or 22 accross multiple pc's.   
Client-side application.   
Needs [FS25_Storage_Server](https://github.com/spliffz/FS25-Mod-Sync-Server) in combination usage.
   
![FS25 Mod Sync Tool by Spliffz](http://fs25.rotjong.xyz/fs25mst_01.png)   

---
### [Features]
  - ## **Also for use with Farming Simulator 22 (FS22)!**
  - Easy to use (but not the prettiest) interface. 
  - It accounts for the use of OneDrive or custom location.
  - Auto updates to a new version on release.
  - A smiling cow.
  - My everlasting gratitude for using my software!

### [How it works]
It simply compares your mods folder (Located in *'My Documents\My Games\Farmingsimulator2025\mods'*) with the mods on the server running [FS25_Storage_Server](https://github.com/spliffz/FS25-Mod-Sync-Server).   
If it finds new or updated mods it will automatically download them and overwrite the old ones.   
Mods will **never** be deleted. This is by design so single player savegames won't get corrupted.


### [Requirements]
 - Farming Simulator 25 or 22.
 - Currently only supports Windows.
 - [FS25_Storage_Server](https://github.com/spliffz/FS25-Mod-Sync-Server).

### [Installation]
 - Download the latest build from [Releases](https://github.com/spliffz/FS25-Sync-Tool/releases).
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
