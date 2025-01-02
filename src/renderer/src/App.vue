<script setup>
import Versions from './components/Versions.vue'
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

// ### Functions
const checkMods = () => window.electron.ipcRenderer.send('checkMods')
const welcome = () => window.electron.ipcRenderer.send('welcome')
const saveModserverUrl = () => window.electron.ipcRenderer.send('saveModserverUrl', modserverUrl)
const locateModFolder = () => window.electron.ipcRenderer.send('locateModFolder')
const deleteBackupFiles = () => window.electron.ipcRenderer.send('deleteBackupFiles')




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



function writeLog(msg, type=null) {
  let pre = ''
  if (type == 'info') {
    pre = '[INFO] '
  }
  if (type == 'error') {
    pre = '[ERROR] '
  }
  const txt = pre + msg + '\r\n'
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

// ### Main Code
welcome()

</script>

<template>
  <div class="logo_fs25_mst"><img src="./assets/fs25-sync-tool-logo.png" class="img" />
    <div class="actions1">
    <div class="action">
      <input v-model="modserverUrl" type="text" placeholder="http://here.goes.your.website" />
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
        <button class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home-tab-pane" type="button" role="tab" aria-controls="home-tab-pane" aria-selected="true">Log</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile-tab-pane" type="button" role="tab" aria-controls="profile-tab-pane" aria-selected="false">Settings</button>
      </li>
    </ul>
    <div class="tab-content" id="myTabContent">
      <div class="tab-pane fade show active" id="home-tab-pane" role="tabpanel" aria-labelledby="home-tab" tabindex="0">
        <div class="logboxWrapper">
          <textarea v-model="logboxContents" id="logbox" class="logbox"></textarea>
        </div>
      </div>
      <div class="tab-pane fade" id="profile-tab-pane" role="tabpanel" aria-labelledby="profile-tab" tabindex="0">
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
                  <option value="enabled">Yes.</option>
                  <option value="disabled">No.</option>
                </select>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
          <div><ModalsContainer /></div>
        </div>
      </div>
    </div>
  </div>
</div>


  <p></p>

<Versions />
</template>
  