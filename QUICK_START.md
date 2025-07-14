# 快速启动指南

## 🚀 3步启动项目

### 第1步：解决网络问题
```bash
# 如果遇到网络问题，设置npm镜像源
npm config set registry https://registry.npmjs.org/
npm config set electron_mirror https://npmmirror.com/mirrors/electron/

# 或者使用淘宝镜像（如果上面的不行）
npm config set registry https://registry.npmmirror.com/
```

### 第2步：安装依赖
```bash
# 进入项目目录
cd /Users/louis/Developer/open/subtitle-modifier

# 清理并安装依赖
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### 第3步：启动项目
```bash
# 启动开发服务器
npm run dev
```

## 📱 简化版启动（如果依赖安装失败）

如果依赖安装有问题，可以先尝试运行已有的基础版本：

### 方法1：使用yarn（推荐）
```bash
# 安装yarn
npm install -g yarn

# 使用yarn安装依赖
yarn install

# 启动项目
yarn dev
```

### 方法2：最小化安装
```bash
# 只安装核心依赖
npm install vue@^3.2.47 element-plus@^2.3.9 electron@^29.1.6 vite@^5.0.4 --legacy-peer-deps

# 安装构建工具
npm install @vitejs/plugin-vue vite-plugin-electron typescript vue-tsc --save-dev --legacy-peer-deps

# 启动开发模式
npx vite --host 127.0.0.1 --port 3344
```

## 🔧 常见问题解决

### 问题1：Electron下载失败
```bash
# 设置Electron镜像
export ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"

# 或手动设置npm配置
npm config set electron_mirror https://npmmirror.com/mirrors/electron/
npm config set electron_builder_binaries_mirror https://npmmirror.com/mirrors/electron-builder-binaries/
```

### 问题2：依赖版本冲突
```bash
# 使用强制模式
npm install --force

# 或跳过依赖检查
npm install --legacy-peer-deps --no-audit
```

### 问题3：网络超时
```bash
# 增加超时时间
npm config set timeout 300000

# 使用代理（如果有）
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

## 📋 验证安装

安装成功后，检查以下文件是否存在：
- `node_modules/` 目录
- `node_modules/electron/` 
- `node_modules/vue/`
- `node_modules/element-plus/`

## 🎯 预期效果

启动成功后，您应该看到：
1. 命令行显示 Vite 开发服务器启动信息
2. Electron 窗口自动打开
3. 显示字幕修改器的主界面
4. 三栏布局：文件管理 | 编辑区域 | 样式面板

## 📞 获取帮助

如果仍然遇到问题：

1. **检查Node.js版本**：
   ```bash
   node --version  # 应该 >= 16.0.0
   npm --version   # 应该 >= 8.0.0
   ```

2. **查看详细错误日志**：
   ```bash
   npm run dev --verbose
   ```

3. **清理所有缓存**：
   ```bash
   npm cache clean --force
   rm -rf ~/.npm
   rm -rf node_modules package-lock.json
   ```

4. **使用备用方案**：
   - 尝试使用 `yarn` 代替 `npm`
   - 考虑使用 Docker 环境
   - 在不同网络环境下尝试

## 🔄 重置项目

如果需要完全重置项目状态：
```bash
# 重置到干净状态
git checkout .
git clean -fd
rm -rf node_modules package-lock.json

# 重新开始安装
npm install --legacy-peer-deps
```

---

💡 **提示**: 如果您使用的是公司网络，可能需要配置代理或联系IT部门解决网络访问问题。