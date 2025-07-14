<script setup lang="ts">
import { onMounted } from 'vue'
// import SimpleTest from './components/SimpleTest.vue'
import MainEditor from './components/MainEditor.vue'
import { ElMessage } from 'element-plus'

onMounted(() => {
  // 检查Electron环境
  if (window.electronAPI) {
    console.log('Electron API is available')
  } else {
    console.warn('Electron API is not available')
    ElMessage.warning('部分功能可能受限，请在Electron环境中运行')
  }
})
</script>

<template>
  <div id="app">
    <!-- <SimpleTest /> -->
    <MainEditor />
  </div>
</template>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
  margin: 0;
  padding: 0;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  height: 100vh;
  overflow: hidden;
}

html {
  height: 100vh;
}
</style>
