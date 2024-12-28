<script setup>
import Versions from './components/Versions.vue'
import { ref } from 'vue'

// ### VARIABLES
let logboxContents = ref('');


// ### Functions
const checkMods = () => window.electron.ipcRenderer.send('checkMods')
const welcome = () => window.electron.ipcRenderer.send('welcome')
//const ipcHandle = () => window.electron.ipcRenderer.send('ping')
// const addToLogTest = () => writeLog(generateString(getRandomInt(32)))

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


welcome()

</script>

<template>
  <div class="actions">
    <div class="action">
      <a target="_blank" rel="noreferrer" @click="checkMods">Check Mods</a>
    </div>
<!--    <div class="action">
      <a target="_blank" rel="noreferrer" @click="addToLogTest">add to log test</a>
    </div>
  -->
  </div>
  <p></p>
  <div v-html="logboxContents" id="logbox" class="logbox"></div>

<Versions />
</template>
  