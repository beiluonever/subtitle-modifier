import { promises as fs } from 'fs';
import * as path from 'path';
import { dialog } from 'electron';

export class FileService {
  private allowedExtensions = ['.ass', '.srt', '.vtt', '.sub', '.zip', '.rar', '.7z'];
  private maxFileSize = 100 * 1024 * 1024; // 100MB

  /**
   * 安全地读取文件
   */
  async readFile(filePath: string): Promise<string> {
    try {
      // 验证文件路径
      this.validateFilePath(filePath);
      
      // 检查文件是否存在
      await this.checkFileExists(filePath);
      
      // 检查文件大小
      await this.checkFileSize(filePath);
      
      // 读取文件内容
      const content = await fs.readFile(filePath, 'utf8');
      return content;
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  /**
   * 安全地写入文件
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      // 验证文件路径
      this.validateFilePath(filePath);
      
      // 确保目录存在
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      
      // 写入文件
      await fs.writeFile(filePath, content, 'utf8');
    } catch (error) {
      throw new Error(`Failed to write file: ${error.message}`);
    }
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 显示打开文件对话框
   */
  async showOpenDialog(options: any): Promise<any> {
    const result = await dialog.showOpenDialog({
      ...options,
      filters: [
        { name: 'Subtitle Files', extensions: ['ass', 'srt', 'vtt', 'sub'] },
        { name: 'Archive Files', extensions: ['zip', 'rar', '7z'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      // 验证所选文件
      for (const filePath of result.filePaths) {
        this.validateFilePath(filePath);
      }
    }
    
    return result;
  }

  /**
   * 显示保存文件对话框
   */
  async showSaveDialog(options: any): Promise<any> {
    const result = await dialog.showSaveDialog({
      ...options,
      filters: [
        { name: 'Subtitle Files', extensions: ['ass', 'srt', 'vtt', 'sub'] },
        { name: 'Archive Files', extensions: ['zip'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (!result.canceled && result.filePath) {
      // 验证保存路径
      this.validateFilePath(result.filePath);
    }
    
    return result;
  }

  /**
   * 获取文件统计信息
   */
  async getFileStats(filePath: string): Promise<any> {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory()
      };
    } catch (error) {
      throw new Error(`Failed to get file stats: ${error.message}`);
    }
  }

  /**
   * 创建临时文件
   */
  async createTempFile(content: string, extension: string): Promise<string> {
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    
    const tempFileName = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
    const tempFilePath = path.join(tempDir, tempFileName);
    
    await this.writeFile(tempFilePath, content);
    return tempFilePath;
  }

  /**
   * 清理临时文件
   */
  async cleanupTempFiles(): Promise<void> {
    const tempDir = path.join(process.cwd(), 'temp');
    try {
      const files = await fs.readdir(tempDir);
      for (const file of files) {
        if (file.startsWith('temp_')) {
          await fs.unlink(path.join(tempDir, file));
        }
      }
    } catch (error) {
      // 忽略清理错误
      console.warn('Failed to cleanup temp files:', error.message);
    }
  }

  /**
   * 获取文件MIME类型
   */
  getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.ass': 'text/plain',
      '.srt': 'text/plain',
      '.vtt': 'text/vtt',
      '.sub': 'text/plain',
      '.zip': 'application/zip',
      '.rar': 'application/rar',
      '.7z': 'application/x-7z-compressed'
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }

  // 私有方法

  /**
   * 验证文件路径
   */
  private validateFilePath(filePath: string): void {
    // 检查路径是否为空
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid file path');
    }
    
    // 规范化路径
    const normalizedPath = path.normalize(filePath);
    
    // 检查路径遍历攻击
    if (normalizedPath.includes('..')) {
      throw new Error('Path traversal is not allowed');
    }
    
    // 检查文件扩展名
    const ext = path.extname(normalizedPath).toLowerCase();
    if (!this.allowedExtensions.includes(ext)) {
      throw new Error(`File extension ${ext} is not allowed`);
    }
    
    // 检查绝对路径
    if (!path.isAbsolute(normalizedPath)) {
      throw new Error('Only absolute paths are allowed');
    }
  }

  /**
   * 检查文件是否存在
   */
  private async checkFileExists(filePath: string): Promise<void> {
    try {
      await fs.access(filePath);
    } catch {
      throw new Error('File does not exist');
    }
  }

  /**
   * 检查文件大小
   */
  private async checkFileSize(filePath: string): Promise<void> {
    const stats = await fs.stat(filePath);
    if (stats.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum limit of ${this.maxFileSize / (1024 * 1024)}MB`);
    }
  }
}