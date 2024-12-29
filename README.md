# FS25 Sync Tool - readme.md
###### v1.1.0
   
Syncs mods for Farming Simulator 25 accross multiple pc's.   
Client-side programm.   
Needs FS25_Storage_Server in combination usage.
   
Author: Spliffz <*thespliffz@gmail.com*>   
   

![FS25 Mod Sync Tool by Spliffz](http://fs25.rotjong.xyz/fs25mst_01.png)
   

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
  - Clone the repo.
  - run `npm install` to install the modules.
  - run `npm run build:win` for building the windows client. It will be located in the `dist` folder.
  - see `package.json` for all runnable scripts and options.

