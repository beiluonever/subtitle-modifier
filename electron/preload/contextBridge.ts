import { contextBridge, ipcRenderer } from 'electron';

// 定义安全的API接口
export interface ElectronAPI {
  // 文件操作
  file: {
    read: (filePath: string) => Promise<string>;
    write: (filePath: string, content: string) => Promise<void>;
    exists: (filePath: string) => Promise<boolean>;
    showOpenDialog: (options: any) => Promise<any>;
    showSaveDialog: (options: any) => Promise<any>;
  };
  
  // 字幕处理
  subtitle: {
    process: (content: string, settings: any) => Promise<string>;
    validate: (content: string, format: string) => Promise<boolean>;
  };
  
  // 批量处理
  batch: {
    processFiles: (files: string[], settings: any) => Promise<any>;
    extractArchive: (archivePath: string) => Promise<string[]>;
    createArchive: (files: string[], outputPath: string) => Promise<void>;
  };
  
  // 系统信息
  system: {
    platform: () => Promise<string>;
    version: () => Promise<string>;
    showNotification: (title: string, message: string) => Promise<void>;
  };
  
  // 窗口操作
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
    setTitle: (title: string) => Promise<void>;
  };
}

// 创建安全的API
const electronAPI: ElectronAPI = {
  file: {
    read: (filePath: string) => ipcRenderer.invoke('file:read', filePath),
    write: (filePath: string, content: string) => ipcRenderer.invoke('file:write', filePath, content),
    exists: (filePath: string) => ipcRenderer.invoke('file:exists', filePath),
    showOpenDialog: (options: any) => ipcRenderer.invoke('file:showOpenDialog', options),
    showSaveDialog: (options: any) => ipcRenderer.invoke('file:showSaveDialog', options)
  },
  
  subtitle: {
    process: (content: string, settings: any) => ipcRenderer.invoke('subtitle:process', content, settings),
    validate: (content: string, format: string) => ipcRenderer.invoke('subtitle:validate', content, format)
  },
  
  batch: {
    processFiles: (files: string[], settings: any) => ipcRenderer.invoke('batch:processFiles', files, settings),
    extractArchive: (archivePath: string) => ipcRenderer.invoke('batch:extractArchive', archivePath),
    createArchive: (files: string[], outputPath: string) => ipcRenderer.invoke('batch:createArchive', files, outputPath)
  },
  
  system: {
    platform: () => ipcRenderer.invoke('system:platform'),
    version: () => ipcRenderer.invoke('system:version'),
    showNotification: (title: string, message: string) => ipcRenderer.invoke('system:showNotification', title, message)
  },
  
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    setTitle: (title: string) => ipcRenderer.invoke('window:setTitle', title)
  }
};

// 暴露安全的API到渲染进程
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// 类型声明
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}