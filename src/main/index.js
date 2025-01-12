import { app, dialog, shell, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import Axios from 'axios'
import Config from 'electron-config'
const config = new Config()
import { autoUpdater } from 'electron-updater'
import { existsSync } from 'fs'
import { upStats } from './stats'

import FloatingVue from 'floating-vue'

// -------------------------------------------------------
// ### USER VARIABLES
const spliffz_debug = false // enabled debug console. set to false for production build!

// ### Private Github Repo Config
const isPrivateRepo = false // set to true if you want to use a private github repo.
// These can be empty if isPrivateRepo = false
const gitRepo = 'FS25-Sync-Tool'
const gitOwner = 'Spliffz'
const GH_TOKEN_token = ''


// DON'T TOUCH
// HERE BE DRAGONS AND UH EVIL WIZARDS.
// -------------------------------------------------------
process.setMaxListeners(0)

// Tray icon
let tray
let isWindowHidden = false

import appIcon from '../../build/icon.ico?asset'


if (isPrivateRepo) {
  process.env.GH_TOKEN = GH_TOKEN_token
}

// IPC Send
function IPC_anonymousStats() {
  mainWindow.send('IPC_anonymousStats', { data: anonymousStats })
}
function IPC_doBackupEnabled() {
  mainWindow.send('IPC_doBackupEnabled', { data: backupEnabled })
}
function IPC_sendFSVersion() {
  mainWindow.send('IPC_sendFSVersion', { data: selectedFSVersion })
}
function IPC_sendModFolderPath() {
  mainWindow.send('IPC_getModFolderPath', { data: modsPath })
}
function writeLog(msg, type=null) {
  mainWindow.send('IPC_sendToLog', { data: msg, t: type })
  // BrowserWindow.getFocusedWindow().webContents.send('IPC_sendToLog', { data: msg })
}
function IPC_sendModserverUrl(msg) {
  mainWindow.send('getModserverUrl', { data: msg })
}

function IPC_sendVersionNumber() {
  mainWindow.send('getVersionNumber', { data: app.getVersion()})
}

function IPC_sendCheckIntervalStatus() {
  console.log('ipc_CheckIntervalStatus!')
  mainWindow.send('IPC_checkIntervalStatus', { data: config.get('periodicCheck') })
}

function IPC_sendCheckInterval() {
  console.log('ipc_CheckInterval!')
  mainWindow.send('IPC_checkInterval', { data: config.get('periodicCheckInterval') })
}
function IPC_minimizeToTray() {
  mainWindow.send('IPC_minimizeToTray', { data: minimizeToTray })
}

const width = 780
const height = 520
const opts = {
  width: width,
  height: height,
  icon: __dirname + '/assets/icon.png',
  show: false,
  autoHideMenuBar: true,
  ...(process.platform === 'linux' ? { icon } : {}),
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: true,
    preload: join(__dirname, '../preload/index.js'),
    sandbox: false,
  }
}

let mainWindow = null

function createWindow(opts) {
  mainWindow = new BrowserWindow(opts)
  // Create the browser window.
  // const mainWindow = new BrowserWindow(opts)
  if (spliffz_debug) {
    mainWindow.webContents.openDevTools()
  }
  mainWindow.setResizable(false)
  mainWindow.setBounds({ width: width, height: height })
  
  mainWindow.on('ready-to-show', () => {
    isWindowHidden = false
    mainWindow.show()
  })

  mainWindow.on('minimize', (event) => {
    if(config.get('minimizeToTray') == 'enabled') {
      event.preventDefault()
      isWindowHidden = true
      mainWindow.hide()
    }
  })

  mainWindow.on('close', () => {
    config.set('winBounds', mainWindow.getBounds())
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.setIcon(appIcon)

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}






// app.use(FloatingVue)

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  if (isPrivateRepo) {
    autoUpdater.setFeedURL({
      provider: 'github',
      repo: gitRepo,
      owner: gitOwner,
      private: true,
      token: GH_TOKEN_token
    })
  }
  
  autoUpdater.checkForUpdatesAndNotify()

  //let opts = {show: false}
  Object.assign(opts, config.get('winBounds'))
  // Set app user model id for windows
  electronApp.setAppUserModelId('FS25-Mod-Sync-Tool')


  // Tray icon
  tray = new Tray(nativeImage.createFromPath(appIcon))
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'FS25 Sync Tool v' + app.getVersion(),
      type: 'normal'
    },
    {
      // label: 'Show Sync Tool',
      type: 'separator'
    },
    {
      label: 'Show Sync Tool',
      type: 'normal',
      click: () => {
        mainWindow.show()
        isWindowHidden = false
      }
    },
    {
      label: 'Minimize to Tray',
      type: 'normal',
      click: () => {
        mainWindow.hide()
        isWindowHidden = true
      }
    },
    {
      label: 'Quit',
      type: 'normal',
      click: () => {
        app.quit()
      }
    }
  ])
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {

    console.log(isWindowHidden)
    if (isWindowHidden) {
      console.log(isWindowHidden)
      console.log('show')
      mainWindow.show()
      isWindowHidden = false
    } else {
      console.log(isWindowHidden)
      console.log('hide')
      mainWindow.hide()
      isWindowHidden = true;
    }
  })


  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  // ipcMain.on('ping', () => console.log('pong'))
  ipcMain.on('checkMods', () => {
    //console.log('checkMods')
    checkMods()
  })

  ipcMain.on('welcome', () => {
    IPC_sendModFolderPath()
    IPC_doBackupEnabled()
    IPC_sendModserverUrl(modserverUrl)
    IPC_sendCheckIntervalStatus()
    IPC_sendCheckInterval()
    IPC_sendFSVersion()
    IPC_minimizeToTray()
    IPC_anonymousStats()
    welcomeText()
  })
  
  ipcMain.on('saveModserverUrl', (event, props) => {
    // console.log(props)
    config.set('modserverHostname', props)
    writeLog('Changed Modserver URL to: ' + props, 'info')
    modserverUrl = config.get('modserverHostname')
    setMainVars()
    IPC_sendModserverUrl(modserverUrl)
  })
  
  ipcMain.on('onDoBackupModsChange', (event, props) => {
    config.set('backupEnabled', props)
    backupEnabled = props
    setMainVars()
    IPC_doBackupEnabled();
  })

  ipcMain.on('deleteBackupFiles',(event, props) => {
    deleteBackupFiles = true
    setMainVars()
    deletingBackupFiles()
  })

  ipcMain.on('getVersionNumber', (event, props) => {
    IPC_sendVersionNumber()
  })

  ipcMain.on('IPC_minimizeToTray', (event, props) => {
    config.set('minimizeToTray', props)
    minimizeToTray = props
    IPC_minimizeToTray()
  })
  
  ipcMain.on('locateModFolder', (event, props) => {
    // console.log(props)
    dialog.showOpenDialog({
      properties: [
        'openDirectory'
      ]
    }).then(result => {
      // console.log(result)
      let fpath = result.filePaths + '\\'
      // console.log('fpath: ' + fpath)
      config.set(pre + 'modFolderLocation', [ fpath ])
      mainWindow.send('modFolderDialogLocation', result.filePaths)
      writeLog('Mods Folder Changed to: ' + result.filePaths)
    })
  })


  ipcMain.on('openLink_Github', (event, props) => {
    shell.openPath('https://github.com/spliffz/FS25-Sync-Tool')
  })

  ipcMain.on('openLink_Discord', (event, props) => {
    shell.openPath('https://discord.gg/cxs9hcE2X6')
  })

  ipcMain.on('onAnonymousStatsChange', (event, props) => {
    console.log(props)
    setAnonymousStatsChange(props)
  })

  ipcMain.on('onSetCheckOnInterval', (event, props) => {
    console.log(props)
    setPeriodicCheck(props)
  })
  
  ipcMain.on('onSetCheckInterval', (event, props) => {
    console.log(props)
    setCheckInterval(props)
  })


  ipcMain.on('versionChange', (event, props) => {
    // console.log(props)
    setVersion(props)
  })

  createWindow(opts)

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow(opts)
  })


})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.


// some default values

// Okay.. so I fucked up somewhere between 1.2.2 and 1.2.3 and now I need to delete your config file for 1.2.3.
// Don't worry, this is a one time thing (hopefully..)

const appDataConfigFolder = join(os.homedir(), 'Appdata', 'Roaming', app.getName())
// console.log(appDataConfigFolder)

if (app.getVersion() == '1.2.3') {
  if (config.get('123_ConfigDeleted') != 1) {
    // And. Here. We. Go.
    
    if (existsSync(appDataConfigFolder)) {
      console.log('Config folder exists')
      fs.rmdirSync(appDataConfigFolder, { recursive: true, force: true})
      console.log('Config folder ' + appDataConfigFolder + ' deleted. Fresh start baby!')
    }
    config.set('123_ConfigDeleted', 1)
  }
}



if (typeof config.get('anonymousStats') === 'undefined') {
  config.set('anonymousStats', 'enabled')
}
if (typeof config.get('periodicCheck') === 'undefined') {
  config.set('periodicCheck', 'disabled')
}
if (typeof config.get('minimizeToTray') === 'undefined') {
  config.set('minimizeToTray', 'disabled')
}
if (typeof config.get('periodicCheckInterval') === 'undefined') {
  config.set('periodicCheckInterval', '60') // default to 60 seconds
}
if (typeof config.get('periodicCheckIntervalMS') === 'undefined') {
  config.set('periodicCheckIntervalMS', '300000') // 60000 ms
}
if (typeof config.get('selectedFSVersion') === 'undefined') {
  config.set('selectedFSVersion', '')
}
if (typeof config.get('modserverHostname') === 'undefined') {
  config.set('modserverHostname', '')
}
const oneDrivePath = os.homedir + '\\OneDrive\\Documents\\'
let modsPath = ''
if (typeof config.get('fs25_modFolderLocation') === 'undefined') {
  if (fs.existsSync(oneDrivePath)) {
    modsPath = os.homedir + '\\OneDrive\\Documents\\My Games\\FarmingSimulator2025\\mods\\'
    // config.set(pre + 'modFolderLocation', modsPath)
    config.set('fs25_modFolderLocation', [modsPath])
  } else {
    modsPath = os.homedir + '\\Documents\\My Games\\FarmingSimulator2025\\mods\\'
    // config.set(pre + 'modFolderLocation', modsPath)
    config.set('fs25_modFolderLocation', [modsPath])
  }
}
if (typeof config.get('fs22_modFolderLocation') === 'undefined') {
  if (fs.existsSync(oneDrivePath)) {
    modsPath = os.homedir + '\\OneDrive\\Documents\\My Games\\FarmingSimulator2022\\mods\\'
    // config.set(pre + 'modFolderLocation', modsPath)
    config.set('fs22_modFolderLocation', [modsPath])
  } else {
    modsPath = os.homedir + '\\Documents\\My Games\\FarmingSimulator2022\\mods\\'
    // config.set(pre + 'modFolderLocation', modsPath)
    config.set('fs22_modFolderLocation', [modsPath])
  }
}
if (typeof config.get('backupEnabled') === 'undefined') {
  config.set('backupEnabled', 'disabled')
}
if (typeof config.get('winBounds') === 'undefined') { 
  config.set('winBounds', '')
}

function setMainVars() {
  serverUrl = config.get('modserverHostname')
  modFolderPath = config.get('modFolderLocation')
  backupEnabled = config.get('backupEnabled')
  selectedFSVersion = config.get('selectedFSVersion')
}

function setDLUrl() {
  return serverUrl + '/mods/'
}


// -------------------------------------------------------
// ### DON'T TOUCH FROM HERE.
// THERE BE DRAGONS AND SUCH. JUST GO AWAY.
// -------------------------------------------------------
let selectedFSVersion = config.get('selectedFSVersion');
if (selectedFSVersion === '') {
  selectedFSVersion = '25'
  config.set('selectedFSVersion', selectedFSVersion)
}
let pre = ''
if (selectedFSVersion === '22') {
  pre = 'fs22_'
} else if (selectedFSVersion === '25') {
  pre = 'fs25_'
}

let modserverUrl = config.get('modserverHostname')
let modFolderPath = config.get(pre + 'modFolderLocation')
console.log(modFolderPath)
// console.log(typeof(modFolderPath))
if (modFolderPath === '') {
  if (fs.existsSync(oneDrivePath)) {
    modsPath = os.homedir + '\\OneDrive\\Documents\\My Games\\FarmingSimulator20'+selectedFSVersion+'\\mods\\'
    config.set(pre + 'modFolderLocation', modsPath)
    // config.set('fs22_modFolderLocation', modsPath)
  } else {
    modsPath = os.homedir + '\\Documents\\My Games\\FarmingSimulator20'+selectedFSVersion+'\\mods\\'
    config.set(pre + 'modFolderLocation', modsPath)
    // config.set('fs22_modFolderLocation', modsPath)
  }
} else {
  modsPath = modFolderPath
}
let serverUrl = modserverUrl 
let dlUrl = setDLUrl()
let backupEnabled = config.get('backupEnabled')
let anonymousStats = config.get('anonymousStats')
let minimizeToTray = config.get('minimizeToTray')
if (backupEnabled === '') {
  backupEnabled = 'disabled'
}

let deleteBackupFiles = false


// -------------------------------------------------------
// ### MAIN FUNCTIONS


function setCheckInterval(minutes) {
  let time, timeText
  if (minutes == 1) {
    time = minutes * 60
    timeText = '1 minute'
  } else if (minutes == 5) {
    time = minutes * 60
    timeText = '5 minutes'
  } else if (minutes == 10) {
    time = minutes * 60
    timeText = '10 minutes'
  } else if (minutes == 30) {
    time = minutes * 60
    timeText = '30 minutes'
  } else if (minutes == 60) {
    time = minutes * 60
    timeText = ' 1 hour'
  } else if (minutes == 360) {
    time = minutes * 60
    timeText = ' 6 hours'
  } else if (minutes == 1440) {
    time = minutes * 60
    timeText = ' 1 day/24 Hours'
  }
  
  let finalTime = time * 1000
  writeLog('Setting periodic check interval to every ' + timeText, 'info')
  config.set('periodicCheckInterval', minutes)
  config.set('periodicCheckIntervalMS', finalTime)
  // if (config.get('periodicCheck') == 'enabled') {
  //   runPeriodicCheck()
  // }
}

function setAnonymousStatsChange(val) {
  config.set('anonymousStats', val)
  writeLog('Settings Collect Anonymous Statistics to ' + val, 'info')
}


let periodicTimerRunning
function setPeriodicCheck(val) {
  config.set('periodicCheck', val)
  writeLog('Setting periodic check to ' + val, 'info')
  if (config.get('periodicCheck') == 'enabled') {
    runPeriodicCheck()
  } else {
    clearInterval(periodicTimerRunning)
  }
}

function runPeriodicCheck() {
  clearInterval(periodicTimerRunning)
  if (config.get('periodicCheck') == 'enabled') {
    periodicTimerRunning = setInterval(() => {
      writeLog('Running Periodic Check.', 'info')
      checkMods()
    }, config.get('periodicCheckIntervalMS'))
  }
}



function deletingBackupFiles() {
  writeLog('Deleting backup files...', 'info')
  
  let files = fs.readdirSync(modsPath, { withFileTypes: true }) // (error, files) => {

  files.forEach((file) => {
    if (file.name.endsWith('.zip.backup')) {
      fs.unlink(modsPath + file.name, (err) => {
        if (err) {
          console.log('deletingBackupFiles: ' + err);
          return
        }
      })
    }
  })
      
  writeLog('Backup Files Deleted.', 'info')
}

function setVersion(version) {
  if (version == '22') {
    pre = 'fs22_'
  } else if (version == '25') {
    pre = 'fs25_'
  }
  modFolderPath = config.get(pre + 'modFolderLocation')
  config.set('selectedFSVersion', version)
  selectedFSVersion = version
  modsPath = modFolderPath[0]
  IPC_sendModFolderPath()
  console.log(modsPath)
  setMainVars()
  writeLog('Using Folder: ' + modsPath, 'info')
}


async function getListFromServer() {
  // get json list from server
  writeLog('Getting list from server...')
  serverUrl = config.get('modserverHostname')
  const urlPath = '/ajax.php?getModList'
  console.log(serverUrl)
  let fetched = await fetch(serverUrl + urlPath)
  if (fetched.ok) {
    const data = await fetched.json()
    //console.log(data)
    return data
  } else {
    console.log('getListFromServer(): Fetch went wrong! response: ' + fetched.status + ' | Text: ' + fetched.statusText)
    writeLog("Couldn't get info from server. Response: " + fetched.status + " - " + fetched.statusText, 'error')
    return false
  }
}

async function checkForNewMods(servModList, localList) {
  // Missing/New mods:
  let newModsArray = []
  const localModListArray = localList // getLocalModList()

  // checks for new mods. 
  writeLog('Checking for new mods...')
  let i = 0
  servModList.forEach((el) => {
    const exists = localModListArray.find((elm) => elm[0] === el[0])
    //console.log(i + ' - el: ' + el[0] + ' | exists: ' + exists)
    if (!exists && el != '') {
      //console.log('item doesn\'t exist! - ' + exists)
      newModsArray.push(el[0])
    }
    i++
  })
  writeLog('Found ' + newModsArray.length + ' new mods.')
  return newModsArray
}

function getLocalModList() {
  writeLog('Mods folder: ' + modsPath, 'info')
  console.log('Mods folder: ' + modsPath.toString())

  let result = []
  let resultArray = []
  let fsize = ''
  let files = fs.readdirSync(modsPath.toString(), { withFileTypes: true }) // (error, files) => {

  files.forEach((file) => {
    if (!file.name.endsWith('Copy.zip')) {
      try {
        const stats = fs.statSync(modsPath + file.name)
        fsize = stats.size
      } catch (err) {
        console.error('file stats error: ' + err)
      }
    
      const hash = md5File.sync(modsPath + nodePath.sep + file.name)
      result.push( [ file.name, modsPath + nodePath.sep + file.name, hash, fsize ] )
    }
  })
  
  resultArray.push(result)
  return resultArray
}

async function checkForUpdates(localModList) {
  let mlarray = []

  writeLog('Checking for updates...')

  await Promise.all(
    localModList.map(async (el) => {
      //console.log(el)
      const urlPath = '/ajax.php?checkMod&modname=' + el[0] + '&modhash=' + el[2] + '&size=' + el[3]
      // console.log('urlPath: ' + serverUrl + urlPath)

      let fetched = await fetch(serverUrl + urlPath, {
        signal: AbortSignal.timeout(120000)
      })
        .then((res) => res.json())
        .then((data) => {
          //console.log(data)
          if (data.msg == 'ok') {
            //console.log(data)
            if (data.update == 1) {
              //console.log(data)
              mlarray.push(data.name)
              // return data.name
            }
          }
        })
        .catch((err) => {
          console.log('checkForUpdates(): Fetch went wrong! File: ' + el + ' | error: ' + err)
          writeLog("Couldn't get info from server. File: " + el + ' - ' + err, 'error')
        })
    })
  ).then(function(res) {
    // console.log('res: ' + res)
    // return false
  })

  writeLog('Found ' + mlarray.length + ' outdated mods.')
  //mllarray.push(mlarray)
  return mlarray
}

function mergeListsForDownload(lml, sml) {
  let mergedList = lml.concat(sml)
  //console.log(mergedList.sort())

  return mergedList
}

async function getLocalModsList() {
  const localModList = getLocalModList()
  return localModList[0]
}

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
function formatProgress(progress) {
  return Math.floor(progress * 100)
}

function welcomeText() {
  const periodicCheckEnabled = config.get('periodicCheck');
  writeLog('Hello ' + os.userInfo().username + '!')
  // writeLog('')
  // writeLog('-------------------------------')
  // writeLog('I\'m sorry but I had to reset your config file in this update.')
  // writeLog('This is a one time thing (hopefully) and you\'re all good now!')
  // writeLog('To make it up to you I give you some new features!')
  // writeLog('Have fun farming!')
  // writeLog('-------------------------------')
  writeLog('')
  writeLog('Selected: Farming Simulator ' + selectedFSVersion + '.')
  writeLog('PeriodicCheck is ' + periodicCheckEnabled + ', Backups are ' + backupEnabled + ', Minimize to Tray is ' + minimizeToTray + '.')
  if(periodicCheckEnabled == 'enabled') {
    writeLog('Periodic check is on. Will automatically start a sync in a few seconds.')
  }
  writeLog('Click the [Sync Mods] button to start.')
}


// ### MAIN CODE
import fs, { write } from 'fs'
import os from 'os'
import nodePath from 'path'
import md5File from 'md5-file'



if (config.get('periodicCheck') == 'enabled') {
  runPeriodicCheck()
}

if(config.get('anonymousStats') == 'enabled') {
  upStats()
}


async function backupMod(mod) {
  // console.log(mod)
  writeLog('Making backup of file ' + mod, 'info')
  const newMod = mod + '.backup'
  try {
    fs.copyFileSync(modsPath + mod, modsPath + newMod)

    console.log('backup of ' + mod + ' completed.')
  } catch (err) {
    if (err) throw err
    console.log(err)
  }

}

export async function checkMods() {
  function checkIfDone() {
    // console.log('dlMods: ' + downloadedMods)
    // console.log('mgList: ' + mergedListForDownload.length)
    if (downloadedMods === mergedListForDownload.length) {
      // console.log('I don\'t know anymore.')
      writeLog('')
      writeLog('All Done! You can start your game now. Enjoy!')
    } else {
      writeLog('Please wait, still downloading mods...')
      console.log('Please wait, still downloading mods...')
    }
  }

  function downloadedModsIncr(filename) {
    downloadedMods++
    writeLog('File ' + filename + ' downloaded successfully.', 'info');
    checkIfDone()
  }
  

  // need to have a hostname set before it can do anything
  if (modserverUrl === '') {
    return
  }

  writeLog("Checking mods for updates or additions...")
  writeLog('Please do not close the program.')
  
  // get json list from server
  let getLocalModsListArray = await getLocalModsList()
  let serverModList = await getListFromServer()
  if (!serverModList) {
    return
  }
  // lets divide: check for new mods first:
  let newModsToAdd = await checkForNewMods(serverModList, getLocalModsListArray)
  //console.log(typeof(newModsToAdd))
  //console.log(newModsToAdd)
  // then check for updates
  let updatableMods = await checkForUpdates(getLocalModsListArray)
  // merge lists for download
  let mergedListForDownload = mergeListsForDownload(updatableMods, newModsToAdd)
  if (mergedListForDownload.length == 0) {
    writeLog(mergedListForDownload.length + ' mods to be downloaded.')
    writeLog('')
    writeLog('All Done! You can start your game now. Enjoy!')
    return
  }
  console.log(mergedListForDownload)
  let downloadedMods = 0
  let downloadModsFromServer = new Promise(function(resolve, reject) {
    writeLog(mergedListForDownload.length + ' mods to be downloaded.')
    writeLog(mergedListForDownload)

    Promise.all(
      mergedListForDownload.map(async (el, idx) => {

        // console.log('el: ' + el)
        if (backupEnabled == 'enabled') {
          // if file exists locally
          if (existsSync(el)) {
            console.log('backup file: ' + el + ' exists. Making backup.')
            await backupMod(el)
          } else {
            console.log('backup file: ' + el + ' doesn\'t exist. Skipping.')
          }
        }

        const n = idx + 1
        console.log(idx + 1 + ' - ' + el)

        const axios = Axios.create({
          baseURL: dlUrl,
          timeout: 20000
        })

        dlUrl = setDLUrl()
        const url = dlUrl + el;
        const writer = fs.createWriteStream(modsPath + el);

        axios({
          method: 'get',
          url,
          responseType: 'stream',
          onDownloadProgress: function ({loaded, total, progress, bytes, estimated, rate, download = true}) {
            // Do whatever you want with the Axios progress event
            writeLog(el + ' ' + formatProgress(progress) + '% done', 'info')
            console.log(el + ' ' + formatProgress(progress) + ', ' + formatBytes(bytes) + ' complete. [' + rate + ', ' + loaded + ', ' + total + ']')
          },
        }).then((response) => {
          console.log('Downloading ' + el)
          checkIfDone()
          response.data.pipe(writer);
        })

        writer.on('finish', () => {
          downloadedModsIncr(el)
          console.log('File ' + el + ' downloaded successfully.');
        })
        writer.on('error', (err) => {
          console.error(err);
        })
      })
    )
  })
}










