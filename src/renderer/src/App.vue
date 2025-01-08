<script setup>
import About from './components/About.vue'
import { ref } from 'vue'
import * as bootstrap from 'bootstrap'
import { ModalsContainer, useModal } from 'vue-final-modal'
import Modal_backupDisabled from './components/Modal_backupDisabled.vue'


// ### VARIABLES
let logboxContents = ref('')
let modFolderPath = ref('')
let gameVersion = ref('')
let modserverUrl = ''
let doBackupMods = ref('')
let currentVersion = ref('')
let checkInterval = ref('')
let checkOnInterval = ref('')

// ### IPC Handlers
// const checkMods = () => window.electron.ipcRenderer.send('checkMods')
const checkMods = () => window.renderer.checkMods()
// const welcome = () => window.electron.ipcRenderer.send('welcome')
const saveModserverUrl = () => window.electron.ipcRenderer.send('saveModserverUrl', modserverUrl)
// const saveModserverUrl = () => window.renderer.saveModserverUrl()
const locateModFolder = () => window.renderer.locateModFolder()
// const locateModFolder = () => window.electron.ipcRenderer.send('locateModFolder')
const deleteBackupFiles = () => window.renderer.deleteBackupFiles()
// const deleteBackupFiles = () => window.electron.ipcRenderer.send('deleteBackupFiles')
const getCurrentVersion = window.renderer.getVersionNumber()
 



window.electron.ipcRenderer.on('IPC_doBackupEnabled', (event, props) => {
  // console.log(props)
  doBackupMods.value = props.data
})

window.electron.ipcRenderer.on('IPC_sendFSVersion', (event, props) => {
  // console.log(props)
  gameVersion.value = props.data
})

window.electron.ipcRenderer.on('modFolderDialogLocation', (event, props) => {
  // console.log(props)
  modFolderPath.value = props[0]
})

window.electron.ipcRenderer.on('IPC_sendToLog', (event, props) => {
  //console.log('F: Props.data: ' + props.data)
  writeLog(props.data, props.t)
})

window.electron.ipcRenderer.on('IPC_getModFolderPath', (event, props) => {
  // console.log(props)
  modFolderPath.value = props.data
})

window.electron.ipcRenderer.on('getVersionNumber', (event, props) => {
  currentVersion.value = props.data
})

window.electron.ipcRenderer.on('IPC_checkIntervalStatus', (event, props) => {
  console.log(props)
  checkOnInterval.value = props.data
})

window.electron.ipcRenderer.on('IPC_checkInterval', (event, props) => {
  console.log(props)
  checkInterval.value = props.data
})


const { open, close } = useModal({
  component: Modal_backupDisabled,
  attrs: {
    title: 'Delete Backup files?',
    onYes() {
      deleteBackupFiles()
      // console.log('confirm!')
      close()
    },
    onNo() {
      close()
    }
  },
  slots: {
    default: '<p>Do you want to delete all the backups too?</p>',
  },
})


// ### Functions
function writeLog(msg, type=null) {
  const d = new Date();
  let time = '[' + d.toLocaleTimeString() + ']'
  
  let pre = ''
  if (type == 'info') {
    pre = '[INFO] '
  }
  if (type == 'error') {
    pre = '[ERROR] '
  }
  const txt = time + pre + msg + '\r\n'
  logboxContents.value += txt
  setTimeout(() => {
    const elem = document.getElementById('logbox')
    elem.scrollTop = elem.scrollHeight
  }, 1);
}

window.electron.ipcRenderer.on('getModserverUrl', (event, props) => {
  modserverUrl = props.data
})

function onVersionChange() {
  writeLog('Farming Simulator Version Changed. New version: Farming Simulator ' + gameVersion.value, 'info')
  // const versionChange = 
  window.electron.ipcRenderer.send('versionChange', gameVersion.value)
}

function onDoBackupModsChange() {
  writeLog('Mod Backups ' + doBackupMods.value, 'info')
  if (doBackupMods.value == 'disabled') {
    open().then(() => {
      window.electron.ipcRenderer.send('onDoBackupModsChange', doBackupMods.value)
      return
    })
  }
  window.electron.ipcRenderer.send('onDoBackupModsChange', doBackupMods.value)
}

function onSetCheckInterval() {
  window.electron.ipcRenderer.send('onSetCheckInterval', checkInterval.value)
}

function onSetCheckOnInterval() {
  window.electron.ipcRenderer.send('onSetCheckOnInterval', checkOnInterval.value)
  // window.renderer.onSetCheckOnInterval(checkOnInterval.value)
}

// ### Main Code
window.renderer.welcome()
// welcome()
// document.title = 'FS25 Mod Sync Tool v'+currentVersion.value

</script>

<template>
  <div class="logo_fs25_mst"><img src="./assets/fs25-sync-tool-logo.png" class="img" />
    <div class="actions1">
      <div class="action">
        <input v-model="modserverUrl" type="text" placeholder="http://here.goes.your.server.com" />
      </div>
    </div>

    <div class="actions">
      <div class="action">
        <a target="_blank" rel="noreferrer" @click="saveModserverUrl" class="button_hostname">Save Hostname</a>
      </div>
      <div class="action">
        <a target="_blank" rel="noreferrer" @click="checkMods">Sync Mods</a>
      </div>
    </div>
  </div>

  <div class="">
    <div class="tablistWrapper">
      <ul id="myTab" class="nav nav-tabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link disabled" id="version-tab" data-bs-toggle="tab" data-bs-target="#version-tab-pane" type="button" role="tab" aria-controls="version-tab-pane" aria-selected="true">{{ currentVersion }}</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home-tab-pane" type="button" role="tab" aria-controls="home-tab-pane" aria-selected="true">Log</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="settings-tab" data-bs-toggle="tab" data-bs-target="#settings-tab-pane" type="button" role="tab" aria-controls="settings-tab-pane" aria-selected="false">Settings</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="about-tab" data-bs-toggle="tab" data-bs-target="#about-tab-pane" type="button" role="tab" aria-controls="about-tab-pane" aria-selected="false">About</button>
        </li>
      </ul>
      <div class="tab-content" id="myTabContent">
        <div class="tab-pane fade show active" id="home-tab-pane" role="tabpanel" aria-labelledby="home-tab" tabindex="0">
          <div class="logboxWrapper">
            <textarea id="logbox" v-model="logboxContents" class="logbox"></textarea>
          </div>
        </div>

        <div class="tab-pane fade" id="settings-tab-pane" role="tabpanel" aria-labelledby="settings-tab" tabindex="0">
          <div>
            <table class="table table-dark">
              <tbody>
                <tr>
                  <td>Game version:</td>
                  <td>
                    <select v-model="gameVersion" class="form-select" @change="onVersionChange" aria-label="">
                      <option value="22">Farming Simulator 22</option>
                      <option value="25">Farming Simulator 25</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>Mod Folder Location:</td>
                  <td>
                    <div class="input-group">
                      <input v-model="modFolderPath" type="text" class="form-control" value="modFolderPath" />
                      <button class="btn btn-outline-secondary" type="button" id="locateModFolder" @click="locateModFolder">Locate</button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    Backup mod before downloading? <br />
                    Make sure you have the space available.
                  </td>
                  <td>
                    <div class="input-group">
                      <select v-model="doBackupMods" class="form-select" @change="onDoBackupModsChange" aria-label="">
                      <option value="enabled">Yes</option>
                      <option value="disabled">No</option>
                    </select>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    Periodically check for mods? <br />
                    If so, check every?
                  </td>
                  <td>
                    <div class="input-group">
                      <select v-model="checkOnInterval" class="form-select checkInterval" @change="onSetCheckOnInterval" aria-label="">
                        <option value="enabled">Yes</option>
                        <option value="disabled">No</option>
                      </select>

                      <select v-model="checkInterval" class="form-select checkInterval" @change="onSetCheckInterval" aria-label="">
                        <option value="1">1 minute</option>
                        <option value="5">5 minutes</option>
                        <option value="10">10 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="360">6 hours</option>
                        <option value="1440">24 hours</option>
                      </select>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div><ModalsContainer /></div>
          </div>
        </div>

        <div class="tab-pane fade" id="about-tab-pane" role="tabpanel" aria-labelledby="about-tab" tabindex="0">
          <div class="logboxWrapper">
            <About />
          </div>
        </div>
        
      </div>
    </div>
  </div>

</template>
  