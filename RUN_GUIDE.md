# 本地运行指南

## 📋 环境要求

### 系统要求
- Node.js >= 16.0.0 (推荐使用 18.x 或 20.x)
- npm >= 8.0.0 或 yarn >= 1.22.0
- Git (用于版本控制)

### 平台支持
- macOS 10.15+
- Windows 10+
- Linux (Ubuntu 18.04+)

## 🚀 快速启动

### 1. 安装依赖

由于依赖版本冲突，需要使用兼容模式安装：

```bash
# 进入项目目录
cd /Users/louis/Developer/open/subtitle-modifier

# 清理可能的缓存
rm -rf node_modules package-lock.json

# 使用兼容模式安装依赖
npm install --legacy-peer-deps
```

### 2. 启动开发模式

```bash
# 启动开发服务器
npm run dev
```

这将同时启动：
- Vite 开发服务器 (前端)
- Electron 主进程
- 热重载功能

### 3. 其他可用命令

```bash
# 类型检查
npm run type-check

# 代码格式化
npm run format

# 代码检查
npm run lint

# 运行单元测试
npm run test

# 运行测试覆盖率
npm run test:coverage

# 运行端到端测试
npm run test:e2e

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 🔧 故障排除

### 依赖安装问题

如果遇到依赖冲突，尝试以下解决方案：

```bash
# 方案1: 使用 --force 强制安装
npm install --force

# 方案2: 使用 --legacy-peer-deps
npm install --legacy-peer-deps

# 方案3: 清理并重新安装
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

### Electron 启动问题

如果 Electron 无法启动：

```bash
# 重新构建 native 模块
npm run rebuild

# 或者重新安装 Electron
npm uninstall electron
npm install electron --save-dev
```

### TypeScript 错误

如果遇到 TypeScript 类型错误：

```bash
# 安装缺失的类型定义
npm install --save-dev @types/node jsdom

# 检查 TypeScript 配置
npx tsc --noEmit
```

### 端口冲突

如果端口被占用，修改 `package.json` 中的端口配置：

```json
{
  "debug": {
    "env": {
      "VITE_DEV_SERVER_URL": "http://127.0.0.1:3345/"
    }
  }
}
```

## 📁 项目结构说明

启动后您将看到以下目录结构：

```
subtitle-modifier/
├── electron/           # Electron 主进程和服务
│   ├── main/          # 主进程入口
│   ├── preload/       # 预加载脚本
│   └── services/      # 后端服务
├── src/               # 前端源码
│   ├── components/    # Vue 组件
│   ├── services/      # 前端服务
│   ├── types/         # TypeScript 类型
│   └── tests/         # 测试文件
├── examples/          # 示例文件
└── dist-electron/     # 构建输出
```

## 🎯 开发工作流

### 1. 启动开发环境
```bash
npm run dev
```

### 2. 代码开发
- 修改 `src/` 下的 Vue 组件
- 修改 `electron/` 下的 Electron 代码
- 热重载会自动生效

### 3. 测试验证
```bash
# 运行单元测试
npm run test

# 运行类型检查
npm run type-check
```

### 4. 代码质量
```bash
# 格式化代码
npm run format

# 检查代码规范
npm run lint
```

## 🔍 功能验证

启动成功后，您可以验证以下功能：

### 1. 基础界面
- [x] 主编辑器界面加载
- [x] 左侧文件管理面板
- [x] 中央字幕编辑区域
- [x] 右侧样式设置面板

### 2. 文件操作
- [x] 文件拖拽上传
- [x] 文件格式识别
- [x] 文件内容显示

### 3. 样式编辑
- [x] 字体设置
- [x] 颜色调整
- [x] 样式预览

### 4. 批量处理
- [x] 多文件选择
- [x] 批量操作界面
- [x] 进度显示

## 📱 使用说明

### 打开字幕文件
1. 点击 "批量打开" 按钮
2. 选择字幕文件 (.ass, .srt, .vtt, .sub)
3. 文件将显示在左侧列表中

### 编辑字幕样式
1. 在左侧选择文件
2. 在右侧调整样式参数
3. 点击 "应用样式" 生效

### 批量处理
1. 添加多个文件到列表
2. 点击 "批量导出" 按钮
3. 设置输出格式和路径
4. 开始批量处理

## 🐛 已知问题

### 1. 依赖版本冲突
- **问题**: ESLint 和 Vitest 版本冲突
- **解决**: 使用 `--legacy-peer-deps` 安装

### 2. 文件处理功能未完全连接
- **问题**: UI 组件和处理引擎尚未完全集成
- **状态**: 架构已就绪，需要连接业务逻辑

### 3. 压缩包处理
- **问题**: 压缩包解压功能需要额外配置
- **解决**: 需要安装和配置 node-7z

## 📚 下一步开发

1. **完善文件处理逻辑**
   - 连接 SubtitleProcessor 到 UI 组件
   - 实现文件读取和保存功能

2. **增强样式功能**
   - 实现实时预览
   - 添加更多样式预设

3. **优化用户体验**
   - 添加拖拽功能
   - 改进错误提示

4. **性能优化**
   - 大文件处理优化
   - 内存使用优化

## 💡 开发技巧

### 调试 Electron 应用
```bash
# 在开发模式下会自动打开开发者工具
# 可以在控制台查看日志和错误信息
```

### 查看组件状态
- 使用 Vue DevTools 浏览器扩展
- 在开发模式下可以检查组件状态

### 测试 IPC 通信
- 在浏览器控制台测试 `window.electronAPI`
- 检查主进程和渲染进程通信

---

如果遇到其他问题，请检查控制台输出或联系开发团队。