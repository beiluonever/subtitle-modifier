import { parse, stringify } from 'ass-compiler';
import { 
  SubtitleFile, 
  SubtitleFormat, 
  ASSStyle, 
  ProcessingSettings,
  ProcessingTask,
  TaskType,
  TaskStatus,
  BatchProcessingResult 
} from '../../types/subtitle';

export class SubtitleProcessor {
  private taskQueue: ProcessingTask[] = [];
  private processing = false;

  /**
   * 解析字幕文件
   */
  async parseFile(content: string, format: SubtitleFormat, filename: string): Promise<SubtitleFile> {
    try {
      switch (format) {
        case SubtitleFormat.ASS:
          return this.parseASSFile(content, filename);
        case SubtitleFormat.SRT:
          return this.parseSRTFile(content, filename);
        case SubtitleFormat.VTT:
          return this.parseVTTFile(content, filename);
        case SubtitleFormat.SUB:
          return this.parseSUBFile(content, filename);
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      throw new Error(`Failed to parse ${format} file: ${error.message}`);
    }
  }

  /**
   * 解析ASS文件
   */
  private parseASSFile(content: string, filename: string): SubtitleFile {
    const parsed = parse(content);
    
    const styles: ASSStyle[] = parsed.styles?.style?.map(style => ({
      fontName: style.Fontname || 'Arial',
      fontSize: parseInt(style.Fontsize) || 16,
      fontColor: this.parseColor(style.PrimaryColour) || '#FFFFFF',
      backgroundColor: this.parseColor(style.BackColour) || '#000000',
      lineHeight: 1.2,
      letterSpacing: parseFloat(style.Spacing) || 0,
      wordSpacing: 0,
      textShadow: {
        color: this.parseColor(style.BackColour) || '#000000',
        offsetX: parseFloat(style.Shadow) || 0,
        offsetY: parseFloat(style.Shadow) || 0,
        blur: 0
      },
      textStroke: {
        color: this.parseColor(style.OutlineColour) || '#000000',
        width: parseFloat(style.Outline) || 0
      },
      alignment: parseInt(style.Alignment) || 2,
      margins: {
        left: parseInt(style.MarginL) || 0,
        right: parseInt(style.MarginR) || 0,
        vertical: parseInt(style.MarginV) || 0
      },
      fadeIn: 0,
      fadeOut: 0,
      transition: {
        duration: 0,
        easing: 'linear',
        delay: 0
      },
      bold: style.Bold === '-1',
      italic: style.Italic === '-1',
      underline: style.Underline === '-1',
      strikeOut: style.StrikeOut === '-1',
      scaleX: parseFloat(style.ScaleX) || 100,
      scaleY: parseFloat(style.ScaleY) || 100,
      spacing: parseFloat(style.Spacing) || 0,
      angle: parseFloat(style.Angle) || 0,
      borderStyle: parseInt(style.BorderStyle) || 1,
      outline: parseFloat(style.Outline) || 0,
      shadow: parseFloat(style.Shadow) || 0,
      encoding: parseInt(style.Encoding) || 1
    })) || [];

    const events = parsed.events?.dialogue?.map((event, index) => ({
      id: `event-${index}`,
      start: this.parseTime(event.Start),
      end: this.parseTime(event.End),
      text: event.Text?.raw || '',
      style: event.Style || 'Default',
      layer: parseInt(event.Layer) || 0,
      marginL: parseInt(event.MarginL) || 0,
      marginR: parseInt(event.MarginR) || 0,
      marginV: parseInt(event.MarginV) || 0,
      effect: event.Effect || ''
    })) || [];

    return {
      id: `file-${Date.now()}`,
      name: filename,
      path: '',
      format: SubtitleFormat.ASS,
      styles,
      events,
      info: {
        title: parsed.info?.Title || '',
        scriptType: parsed.info?.ScriptType || 'v4.00+',
        wrapStyle: parseInt(parsed.info?.WrapStyle) || 0,
        playResX: parseInt(parsed.info?.PlayResX) || 1920,
        playResY: parseInt(parsed.info?.PlayResY) || 1080,
        scaledBorderAndShadow: parsed.info?.ScaledBorderAndShadow === 'yes',
        lastStyleStorage: parsed.info?.LastStyleStorage || 'Default',
        videoAspectRatio: parsed.info?.VideoAspectRatio || '16:9',
        videoZoom: parseFloat(parsed.info?.VideoZoom) || 1,
        videoPan: parseFloat(parsed.info?.VideoPan) || 0
      },
      created: new Date(),
      modified: new Date()
    };
  }

  /**
   * 解析SRT文件（基础实现）
   */
  private parseSRTFile(content: string, filename: string): SubtitleFile {
    const events = [];
    const blocks = content.trim().split('\n\n');
    
    for (const block of blocks) {
      const lines = block.split('\n');
      if (lines.length >= 3) {
        const index = parseInt(lines[0]);
        const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
        if (timeMatch) {
          const start = this.parseSRTTime(timeMatch[1]);
          const end = this.parseSRTTime(timeMatch[2]);
          const text = lines.slice(2).join('\n');
          
          events.push({
            id: `event-${index}`,
            start,
            end,
            text,
            style: 'Default',
            layer: 0,
            marginL: 0,
            marginR: 0,
            marginV: 0,
            effect: ''
          });
        }
      }
    }

    return {
      id: `file-${Date.now()}`,
      name: filename,
      path: '',
      format: SubtitleFormat.SRT,
      styles: [this.getDefaultStyle()],
      events,
      info: this.getDefaultInfo(),
      created: new Date(),
      modified: new Date()
    };
  }

  /**
   * 解析VTT文件（基础实现）
   */
  private parseVTTFile(content: string, filename: string): SubtitleFile {
    // 基础VTT解析实现
    const events = [];
    const lines = content.split('\n');
    let currentEvent = null;
    let index = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.includes('-->')) {
        const timeMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/);
        if (timeMatch) {
          currentEvent = {
            id: `event-${index++}`,
            start: this.parseVTTTime(timeMatch[1]),
            end: this.parseVTTTime(timeMatch[2]),
            text: '',
            style: 'Default',
            layer: 0,
            marginL: 0,
            marginR: 0,
            marginV: 0,
            effect: ''
          };
        }
      } else if (currentEvent && line && !line.startsWith('NOTE')) {
        currentEvent.text += (currentEvent.text ? '\n' : '') + line;
      } else if (currentEvent && !line) {
        events.push(currentEvent);
        currentEvent = null;
      }
    }

    if (currentEvent) {
      events.push(currentEvent);
    }

    return {
      id: `file-${Date.now()}`,
      name: filename,
      path: '',
      format: SubtitleFormat.VTT,
      styles: [this.getDefaultStyle()],
      events,
      info: this.getDefaultInfo(),
      created: new Date(),
      modified: new Date()
    };
  }

  /**
   * 解析SUB文件（基础实现）
   */
  private parseSUBFile(content: string, filename: string): SubtitleFile {
    // 基础SUB解析实现
    const events = [];
    const lines = content.split('\n');
    let index = 0;

    for (const line of lines) {
      const match = line.match(/\{(\d+)\}\{(\d+)\}(.+)/);
      if (match) {
        const start = parseInt(match[1]) / 100; // 转换为秒
        const end = parseInt(match[2]) / 100;
        const text = match[3];

        events.push({
          id: `event-${index++}`,
          start,
          end,
          text,
          style: 'Default',
          layer: 0,
          marginL: 0,
          marginR: 0,
          marginV: 0,
          effect: ''
        });
      }
    }

    return {
      id: `file-${Date.now()}`,
      name: filename,
      path: '',
      format: SubtitleFormat.SUB,
      styles: [this.getDefaultStyle()],
      events,
      info: this.getDefaultInfo(),
      created: new Date(),
      modified: new Date()
    };
  }

  /**
   * 应用样式到字幕文件
   */
  async applyStyle(file: SubtitleFile, style: Partial<ASSStyle>): Promise<SubtitleFile> {
    const updatedFile = { ...file };
    
    // 更新样式
    if (updatedFile.styles.length > 0) {
      updatedFile.styles[0] = { ...updatedFile.styles[0], ...style };
    } else {
      updatedFile.styles.push({ ...this.getDefaultStyle(), ...style });
    }
    
    updatedFile.modified = new Date();
    return updatedFile;
  }

  /**
   * 导出字幕文件
   */
  async exportFile(file: SubtitleFile, format: SubtitleFormat): Promise<string> {
    switch (format) {
      case SubtitleFormat.ASS:
        return this.exportAsASS(file);
      case SubtitleFormat.SRT:
        return this.exportAsSRT(file);
      case SubtitleFormat.VTT:
        return this.exportAsVTT(file);
      case SubtitleFormat.SUB:
        return this.exportAsSUB(file);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * 导出为ASS格式
   */
  private exportAsASS(file: SubtitleFile): string {
    const assData = {
      info: {
        Title: file.info.title,
        ScriptType: file.info.scriptType,
        WrapStyle: file.info.wrapStyle.toString(),
        PlayResX: file.info.playResX.toString(),
        PlayResY: file.info.playResY.toString(),
        ScaledBorderAndShadow: file.info.scaledBorderAndShadow ? 'yes' : 'no'
      },
      styles: {
        style: file.styles.map(style => this.styleToASS(style))
      },
      events: {
        dialogue: file.events.map(event => ({
          Layer: event.layer.toString(),
          Start: this.formatTime(event.start),
          End: this.formatTime(event.end),
          Style: event.style,
          Name: '',
          MarginL: event.marginL.toString(),
          MarginR: event.marginR.toString(),
          MarginV: event.marginV.toString(),
          Effect: event.effect,
          Text: {
            raw: event.text,
            parsed: []
          }
        }))
      }
    };

    return stringify(assData);
  }

  /**
   * 导出为SRT格式
   */
  private exportAsSRT(file: SubtitleFile): string {
    return file.events.map((event, index) => {
      const start = this.formatSRTTime(event.start);
      const end = this.formatSRTTime(event.end);
      return `${index + 1}\n${start} --> ${end}\n${event.text}\n`;
    }).join('\n');
  }

  /**
   * 导出为VTT格式
   */
  private exportAsVTT(file: SubtitleFile): string {
    let content = 'WEBVTT\n\n';
    
    for (const event of file.events) {
      const start = this.formatVTTTime(event.start);
      const end = this.formatVTTTime(event.end);
      content += `${start} --> ${end}\n${event.text}\n\n`;
    }
    
    return content;
  }

  /**
   * 导出为SUB格式
   */
  private exportAsSUB(file: SubtitleFile): string {
    return file.events.map(event => {
      const start = Math.round(event.start * 100);
      const end = Math.round(event.end * 100);
      return `{${start}}{${end}}${event.text}`;
    }).join('\n');
  }

  /**
   * 批量处理任务
   */
  async processBatch(tasks: ProcessingTask[]): Promise<BatchProcessingResult> {
    const startTime = Date.now();
    let successful = 0;
    let failed = 0;
    const errors: string[] = [];
    const outputFiles: string[] = [];

    for (const task of tasks) {
      try {
        task.status = TaskStatus.PROCESSING;
        task.started = new Date();
        
        // 根据任务类型处理
        switch (task.type) {
          case TaskType.STYLE_APPLY:
            if (task.settings.customStyle) {
              await this.applyStyle(task.file, task.settings.customStyle);
            }
            break;
          case TaskType.FORMAT_CONVERT:
            await this.exportFile(task.file, task.settings.outputFormat);
            break;
        }
        
        task.status = TaskStatus.COMPLETED;
        task.completed = new Date();
        task.progress = 100;
        successful++;
        
        if (task.settings.outputPath) {
          outputFiles.push(task.settings.outputPath);
        }
      } catch (error) {
        task.status = TaskStatus.FAILED;
        task.error = error.message;
        failed++;
        errors.push(`${task.file.name}: ${error.message}`);
      }
    }

    const duration = Date.now() - startTime;
    
    return {
      total: tasks.length,
      successful,
      failed,
      errors,
      duration,
      outputFiles
    };
  }

  // 辅助方法

  private parseColor(color: string): string {
    if (!color) return '#FFFFFF';
    
    // ASS颜色格式：&H<BB><GG><RR> 或 &H<AA><BB><GG><RR>
    const match = color.match(/&H([0-9A-Fa-f]{6,8})/);
    if (match) {
      const hex = match[1];
      if (hex.length === 6) {
        // BGR to RGB
        return `#${hex.substr(4, 2)}${hex.substr(2, 2)}${hex.substr(0, 2)}`;
      } else if (hex.length === 8) {
        // ABGR to RGB (忽略alpha)
        return `#${hex.substr(6, 2)}${hex.substr(4, 2)}${hex.substr(2, 2)}`;
      }
    }
    
    return '#FFFFFF';
  }

  private parseTime(time: string): number {
    const match = time.match(/(\d+):(\d{2}):(\d{2})\.(\d{2})/);
    if (match) {
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const seconds = parseInt(match[3]);
      const centiseconds = parseInt(match[4]);
      return hours * 3600 + minutes * 60 + seconds + centiseconds / 100;
    }
    return 0;
  }

  private parseSRTTime(time: string): number {
    const match = time.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
    if (match) {
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const seconds = parseInt(match[3]);
      const milliseconds = parseInt(match[4]);
      return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
    }
    return 0;
  }

  private parseVTTTime(time: string): number {
    const match = time.match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
    if (match) {
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const seconds = parseInt(match[3]);
      const milliseconds = parseInt(match[4]);
      return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
    }
    return 0;
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const centiseconds = Math.floor((seconds % 1) * 100);
    
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  }

  private formatSRTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
  }

  private formatVTTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  }

  private styleToASS(style: ASSStyle): any {
    return {
      Name: 'Default',
      Fontname: style.fontName,
      Fontsize: style.fontSize.toString(),
      PrimaryColour: this.colorToASS(style.fontColor),
      SecondaryColour: this.colorToASS(style.fontColor),
      OutlineColour: this.colorToASS(style.textStroke.color),
      BackColour: this.colorToASS(style.backgroundColor),
      Bold: style.bold ? '-1' : '0',
      Italic: style.italic ? '-1' : '0',
      Underline: style.underline ? '-1' : '0',
      StrikeOut: style.strikeOut ? '-1' : '0',
      ScaleX: style.scaleX.toString(),
      ScaleY: style.scaleY.toString(),
      Spacing: style.spacing.toString(),
      Angle: style.angle.toString(),
      BorderStyle: style.borderStyle.toString(),
      Outline: style.outline.toString(),
      Shadow: style.shadow.toString(),
      Alignment: style.alignment.toString(),
      MarginL: style.margins.left.toString(),
      MarginR: style.margins.right.toString(),
      MarginV: style.margins.vertical.toString(),
      Encoding: style.encoding.toString()
    };
  }

  private colorToASS(color: string): string {
    if (!color.startsWith('#')) return '&H00FFFFFF';
    
    const hex = color.substring(1);
    if (hex.length === 6) {
      // RGB to BGR
      const r = hex.substr(0, 2);
      const g = hex.substr(2, 2);
      const b = hex.substr(4, 2);
      return `&H00${b}${g}${r}`;
    }
    
    return '&H00FFFFFF';
  }

  private getDefaultStyle(): ASSStyle {
    return {
      fontName: 'Arial',
      fontSize: 16,
      fontColor: '#FFFFFF',
      backgroundColor: '#000000',
      lineHeight: 1.2,
      letterSpacing: 0,
      wordSpacing: 0,
      textShadow: {
        color: '#000000',
        offsetX: 0,
        offsetY: 0,
        blur: 0
      },
      textStroke: {
        color: '#000000',
        width: 0
      },
      alignment: 2,
      margins: {
        left: 0,
        right: 0,
        vertical: 0
      },
      fadeIn: 0,
      fadeOut: 0,
      transition: {
        duration: 0,
        easing: 'linear',
        delay: 0
      },
      bold: false,
      italic: false,
      underline: false,
      strikeOut: false,
      scaleX: 100,
      scaleY: 100,
      spacing: 0,
      angle: 0,
      borderStyle: 1,
      outline: 0,
      shadow: 0,
      encoding: 1
    };
  }

  private getDefaultInfo() {
    return {
      title: '',
      scriptType: 'v4.00+',
      wrapStyle: 0,
      playResX: 1920,
      playResY: 1080,
      scaledBorderAndShadow: false,
      lastStyleStorage: 'Default',
      videoAspectRatio: '16:9',
      videoZoom: 1,
      videoPan: 0
    };
  }
}