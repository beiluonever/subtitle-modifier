<template>
  <div class="simple-test">
    <h1>简单测试组件</h1>
    <el-button type="primary" @click="testClick">测试按钮</el-button>
    <p>当前时间: {{ currentTime }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const currentTime = ref(new Date().toLocaleString())

const testClick = () => {
  ElMessage.success('按钮点击成功！')
  currentTime.value = new Date().toLocaleString()
}

onMounted(() => {
  console.log('SimpleTest component mounted')
  ElMessage.info('组件加载成功')
})
</script>

<style scoped>
.simple-test {
  padding: 20px;
  text-align: center;
}

h1 {
  color: #409eff;
  margin-bottom: 20px;
}

p {
  margin-top: 20px;
  color: #666;
}
</style>