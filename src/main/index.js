import { app, dialog, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import Axios from 'axios'
import Config from 'electron-config'
const config = new Config()
import { autoUpdater } from 'electron-updater'


// -------------------------------------------------------
// ### USER VARIABLES
const spliffz_debug = true // enabled debug console. set to false for production build!

// ### Private Github Repo Config
const isPrivateRepo = false // set to true if you want to use a private github repo.
// These can be empty if isPrivateRepo = false
const gitRepo = 'FS25-Sync-Tool'
const gitOwner = 'Spliffz'
const GH_TOKEN_token = ''






// -------------------------------------------------------
// ### DON'T TOUCH FROM HERE.
// THERE BE DRAGONS AND SUCH. JUST GO AWAY.
// -------------------------------------------------------
let selectedFSVersion = config.get('selectedFSVersion');
if (selectedFSVersion == '') {
  selectedFSVersion = '25'
}
let pre = ''
if (selectedFSVersion == '22') {
  pre = 'fs22_'
} else if (selectedFSVersion == '25') {
  pre = 'fs25_'
}

let modserverUrl = config.get('modserverHostname')
let modFolderPath = config.get(pre + 'modFolderLocation') + '\\'
const serverUrl = modserverUrl 
const dlUrl = serverUrl + '/mods/'
const oneDrivePath = os.homedir + '\\OneDrive\\Documents\\'
let modsPath = ''
if (modFolderPath == '') {
  if (fs.existsSync(oneDrivePath)) {
    modsPath = os.homedir + '\\OneDrive\\Documents\\My Games\\FarmingSimulator2025\\mods\\'
  } else {
    modsPath = os.homedir + '\\Documents\\My Games\\FarmingSimulator2025\\mods\\'
  }
} else {
  modsPath = modFolderPath
}

// -------------------------------------------------------

if (isPrivateRepo) {
  process.env.GH_TOKEN = GH_TOKEN_token
}

// IPC Send
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

const width = 780
const height = 480
const opts = {
  width: width,
  height: height,
  show: false,
  autoHideMenuBar: true,
  ...(process.platform === 'linux' ? { icon } : {}),
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: true,
    preload: join(__dirname, '../preload/index.js'),
    sandbox: false
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
    mainWindow.show()
  })
  mainWindow.on('close', () => {
    config.set('winBounds', mainWindow.getBounds())
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

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
  electronApp.setAppUserModelId('com.electron')

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
    IPC_sendModserverUrl(modserverUrl)
    IPC_sendFSVersion()
    welcomeText()
  })

  ipcMain.on('saveModserverUrl', (event, props) => {
    // console.log(props)
    config.set('modserverHostname', props)
    writeLog('Changed Modserver URL to: ' + props, 'info')
    modserverUrl = config.get('modserverHostname')
  })

  
  ipcMain.on('locateModFolder', (event, props) => {
    // console.log(props)
    dialog.showOpenDialog({
      properties: [
        'openDirectory'
      ]
    }).then(result => {
      // console.log(result)
      config.set(pre + 'modFolderLocation', result.filePaths)
      mainWindow.send('modFolderDialogLocation', result.filePaths)
    })
  })


  ipcMain.on('versionChange', (event, props) => {
    console.log(props)
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





// -------------------------------------------------------
// ### MAIN FUNCTIONS

function setVersion(version) {
  if (version == '22') {
    pre = 'fs22_'
  } else if (version == '25') {
    pre = 'fs25_'
  }
  modFolderPath = config.get(pre + 'modFolderLocation')
  config.set('selectedFSVersion', version)
  selectedFSVersion = version
  modsPath = modFolderPath
  IPC_sendModFolderPath()
  writeLog('Using Folder: ' + modFolderPath, 'info')
}


async function getListFromServer() {
  // get json list from server
  writeLog('Getting list from server...')
  const urlPath = '/ajax.php?getModList'

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
  //console.log('server: ' + servModList.length)
  //console.log(servModList)
  const localModListArray = localList // getLocalModList()
  //console.log('local: ')
  //console.log(localModList)
  // const localModListArray = localModList[0]
  //console.log('local_array: ' + localModListArray.length)
  //console.log(localModListArray)

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
  //console.log('newmods: ')
  //console.log(newModsArray)
  return newModsArray
}

function getLocalModList() {
  writeLog('Mods folder: ' + modsPath, 'info')
  console.log('Mods folder: ' + modsPath)

  let result = []
  let resultArray = []
  let fsize = ''
  let files = fs.readdirSync(modsPath, { withFileTypes: true }) // (error, files) => {

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
      //console.log(file.name);
      // calc hash of file
    }
  })
  
  resultArray.push(result)
  //console.log(resultArray)
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
  writeLog('Hello ' + os.userInfo().username + '!')
  writeLog('Selected: Farming Simulator ' + selectedFSVersion + '.')
  writeLog('Click the check mods button to start.')
}


// ### MAIN CODE

import fs, { write } from 'fs'
import os from 'os'
import nodePath from 'path'
import md5File from 'md5-file'






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
        const n = idx + 1
        console.log(idx + 1 + ' - ' + el)

        const axios = Axios.create({
          baseURL: dlUrl,
          timeout: 20000
        })

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










