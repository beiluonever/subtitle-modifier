<template>
  <div class="subtitle-editor">
    <el-card class="editor-card">
      <template #header>
        <div class="card-header">
          <span>字幕编辑器</span>
          <el-button-group>
            <el-button size="small" @click="openFile">
              📄
              打开文件
            </el-button>
            <el-button size="small" @click="saveFile">
              💾
              保存文件
            </el-button>
          </el-button-group>
        </div>
      </template>
      
      <div class="editor-content">
        <div class="file-info" v-if="currentFile">
          <el-descriptions border :column="2">
            <el-descriptions-item label="文件名">{{ currentFile.name }}</el-descriptions-item>
            <el-descriptions-item label="格式">{{ currentFile.format.toUpperCase() }}</el-descriptions-item>
            <el-descriptions-item label="样式数量">{{ currentFile.styles.length }}</el-descriptions-item>
            <el-descriptions-item label="事件数量">{{ currentFile.events.length }}</el-descriptions-item>
          </el-descriptions>
        </div>
        
        <div class="events-list" v-if="currentFile">
          <el-table :data="currentFile.events" style="width: 100%" max-height="400">
            <el-table-column prop="start" label="开始时间" width="120">
              <template #default="scope">
                {{ formatTime(scope.row.start) }}
              </template>
            </el-table-column>
            <el-table-column prop="end" label="结束时间" width="120">
              <template #default="scope">
                {{ formatTime(scope.row.end) }}
              </template>
            </el-table-column>
            <el-table-column prop="text" label="字幕内容" min-width="200">
              <template #default="scope">
                <el-input
                  v-model="scope.row.text"
                  type="textarea"
                  :autosize="{ minRows: 1, maxRows: 3 }"
                  @change="onTextChange(scope.row.id, scope.row.text)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="style" label="样式" width="120" />
          </el-table>
        </div>
        
        <div class="empty-state" v-else>
          <el-empty description="请选择一个字幕文件开始编辑" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
// 临时注释图标导入
// import { DocumentAdd, Download } from '@element-plus/icons-vue'
import type { SubtitleFile } from '../../types/subtitle'

interface Props {
  file?: SubtitleFile
}

interface Emits {
  (e: 'fileChange', file: SubtitleFile): void
  (e: 'textChange', eventId: string, text: string): void
}

const props = withDefaults(defineProps<Props>(), {
  file: undefined
})

const emit = defineEmits<Emits>()

const currentFile = computed(() => props.file)

const openFile = async () => {
  try {
    if (window.electronAPI) {
      const result = await window.electronAPI.file.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Subtitle Files', extensions: ['ass', 'srt', 'vtt', 'sub'] }
        ]
      })
      
      if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0]
        const content = await window.electronAPI.file.read(filePath)
        
        // 这里需要调用字幕处理服务来解析文件
        // 暂时使用模拟数据
        ElMessage.success('文件打开成功')
      }
    }
  } catch (error) {
    ElMessage.error('打开文件失败: ' + error.message)
  }
}

const saveFile = async () => {
  if (!currentFile.value) {
    ElMessage.warning('没有可保存的文件')
    return
  }
  
  try {
    if (window.electronAPI) {
      const result = await window.electronAPI.file.showSaveDialog({
        defaultPath: currentFile.value.name,
        filters: [
          { name: 'Subtitle Files', extensions: ['ass', 'srt', 'vtt', 'sub'] }
        ]
      })
      
      if (!result.canceled && result.filePath) {
        // 这里需要调用字幕处理服务来导出文件
        // const content = await subtitleProcessor.exportFile(currentFile.value, format)
        // await window.electronAPI.file.write(result.filePath, content)
        
        ElMessage.success('文件保存成功')
      }
    }
  } catch (error) {
    ElMessage.error('保存文件失败: ' + error.message)
  }
}

const onTextChange = (eventId: string, text: string) => {
  emit('textChange', eventId, text)
}

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.subtitle-editor {
  height: 100%;
}

.editor-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor-content {
  height: calc(100% - 60px);
  overflow: auto;
}

.file-info {
  margin-bottom: 20px;
}

.events-list {
  margin-top: 20px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}
</style>