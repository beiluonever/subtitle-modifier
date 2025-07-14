<template>
  <div class="style-panel">
    <el-card class="style-card">
      <template #header>
        <div class="card-header">
          <span>样式设置</span>
          <el-button-group>
            <el-button size="small" @click="loadPreset">
              📚
              预设
            </el-button>
            <el-button size="small" @click="savePreset">
              ➕
              保存
            </el-button>
          </el-button-group>
        </div>
      </template>
      
      <div class="style-content">
        <el-form :model="styleForm" label-width="100px" size="small">
          <!-- 基础样式 -->
          <el-divider content-position="left">基础样式</el-divider>
          
          <el-form-item label="字体">
            <el-select v-model="styleForm.fontName" placeholder="选择字体">
              <el-option 
                v-for="font in availableFonts" 
                :key="font.value" 
                :label="font.label" 
                :value="font.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="字体大小">
            <el-input-number 
              v-model="styleForm.fontSize" 
              :min="8" 
              :max="72" 
              :step="1"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="字体颜色">
            <el-color-picker 
              v-model="styleForm.fontColor" 
              :predefine="predefineColors"
              show-alpha
            />
          </el-form-item>
          
          <el-form-item label="背景颜色">
            <el-color-picker 
              v-model="styleForm.backgroundColor" 
              :predefine="predefineColors"
              show-alpha
            />
          </el-form-item>
          
          <!-- 高级样式 -->
          <el-divider content-position="left">高级样式</el-divider>
          
          <el-form-item label="行高">
            <el-input-number 
              v-model="styleForm.lineHeight" 
              :min="0.5" 
              :max="3" 
              :step="0.1"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="字间距">
            <el-input-number 
              v-model="styleForm.letterSpacing" 
              :min="0" 
              :max="20" 
              :step="1"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="描边宽度">
            <el-input-number 
              v-model="styleForm.textStroke.width" 
              :min="0" 
              :max="10" 
              :step="0.5"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="描边颜色">
            <el-color-picker 
              v-model="styleForm.textStroke.color" 
              :predefine="predefineColors"
              show-alpha
            />
          </el-form-item>
          
          <!-- 阴影设置 -->
          <el-divider content-position="left">阴影设置</el-divider>
          
          <el-form-item label="阴影颜色">
            <el-color-picker 
              v-model="styleForm.textShadow.color" 
              :predefine="predefineColors"
              show-alpha
            />
          </el-form-item>
          
          <el-form-item label="阴影偏移X">
            <el-input-number 
              v-model="styleForm.textShadow.offsetX" 
              :min="-20" 
              :max="20" 
              :step="1"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="阴影偏移Y">
            <el-input-number 
              v-model="styleForm.textShadow.offsetY" 
              :min="-20" 
              :max="20" 
              :step="1"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="阴影模糊">
            <el-input-number 
              v-model="styleForm.textShadow.blur" 
              :min="0" 
              :max="20" 
              :step="1"
              style="width: 100%"
            />
          </el-form-item>
          
          <!-- 位置和对齐 -->
          <el-divider content-position="left">位置和对齐</el-divider>
          
          <el-form-item label="对齐方式">
            <el-select v-model="styleForm.alignment" placeholder="选择对齐方式">
              <el-option label="左下" :value="1" />
              <el-option label="中下" :value="2" />
              <el-option label="右下" :value="3" />
              <el-option label="左中" :value="4" />
              <el-option label="中中" :value="5" />
              <el-option label="右中" :value="6" />
              <el-option label="左上" :value="7" />
              <el-option label="中上" :value="8" />
              <el-option label="右上" :value="9" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="左边距">
            <el-input-number 
              v-model="styleForm.margins.left" 
              :min="0" 
              :max="500" 
              :step="10"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="右边距">
            <el-input-number 
              v-model="styleForm.margins.right" 
              :min="0" 
              :max="500" 
              :step="10"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="垂直边距">
            <el-input-number 
              v-model="styleForm.margins.vertical" 
              :min="0" 
              :max="200" 
              :step="5"
              style="width: 100%"
            />
          </el-form-item>
          
          <!-- 样式属性 -->
          <el-divider content-position="left">样式属性</el-divider>
          
          <el-form-item label="样式">
            <el-checkbox-group v-model="styleOptions">
              <el-checkbox label="bold">粗体</el-checkbox>
              <el-checkbox label="italic">斜体</el-checkbox>
              <el-checkbox label="underline">下划线</el-checkbox>
              <el-checkbox label="strikeOut">删除线</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          
          <el-form-item label="缩放X">
            <el-input-number 
              v-model="styleForm.scaleX" 
              :min="50" 
              :max="200" 
              :step="5"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="缩放Y">
            <el-input-number 
              v-model="styleForm.scaleY" 
              :min="50" 
              :max="200" 
              :step="5"
              style="width: 100%"
            />
          </el-form-item>
          
          <el-form-item label="旋转角度">
            <el-input-number 
              v-model="styleForm.angle" 
              :min="-360" 
              :max="360" 
              :step="1"
              style="width: 100%"
            />
          </el-form-item>
        </el-form>
        
        <div class="action-buttons">
          <el-button type="primary" @click="applyStyle">应用样式</el-button>
          <el-button @click="resetStyle">重置</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
// 临时注释图标导入
// import { Collection, Plus } from '@element-plus/icons-vue'
import type { ASSStyle } from '../../types/subtitle'

interface Props {
  style?: Partial<ASSStyle>
}

interface Emits {
  (e: 'styleChange', style: Partial<ASSStyle>): void
}

const props = withDefaults(defineProps<Props>(), {
  style: () => ({})
})

const emit = defineEmits<Emits>()

const styleForm = ref<Partial<ASSStyle>>({
  fontName: 'Arial',
  fontSize: 16,
  fontColor: '#FFFFFF',
  backgroundColor: '#000000',
  lineHeight: 1.2,
  letterSpacing: 0,
  textStroke: {
    color: '#000000',
    width: 0
  },
  textShadow: {
    color: '#000000',
    offsetX: 0,
    offsetY: 0,
    blur: 0
  },
  alignment: 2,
  margins: {
    left: 0,
    right: 0,
    vertical: 0
  },
  bold: false,
  italic: false,
  underline: false,
  strikeOut: false,
  scaleX: 100,
  scaleY: 100,
  angle: 0
})

const styleOptions = ref<string[]>([])

const availableFonts = ref([
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Microsoft YaHei', label: '微软雅黑' },
  { value: '华文楷体', label: '华文楷体' },
  { value: 'OPlusSans 3.0 Medium', label: 'OPlusSans 3.0 Medium' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Calibri', label: 'Calibri' },
  { value: 'Verdana', label: 'Verdana' }
])

const predefineColors = ref([
  '#FFFFFF',
  '#000000',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
  '#FFA500',
  '#800080',
  '#FFC0CB',
  '#A52A2A'
])

const updateStyleOptions = () => {
  styleOptions.value = []
  if (styleForm.value.bold) styleOptions.value.push('bold')
  if (styleForm.value.italic) styleOptions.value.push('italic')
  if (styleForm.value.underline) styleOptions.value.push('underline')
  if (styleForm.value.strikeOut) styleOptions.value.push('strikeOut')
}

// 监听样式变化
watch(() => props.style, (newStyle) => {
  if (newStyle) {
    Object.assign(styleForm.value, newStyle)
    updateStyleOptions()
  }
}, { immediate: true, deep: true })

// 监听样式选项变化
watch(styleOptions, (newOptions) => {
  styleForm.value.bold = newOptions.includes('bold')
  styleForm.value.italic = newOptions.includes('italic')
  styleForm.value.underline = newOptions.includes('underline')
  styleForm.value.strikeOut = newOptions.includes('strikeOut')
}, { deep: true })

const applyStyle = () => {
  emit('styleChange', { ...styleForm.value })
  ElMessage.success('样式已应用')
}

const resetStyle = () => {
  styleForm.value = {
    fontName: 'Arial',
    fontSize: 16,
    fontColor: '#FFFFFF',
    backgroundColor: '#000000',
    lineHeight: 1.2,
    letterSpacing: 0,
    textStroke: {
      color: '#000000',
      width: 0
    },
    textShadow: {
      color: '#000000',
      offsetX: 0,
      offsetY: 0,
      blur: 0
    },
    alignment: 2,
    margins: {
      left: 0,
      right: 0,
      vertical: 0
    },
    bold: false,
    italic: false,
    underline: false,
    strikeOut: false,
    scaleX: 100,
    scaleY: 100,
    angle: 0
  }
  styleOptions.value = []
  ElMessage.info('样式已重置')
}

const loadPreset = () => {
  // TODO: 实现预设加载功能
  ElMessage.info('预设加载功能开发中...')
}

const savePreset = () => {
  // TODO: 实现预设保存功能
  ElMessage.info('预设保存功能开发中...')
}
</script>

<style scoped>
.style-panel {
  height: 100%;
}

.style-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.style-content {
  height: calc(100% - 60px);
  overflow: auto;
}

.action-buttons {
  margin-top: 20px;
  text-align: center;
}

.action-buttons .el-button {
  margin: 0 10px;
}

:deep(.el-divider) {
  margin: 15px 0;
}

:deep(.el-form-item) {
  margin-bottom: 15px;
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>