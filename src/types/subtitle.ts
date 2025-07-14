// 字幕相关类型定义

export interface TextShadow {
  color: string;
  offsetX: number;
  offsetY: number;
  blur: number;
}

export interface TextStroke {
  color: string;
  width: number;
}

export interface TransitionSettings {
  duration: number;
  easing: string;
  delay: number;
}

export interface MarginSettings {
  left: number;
  right: number;
  vertical: number;
}

export enum TextAlignment {
  LEFT = 1,
  CENTER = 2,
  RIGHT = 3,
  TOP_LEFT = 7,
  TOP_CENTER = 8,
  TOP_RIGHT = 9,
  MIDDLE_LEFT = 4,
  MIDDLE_CENTER = 5,
  MIDDLE_RIGHT = 6,
  BOTTOM_LEFT = 1,
  BOTTOM_CENTER = 2,
  BOTTOM_RIGHT = 3
}

export interface ASSStyle {
  // 基础样式
  fontName: string;
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  
  // 高级样式
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  textShadow: TextShadow;
  textStroke: TextStroke;
  
  // 位置和对齐
  alignment: TextAlignment;
  margins: MarginSettings;
  
  // 动画效果
  fadeIn: number;
  fadeOut: number;
  transition: TransitionSettings;
  
  // 原始ASS属性
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikeOut: boolean;
  scaleX: number;
  scaleY: number;
  spacing: number;
  angle: number;
  borderStyle: number;
  outline: number;
  shadow: number;
  encoding: number;
}

export interface SubtitleEvent {
  id: string;
  start: number;
  end: number;
  text: string;
  style: string;
  layer: number;
  marginL: number;
  marginR: number;
  marginV: number;
  effect: string;
}

export interface SubtitleFile {
  id: string;
  name: string;
  path: string;
  format: SubtitleFormat;
  styles: ASSStyle[];
  events: SubtitleEvent[];
  info: SubtitleInfo;
  created: Date;
  modified: Date;
}

export interface SubtitleInfo {
  title: string;
  scriptType: string;
  wrapStyle: number;
  playResX: number;
  playResY: number;
  scaledBorderAndShadow: boolean;
  lastStyleStorage: string;
  videoAspectRatio: string;
  videoZoom: number;
  videoPan: number;
}

export enum SubtitleFormat {
  ASS = 'ass',
  SRT = 'srt',
  VTT = 'vtt',
  SUB = 'sub'
}

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  style: Partial<ASSStyle>;
  category: string;
  tags: string[];
  created: Date;
}

export interface ProcessingTask {
  id: string;
  type: TaskType;
  status: TaskStatus;
  progress: number;
  file: SubtitleFile;
  settings: ProcessingSettings;
  error?: string;
  created: Date;
  started?: Date;
  completed?: Date;
}

export enum TaskType {
  PARSE = 'parse',
  STYLE_APPLY = 'style_apply',
  FORMAT_CONVERT = 'format_convert',
  BATCH_PROCESS = 'batch_process',
  EXPORT = 'export'
}

export enum TaskStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface ProcessingSettings {
  applyToAll: boolean;
  preserveOriginal: boolean;
  outputFormat: SubtitleFormat;
  outputPath: string;
  overwrite: boolean;
  customStyle?: Partial<ASSStyle>;
  presetId?: string;
}

export interface BatchProcessingResult {
  total: number;
  successful: number;
  failed: number;
  errors: string[];
  duration: number;
  outputFiles: string[];
}