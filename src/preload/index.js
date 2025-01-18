import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('renderer', {
      checkMods: () => {
        ipcRenderer.send('checkMods')
      },
      welcome: () => {
        ipcRenderer.send('welcome')
      },
      locateModFolder: () => {
        ipcRenderer.send('locateModFolder')
      },
      locateProfileFolder: () => {
        ipcRenderer.send('locateProfileFolder')
      },
      saveModserverUrl: (func) => {
        ipcRenderer.send('saveModserverUrl', (event, args) => func(event, args))
      },
      runModManagerServerChange: (func) => {
        ipcRenderer.send('runModManagerServerChange', (event, args) => func(event, args))
      },
      deleteBackupFiles: () => {
        ipcRenderer.send('deleteBackupFiles')
      },
      versionChange: (func) => {
        ipcRenderer.send('versionChange', (event, args) => func(event, args))
      },
      getVersionNumber: () => {
        ipcRenderer.send('getVersionNumber')
      },
      openLink_Github: () => {
        ipcRenderer.send('openLink_Github')
      },
      openLink_Discord: () => {
        ipcRenderer.send('openLink_Discord')
      }
    })
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
