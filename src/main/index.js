import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import Axios from 'axios'
import Config from 'electron-config'
import { autoUpdater } from 'electron-updater'


const config = new Config()
const GH_TOKEN_token = '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'
process.env.GH_TOKEN = GH_TOKEN_token

const spliffz_debug = false // enabled debug console. set to false for production build!

// IPC Send
function writeLog(msg) {
  mainWindow.send('IPC_sendToLog', { data: msg })
  // BrowserWindow.getFocusedWindow().webContents.send('IPC_sendToLog', { data: msg })
}

const opts = {
  width: 780,
  height: 430,
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

let mainWindow = ''
function createWindow(opts) {
  mainWindow = new BrowserWindow(opts)
  // Create the browser window.
  // const mainWindow = new BrowserWindow(opts)
  if (spliffz_debug) {
    mainWindow.webContents.openDevTools()
  }
  mainWindow.setResizable(false)
  mainWindow.setBounds({ width: 780, height: 430 })
  
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
//let win

app.whenReady().then(() => {

  autoUpdater.setFeedURL({
    provider: 'github',
    repo: 'fs25-sync-tool',
    owner: 'Spliffz',
    private: true,
    token: GH_TOKEN_token
  })
  
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

// ### MAIN VARIABLES
const serverUrl = 'http://fs25.rotjong.xyz' 
const dlUrl = serverUrl + '/mods/'
const oneDrivePath = os.homedir+'\\OneDrive\\Documents\\'
let modsPath = ''
if (fs.existsSync(oneDrivePath)) {
  modsPath = os.homedir+'\\OneDrive\\Documents\\My Games\\FarmingSimulator2025\\mods\\'
} else {
  modsPath = os.homedir+'\\Documents\\My Games\\FarmingSimulator2025\\mods\\'
}

// ### MAIN FUNCTIONS
async function getListFromServer() {
  // get json list from server
  writeLog('Getting list from server...')
  const urlPath = '/ajax.php?r=getModList';

  let fetched = await fetch(serverUrl + urlPath)
  if (fetched.ok) {
    const data = await fetched.json()
    //console.log(data)
    return data
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
  writeLog('Mods folder: ' + modsPath)
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
      const urlPath = '/ajax.php?r=checkMod&modname=' + el[0] + '&modhash=' + el[2] + '&size=' + el[3]
      // console.log('urlPath: ' + serverUrl + urlPath)

      let fetched = await fetch(serverUrl + urlPath)
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
        console.log('error!: ' + el + err)
      })
      
    })
  ).then(function(res) {
    //console.log('res: ' + res)
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
  //const localModListArray = localModList[0]
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
  writeLog('Click the check mods button to start.')
}

// ### MAIN CODE

// squirrel startup fix
// if (require('electron-squirrel-startup')) {
//   app.quit()
// }


import fs, { write } from 'fs'
import os from 'os'
import nodePath from 'path'
import md5File from 'md5-file'
import electronSquirrelStartup from 'electron-squirrel-startup'



export async function checkMods() {
  function checkIfDone() {
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
    writeLog('File ' + filename + ' downloaded successfully.');
    checkIfDone()
  }
  
  welcomeText()

  writeLog("Checking mods for updates or additions...")
  writeLog('Please do not close the program.')
  
  // get json list from server
  let getLocalModsListArray = await getLocalModsList()
  let serverModList = await getListFromServer()
  // lets divide: check for new mods first:
  let newModsToAdd = await checkForNewMods(serverModList, getLocalModsListArray)
  //console.log(typeof(newModsToAdd))
  //console.log(newModsToAdd)
  // then check for updates
  let updatableMods = await checkForUpdates(getLocalModsListArray)
  console.log(updatableMods)
  //return
  // merge lists for download
  let mergedListForDownload = mergeListsForDownload(updatableMods, newModsToAdd)
  console.log(mergedListForDownload)
  let downloadedMods = 0;
  let downloadModsFromServer = new Promise(function(resolve, reject) {
    writeLog(mergedListForDownload.length + ' mods to be downloaded.')
  
    Promise.all(
      mergedListForDownload.map(async (el, idx) => {
        const n = idx + 1
        console.log(idx+1 + ' - ' + el)

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
            writeLog(el + ' ' + formatProgress(progress) + '% done')
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









