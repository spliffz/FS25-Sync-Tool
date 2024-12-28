<script setup>
import { reactive } from 'vue'

const versions = reactive({ ...window.electron.process.versions })
</script>

<template>
  <ul class="versions">
    <li class="electron-version">FS25 Mod Sync Tool</li>
    <li class="chrome-version">V1.0.7</li>
    <li class="node-version">Author: Spliffz, OSB Crew</li>
  </ul>
</template>
