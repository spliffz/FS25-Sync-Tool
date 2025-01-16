<script setup>
import { ref } from 'vue'
// import { open } from 'open'

let currentVersion = ref('')
const getCurrentVersion = window.renderer.getVersionNumber()

// const deleteBackupFiles = () => window.electron.ipcRenderer.send('deleteBackupFiles')
function openLink_Github() {
  window.renderer.openLink_Github()
}
function openLink_Discord() {
  window.renderer.openLink_Discord()
}

// function openLink_Github() {
//   // open('https://github.com/spliffz/FS25-Sync-Tool')
//   shell.openPath('https://github.com/spliffz/FS25-Sync-Tool')
// }

window.electron.ipcRenderer.on('getVersionNumber', (event, props) => {
  currentVersion.value = props.data
})

</script>

<template>
  <div class="row" style="width: 100%;">
    
    <div class="col">
      <div class="about">
        <ul class="about">
          <li class="">FS25 Mod Sync Tool</li>
          <li class="">
            v{{ currentVersion }} -
            <a target="_blank" href="#" rel="noreferrer" @click="openLink_Github()">Github</a>
          </li>
          <li class="">
            Discord: 
            <a href="" target="_blank" rel="noreferrer" @click="openLink_Discord()">
              https://discord.gg/cxs9hcE2X6
            </a>
          </li>
          <li class="">Author: Spliffz [thespliffz@gmail.com]</li>
          <li class="">
            Contributors:
            <ul>
              <li>OSB Crew</li>
              <li>dsmitty166</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>

    <div class="col">
      <p></p>
      <div class="buymeacoffee">
        <a href="https://www.buymeacoffee.com/Spliffz" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"></a>
      </div>

    </div>

  </div>
</template>
