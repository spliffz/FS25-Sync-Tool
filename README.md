# FS25 Sync Tool - readme.md
###### v1.1.4
   
Syncs mods for Farming Simulator 25 accross multiple pc's.   
Client-side programm.   
Needs FS25_Storage_Server in combination usage.
   
A Electron + Vue.js application.   
   
![FS25 Mod Sync Tool by Spliffz](https://fs25.rotjong.xyz/fs25mst_01.png)



# [How it works]
It simply compares your mods folder (Located in *'My Documents\My Games\Farmingsimulator2025\mods'*) with the mods on the server running [FS25_Storage_Server](https://github.com/spliffz/FS25_Storage_Server).   
If it finds new or outdated mods it will automatically download them and overwrite the old ones.


# [Requirements]
 - Farming Simulator 25.
 - Currently only supports Windows.
 - [FS25_Storage_Server](https://github.com/spliffz/FS25_Storage_Server).

# [Installation]
 - Download the last build from [Releases](https://github.com/spliffz/FS25-Sync-Tool/releases).
 - Install it, it should launch after installation.
 - Enter your server hostname.
 - Click "Check Mods" and grab a coffee.

# [Build it yourself]
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
    2. Paste or type this in there and hit enter:   
    `[Environment]::SetEnvironmentVariable("GH_TOKEN","<TOKEN>","User")`   
    with <TOKEN> being replaced by your Personal Access Token.










