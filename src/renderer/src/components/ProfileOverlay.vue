<script setup>
import { ref } from 'vue'
import * as bootstrap from 'bootstrap'


let profiles_newServer = ''
let profile_serverURL = ''
let profile_serverID = ''
let locateProfileFolder = () => window.renderer.locateProfileFolder()
let profileFolderPath = ref('')

const profiles_addServer = () =>  {
  if (profiles_newServer == '') {
    return
  }
  window.electron.ipcRenderer.send('profiles_addServer', profiles_newServer)
}
const getServerList = () => window.electron.ipcRenderer.send('getServerList')

window.electron.ipcRenderer.on('profileFolderDialogLocation', (event, props) => {
  // console.log(props)
  profileFolderPath.value = props[0]
})

window.electron.ipcRenderer.on('IPC_getProfileFolderPath', (event, props) => {
  console.log(props)
  profileFolderPath.value = props.data
})


window.electron.ipcRenderer.on('IPC_profiles_addServer', (event, props) => {
  // console.log('callback!')
  document.getElementById("profiles_serverURL").value = props
  $('#profiles_serverURL').addClass('profiles_inputTextSuccess')
  $('#profiles_serverURL').val('Success!')
  setTimeout(() => {
    $('#profiles_serverURL').removeClass('profiles_inputTextSuccess')
    $('#profiles_serverURL').val('')
  }, 3000)
  profiles_newServer = ''
  getServerList();
  // $('#profiles_serverURL').val('')
})

function profile_openServerInfo(id) {
  // console.log('serverid: ' + id)
  window.electron.ipcRenderer.send('profile_openServerInfo', id)
}

window.electron.ipcRenderer.on('IPC_getServerList', (event, props) => {
  console.log(props[0])
  serverList.value = props[0].data
  // console.log(serverList)
})

window.electron.ipcRenderer.on('IPC_getServerURL', (event, props) => {
  // console.log(props)
  $('#profiles_serverURL_update').val(props.data)
  profile_serverURL = props.data
  $('#profiles_itemID').val(props.id)
  $('#profiles_itemIndex').val(props.index)
})

window.electron.ipcRenderer.on('IPC_profiles_del_server', (event, props) => {
  getServerList()
})

window.electron.ipcRenderer.on('IPC_profiles_update_server', (event, props) => {
  getServerList()
})


getServerList()

$(document).ready(function() {
  $('#overlay_closeButton').on('click', () => {
    $('#overlayBackground').hide()
    $('#profilesOverlay').hide()
  })
})

let serverList = ref('')

function profiles_del_server() {
  let index = $('#profiles_itemIndex').val()
  window.electron.ipcRenderer.send('profiles_del_server', index)
}

function profiles_update_server() {
  if ($('#profiles_serverURL_update').val() == '') {
    return
  }
  console.log(profile_serverURL + ' - ' + $('#profiles_itemID').val())
  window.electron.ipcRenderer.send('profiles_update_server', [{ url: profile_serverURL, id: $('#profiles_itemID').val()}])
}

</script>

<template>
  <div id="overlayBackground" class="overlayBackground">
    <div id="profilesOverlay" class="profilesOverlay centerDiv">
      <div class="overlay_closeButton">
        <button type="button" id="overlay_closeButton" class="btn-close"></button>
      </div>
      <div class="fw-bold text-center">Server Profiles</div>
      <div class="row" id="profilesSettingsWrapper">
        <div class="">Profiles folder: (The server profiles will be stored here) </div>
        <div class="col border rounded">
          <p></p>
          <div class="profiles_formLabel">
            <label for="profiles_serverName">Profiles Folder:</label>
          </div>
          <div class="input-group profiles_addServerWrapper text-end">
            <input v-model="profileFolderPath" type="text" id="profiles_serverURL" class="form-control text-end" />
            <button class="btn btn-success" type="button" id="locateModFolder" @click="locateProfileFolder">Locate</button>
            <!-- <button type="button" class="btn btn-success" id="profiles_saveButton" @click="profiles_addServer">Save</button> -->
          </div>
          <p></p>
        </div>
      </div>

      <div class="row" id="profilesSettingsWrapper">
        <div class="">Add Server: </div>
        <div class="col border rounded">
          <p></p>
          <div class="profiles_formLabel">
            <label for="profiles_serverName">Server URL/IP:</label>
          </div>
          <div class="input-group profiles_addServerWrapper text-end">
            <input type="text" id="profiles_serverURL" class="form-control text-end" v-model="profiles_newServer" />
            <button type="button" class="btn btn-success" id="profiles_saveButton" @click="profiles_addServer">Save</button>
          </div>
          <p></p>
        </div>
      </div>

      <p></p>
      
      <div class="row border rounded" id="profilesSettingsWrapper">
        <div class="col-sm-4">
          <div id="profiles_serverList">
            Servers:
            <ul class="list-group">
              <li v-for="server in serverList" class="list-group-item">
                <a href="#" @click="profile_openServerInfo(server.id)">{{ server.url }}</a>
              </li>
            </ul>
          </div>
        </div>

        <div class="col-sm-8">
          <div id="profile_serverInfo">
            <div>
              <label for="profiles_serverName_update">Server URL/IP:</label>
            </div>
            <div>
              <input type="hidden" id="profiles_itemID" value="" />
              <input type="hidden" id="profiles_itemIndex" value="" />
              <div class="input-group">
                <input type="text" id="profiles_serverURL_update" class="form-control text-end" style="float: left;" v-model="profile_serverURL" />
                <button type="button" class="btn btn-success" id="profile_updateButton" @click="profiles_update_server">Update</button>
              </div>
              <p></p>
              <div class="text-end"><button type="button" class="btn btn-danger" id="profiles_delButton" @click="profiles_del_server">Delete</button></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
