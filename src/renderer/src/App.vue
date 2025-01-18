<script setup>
import About from './components/About.vue'
import ProfileOverlay from './components/ProfileOverlay.vue'
import { ref } from 'vue'
import * as bootstrap from 'bootstrap'
import { ModalsContainer, useModal } from 'vue-final-modal'
import Modal_backupDisabled from './components/Modal_backupDisabled.vue'
import { Dropdown, Tooltip, Menu, vTooltip } from 'floating-vue'


// ### VARIABLES
let logboxContents = ref('')
let modFolderPath = ref('')
let gameVersion = ref('')
let modserverUrl = ''
let doBackupMods = ref('')
let currentVersion = ref('')
let checkInterval = ref('')
let checkOnInterval = ref('')
let minimizeToTray = ref('')
let anonymousStats = ref('')
let availableServers = ref('')

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

let serverList = ref('')
const getServerList = () => window.electron.ipcRenderer.send('getServerList')
window.electron.ipcRenderer.on('IPC_getServerList', (event, props) => {
  console.log(props[0])
  serverList.value = props[0].data
  availableServers.value = modserverUrl
  // console.log(serverList)
})

window.electron.ipcRenderer.on('IPC_anonymousStats', (event, props) => {
  anonymousStats.value = props.data
})

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

window.electron.ipcRenderer.on('IPC_minimizeToTray', (event, props) => {
  console.log(props)
  minimizeToTray.value = props.data
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
  let time = '[' + d.toLocaleTimeString() + '] '
  
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

function onMinimizaToTrayChange() {
  writeLog('Minimize to tray now ' + minimizeToTray.value, 'info')
  // const versionChange = 
  window.electron.ipcRenderer.send('IPC_minimizeToTray', minimizeToTray.value)
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

function onAnonymousStatsChange() {
  window.electron.ipcRenderer.send('onAnonymousStatsChange', anonymousStats.value)
}

function onSetCheckInterval() {
  window.electron.ipcRenderer.send('onSetCheckInterval', checkInterval.value)
}

function onSetCheckOnInterval() {
  window.electron.ipcRenderer.send('onSetCheckOnInterval', checkOnInterval.value)
  // window.renderer.onSetCheckOnInterval(checkOnInterval.value)
}

function openServerProfiles() {
  window.electron.ipcRenderer.send('IPC_openServerProfiles')
  $('#overlayBackground').show()
  $('#profilesOverlay').show()
}

function onNewServerSelected() {
  // console.log(availableServers)
  // console.log($('#availableServers2').val())
  window.electron.ipcRenderer.send('saveModserverUrl', $('#availableServers2').val())
  // mod manager magic
  // window.electron.ipcRenderer.send('runModManagerServerChange')
}

// ### Main Code
window.renderer.welcome()

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))


getServerList()


</script>

<template>
  
  <ProfileOverlay />

  <div class="logo_fs25_mst"><img src="./assets/fs25-sync-tool-logo.png" class="img" />
    <div class="actions1">
      <div class="action">
        <select v-model="availableServers" id="availableServers2" class="form-select" @change="onNewServerSelected">
          <option v-for="(server, key) in serverList">{{ key }}. {{ server.url }}</option>
        </select>
        <!-- <input v-model="modserverUrl" type="text" placeholder="http://here.goes.your.server.com" /> -->
        <!-- <div class="tooltipx tooltipx_bottom">
          <img src="../src/assets/Question.png" class="icon" />
          <span class="tooltiptext_bottom">
            Here goes the IP/URL of the server running FS25-mod-server.
          </span>
        </div> -->
      </div>
    </div>

    <div class="actions">
      <!-- <div class="action">
        <a target="_blank" rel="noreferrer" @click="saveModserverUrl" class="button_hostname">Save Hostname</a>
      </div> -->
      <div class="action">
        <a target="_blank" rel="noreferrer" @click="checkMods">Sync Mods</a>
      </div>
      <div class="action">
        <a target="_blank" rel="noreferrer" @click="openServerProfiles">Profiles</a>
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
            <textarea id="logbox" v-model="logboxContents" readonly class="logbox"></textarea>
          </div>
        </div>

        <div class="tab-pane fade" id="settings-tab-pane" role="tabpanel" aria-labelledby="settings-tab" tabindex="0">
          <div>
            <table class="table table-dark">
              <tbody>
                <tr>
                  <td class="settings_td">
                    Game version:</td>
                  <td class="settings_td">
                    <select v-model="gameVersion" class="form-select" @change="onVersionChange" aria-label="">
                      <option value="22">Farming Simulator 22</option>
                      <option value="25">Farming Simulator 25</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td class="settings_td">
                    Mod Folder Location:</td>
                  <td class="settings_td">
                    <div class="input-group">
                      <input v-model="modFolderPath" type="text" class="form-control" value="modFolderPath" />
                      <button class="btn btn-outline-secondary" type="button" id="locateModFolder" @click="locateModFolder">Locate</button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="settings_td">
                    Backup mod before downloading? <br />
                    Make sure you have the space available.
                  </td>
                  <td class="settings_td">
                    <div class="input-group">
                      <select v-model="doBackupMods" class="form-select" @change="onDoBackupModsChange" aria-label="">
                      <option value="enabled">Yes</option>
                      <option value="disabled">No</option>
                    </select>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="settings_td">
                    Periodically check for mods? <br />
                    If so, check every?
                  </td>
                  <td class="settings_td">
                    <div class="input-group">
                      <select v-model="checkOnInterval" class="form-select checkInterval" @change="onSetCheckOnInterval" aria-label="">
                        <option value="enabled">Yes</option>
                        <option value="disabled">No</option>
                      </select>

                      <select v-model="checkInterval" class="form-select checkInterval" @change="onSetCheckInterval" aria-label="">
                        <!-- <option value="1">1 minute</option> -->
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
                <tr>
                  <td class="settings_td">
                    Minimize to tray?
                  </td>
                  <td class="settings_td">
                    <select v-model="minimizeToTray" class="form-select" @change="onMinimizaToTrayChange" aria-label="">
                      <option value="enabled">Yes</option>
                      <option value="disabled">No</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td class="settings_td">
                    <span class=""> 
                      Anonymous Statistics (HardwareID and IP):
                      <div class="tooltipx">
                        <img src="../src/assets/Question.png" class="icon" />
                        <span class="tooltiptext">
                          Added minimum anonymous statistics: Hardware ID and IP address. I've no other way of knowing how many times the program is used and I like to have a minimum amount of statistics so I know a bit more about the usage. That's all. All the code is contained in `/src/main/stats.js` if you want to take a look. It's better than implementing Google Analytics.
                        </span>
                      </div>
                    </span>
                  </td>
                  <td class="settings_td">
                    <select v-model="anonymousStats" class="form-select" @change="onAnonymousStatsChange" aria-label="">
                      <option value="enabled">Yes</option>
                      <option value="disabled">No</option>
                    </select>
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
  