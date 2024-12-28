<script setup>
import Versions from './components/Versions.vue'
import { ref } from 'vue'
// import Config from 'electron-config'
// const config = new Config()


// ### VARIABLES
let logboxContents = ref('');


// ### Functions
const checkMods = () => window.electron.ipcRenderer.send('checkMods')
const welcome = () => window.electron.ipcRenderer.send('welcome')
//const ipcHandle = () => window.electron.ipcRenderer.send('ping')
// const addToLogTest = () => writeLog(generateString(getRandomInt(32)))
let modserverUrl = ''
const saveModserverUrl = () => window.electron.ipcRenderer.send('saveModserverUrl', modserverUrl)

const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function generateString(length) {
  let result = ' '
  const charactersLength = characters.length
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }

  return result
}


window.electron.ipcRenderer.on('IPC_sendToLog', (event, props) => {
  console.log('F: Props.data: ' + props.data)
  writeLog(props.data)
})

function writeLog(msg) {
  const txt = msg + "<br />"
  logboxContents.value += txt
  setTimeout(() => {
    const elem = document.getElementById('logbox')
    elem.scrollTop = elem.scrollHeight
  }, 1);
}

window.electron.ipcRenderer.on('getModserverUrl', (event, props) => {
  console.log(props)
  modserverUrl = props.data
})


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
      <a target="_blank" rel="noreferrer" @click="saveModserverUrl">Save Hostname</a>
    </div>
    <div class="action">
      <a target="_blank" rel="noreferrer" @click="checkMods">Check Mods</a>
    </div>
  </div>
</div>

  <p></p>
  <div class="logboxWrapper">
    <div v-html="logboxContents" id="logbox" class="logbox"></div>
  </div>

<Versions />
</template>
  