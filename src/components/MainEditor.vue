<template>
  <div class="main-editor">
    <el-container class="editor-container">
      <!-- 头部工具栏 -->
      <el-header class="editor-header">
        <div class="header-left">
          <h2>字幕修改器</h2>
        </div>
        <div class="header-right">
          <el-button-group>
            <el-button type="primary" @click="openFiles">
              📁
              批量打开
            </el-button>
            <el-button @click="exportAll">
              💾
              批量导出
            </el-button>
          </el-button-group>
        </div>
      </el-header>
      
      <!-- 主体内容 -->
      <el-container class="editor-main">
        <!-- 左侧文件管理 -->
        <el-aside class="editor-aside" width="300px">
          <div class="file-manager">
            <el-card class="file-card">
              <template #header>
                <div class="card-header">
                  <span>文件列表</span>
                  <el-badge :value="fileList.length" class="file-count" />
                </div>
              </template>
              
              <div class="file-list">
                <el-scrollbar height="400px">
                  <div 
                    v-for="file in fileList" 
                    :key="file.id"
                    class="file-item"
                    :class="{ active: currentFile?.id === file.id }"
                    @click="selectFile(file)"
                  >
                    <div class="file-info">
                      <div class="file-name">{{ file.name }}</div>
                      <div class="file-meta">
                        <span class="file-format">{{ file.format.toUpperCase() }}</span>
                        <span class="file-events">{{ file.events.length }} 事件</span>
                      </div>
                    </div>
                    <div class="file-actions">
                      <el-button size="small" text @click.stop="removeFile(file.id)">
                        🗑️
                      </el-button>
                    </div>
                  </div>
                </el-scrollbar>
              </div>
              
              <div class="file-actions-footer">
                <el-button size="small" style="width: 100%" @click="clearAllFiles">
                  清空列表
                </el-button>
              </div>
            </el-card>
          </div>
        </el-aside>
        
        <!-- 中央编辑区域 -->
        <el-main class="editor-content">
          <SubtitleEditor 
            :file="currentFile" 
            @fileChange="onFileChange"
            @textChange="onTextChange"
          />
        </el-main>
        
        <!-- 右侧样式面板 -->
        <el-aside class="editor-aside" width="350px">
          <StylePanel 
            :style="currentStyle"
            @styleChange="onStyleChange"
          />
        </el-aside>
      </el-container>
      
      <!-- 底部状态栏 -->
      <el-footer class="editor-footer" height="40px">
        <div class="status-bar">
          <div class="status-left">
            <span v-if="currentFile">
              当前文件: {{ currentFile.name }} | 
              格式: {{ currentFile.format.toUpperCase() }} | 
              事件: {{ currentFile.events.length }}
            </span>
            <span v-else>请选择文件开始编辑</span>
          </div>
          <div class="status-right">
            <span>就绪</span>
          </div>
        </div>
      </el-footer>
    </el-container>
    
    <!-- 批量处理对话框 -->
    <el-dialog
      v-model="batchDialogVisible"
      title="批量处理"
      width="600px"
    >
      <div class="batch-settings">
        <el-form :model="batchSettings" label-width="120px">
          <el-form-item label="输出格式">
            <el-select v-model="batchSettings.outputFormat">
              <el-option label="ASS" value="ass" />
              <el-option label="SRT" value="srt" />
              <el-option label="VTT" value="vtt" />
              <el-option label="SUB" value="sub" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="输出目录">
            <el-input v-model="batchSettings.outputPath" readonly>
              <template #append>
                <el-button @click="selectOutputPath">选择</el-button>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="应用当前样式">
            <el-switch v-model="batchSettings.applyCurrentStyle" />
          </el-form-item>
          
          <el-form-item label="覆盖现有文件">
            <el-switch v-model="batchSettings.overwriteExisting" />
          </el-form-item>
        </el-form>
        
        <div class="batch-progress" v-if="batchProcessing">
          <el-progress 
            :percentage="batchProgress" 
            :format="formatBatchProgress"
          />
          <div class="progress-text">
            {{ batchStatus }}
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="batchDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="startBatchProcess"
          :loading="batchProcessing"
        >
          开始处理
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// 临时注释图标导入来调试
// import { FolderOpened, Download, Delete } from '@element-plus/icons-vue'
import SubtitleEditor from './subtitle/SubtitleEditor.vue'
import StylePanel from './subtitle/StylePanel.vue'
import type { SubtitleFile, ASSStyle, SubtitleFormat } from '../types/subtitle'

const fileList = ref<SubtitleFile[]>([])
const currentFile = ref<SubtitleFile | null>(null)
const currentStyle = ref<Partial<ASSStyle>>({})

const batchDialogVisible = ref(false)
const batchProcessing = ref(false)
const batchProgress = ref(0)
const batchStatus = ref('')

const batchSettings = ref({
  outputFormat: 'ass' as SubtitleFormat,
  outputPath: '',
  applyCurrentStyle: true,
  overwriteExisting: false
})

const selectFile = (file: SubtitleFile) => {
  currentFile.value = file
  if (file.styles.length > 0) {
    currentStyle.value = file.styles[0]
  }
}

const removeFile = (fileId: string) => {
  const index = fileList.value.findIndex(f => f.id === fileId)
  if (index > -1) {
    fileList.value.splice(index, 1)
    
    // 如果删除的是当前文件，清空当前文件
    if (currentFile.value?.id === fileId) {
      currentFile.value = null
      currentStyle.value = {}
    }
  }
}

const clearAllFiles = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有文件吗？', '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    fileList.value = []
    currentFile.value = null
    currentStyle.value = {}
    
    ElMessage.success('已清空文件列表')
  } catch {
    // 用户取消
  }
}

const openFiles = async () => {
  try {
    if (window.electronAPI) {
      const result = await window.electronAPI.file.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [
          { name: 'Subtitle Files', extensions: ['ass', 'srt', 'vtt', 'sub'] },
          { name: 'Archive Files', extensions: ['zip', 'rar', '7z'] }
        ]
      })
      
      if (!result.canceled && result.filePaths.length > 0) {
        for (const filePath of result.filePaths) {
          // TODO: 实现文件解析和添加到列表
          // const processor = new SubtitleProcessor()
          // const content = await window.electronAPI.file.read(filePath)
          // const file = await processor.parseFile(content, format, fileName)
          // fileList.value.push(file)
        }
        
        ElMessage.success(`已添加 ${result.filePaths.length} 个文件`)
      }
    }
  } catch (error) {
    ElMessage.error('打开文件失败: ' + error.message)
  }
}

const exportAll = () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('没有可导出的文件')
    return
  }
  
  batchDialogVisible.value = true
}

const selectOutputPath = async () => {
  try {
    if (window.electronAPI) {
      const result = await window.electronAPI.file.showSaveDialog({
        properties: ['createDirectory', 'showOverwriteConfirmation'],
        defaultPath: '批量导出'
      })
      
      if (!result.canceled && result.filePath) {
        batchSettings.value.outputPath = result.filePath
      }
    }
  } catch (error) {
    ElMessage.error('选择目录失败: ' + error.message)
  }
}

const startBatchProcess = async () => {
  if (!batchSettings.value.outputPath) {
    ElMessage.error('请选择输出目录')
    return
  }
  
  batchProcessing.value = true
  batchProgress.value = 0
  batchStatus.value = '开始批量处理...'
  
  try {
    // TODO: 实现批量处理逻辑
    // const processor = new SubtitleProcessor()
    // const tasks = fileList.value.map(file => ...)
    // const result = await processor.processBatch(tasks)
    
    // 模拟处理进度
    for (let i = 0; i <= 100; i += 10) {
      batchProgress.value = i
      batchStatus.value = `处理中... ${i}%`
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    batchProcessing.value = false
    batchDialogVisible.value = false
    
    ElMessage.success('批量处理完成')
  } catch (error) {
    batchProcessing.value = false
    ElMessage.error('批量处理失败: ' + error.message)
  }
}

const onFileChange = (file: SubtitleFile) => {
  // 更新文件列表中的文件
  const index = fileList.value.findIndex(f => f.id === file.id)
  if (index > -1) {
    fileList.value[index] = file
  }
  
  currentFile.value = file
}

const onTextChange = (eventId: string, text: string) => {
  if (currentFile.value) {
    const event = currentFile.value.events.find(e => e.id === eventId)
    if (event) {
      event.text = text
      currentFile.value.modified = new Date()
    }
  }
}

const onStyleChange = (style: Partial<ASSStyle>) => {
  currentStyle.value = style
  
  if (currentFile.value) {
    // 应用样式到当前文件
    if (currentFile.value.styles.length > 0) {
      Object.assign(currentFile.value.styles[0], style)
    } else {
      // TODO: 创建默认样式并应用
    }
    
    currentFile.value.modified = new Date()
  }
}

const formatBatchProgress = (percentage: number) => {
  return `${percentage}%`
}

onMounted(() => {
  // 初始化
  ElMessage.info('欢迎使用字幕修改器！')
})
</script>

<style scoped>
.main-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.editor-container {
  height: 100%;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #f8f9fa;
}

.header-left h2 {
  margin: 0;
  color: #303133;
}

.editor-main {
  flex: 1;
  overflow: hidden;
}

.editor-aside {
  border-right: 1px solid #e4e7ed;
  padding: 10px;
  background: #fafafa;
}

.editor-aside:last-child {
  border-right: none;
  border-left: 1px solid #e4e7ed;
}

.editor-content {
  padding: 10px;
  overflow: auto;
}

.editor-footer {
  border-top: 1px solid #e4e7ed;
  background: #f8f9fa;
  padding: 0 20px;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  font-size: 12px;
  color: #606266;
}

.file-manager {
  height: 100%;
}

.file-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-count {
  margin-left: 10px;
}

.file-list {
  margin-bottom: 10px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.file-item:hover {
  background: #f0f0f0;
}

.file-item.active {
  background: #e6f7ff;
  border: 1px solid #40a9ff;
}

.file-info {
  flex: 1;
}

.file-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.file-meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #8c8c8c;
}

.file-format {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 500;
}

.file-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.file-item:hover .file-actions {
  opacity: 1;
}

.file-actions-footer {
  padding-top: 10px;
  border-top: 1px solid #e4e7ed;
}

.batch-settings {
  margin-bottom: 20px;
}

.batch-progress {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 4px;
}

.progress-text {
  text-align: center;
  margin-top: 10px;
  color: #606266;
}
</style>