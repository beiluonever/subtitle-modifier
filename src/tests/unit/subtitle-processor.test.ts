import { describe, it, expect, beforeEach } from 'vitest'
import { SubtitleProcessor } from '../../services/subtitle/SubtitleProcessor'
import { SubtitleFormat } from '../../types/subtitle'

describe('SubtitleProcessor', () => {
  let processor: SubtitleProcessor

  beforeEach(() => {
    processor = new SubtitleProcessor()
  })

  describe('parseFile', () => {
    it('should parse ASS file correctly', async () => {
      const assContent = `[Script Info]
Title: Test Subtitle
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,16,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:01.00,0:00:03.00,Default,,0,0,0,,Hello World`

      const result = await processor.parseFile(assContent, SubtitleFormat.ASS, 'test.ass')
      
      expect(result.format).toBe(SubtitleFormat.ASS)
      expect(result.name).toBe('test.ass')
      expect(result.styles).toHaveLength(1)
      expect(result.styles[0].fontName).toBe('Arial')
      expect(result.styles[0].fontSize).toBe(16)
      expect(result.events).toHaveLength(1)
      expect(result.events[0].text).toBe('Hello World')
    })

    it('should parse SRT file correctly', async () => {
      const srtContent = `1
00:00:01,000 --> 00:00:03,000
Hello World

2
00:00:04,000 --> 00:00:06,000
This is a test`

      const result = await processor.parseFile(srtContent, SubtitleFormat.SRT, 'test.srt')
      
      expect(result.format).toBe(SubtitleFormat.SRT)
      expect(result.name).toBe('test.srt')
      expect(result.events).toHaveLength(2)
      expect(result.events[0].text).toBe('Hello World')
      expect(result.events[1].text).toBe('This is a test')
    })

    it('should throw error for unsupported format', async () => {
      await expect(
        processor.parseFile('content', 'unknown' as SubtitleFormat, 'test.unknown')
      ).rejects.toThrow('Unsupported format: unknown')
    })
  })

  describe('applyStyle', () => {
    it('should apply style to subtitle file', async () => {
      const file = {
        id: 'test',
        name: 'test.ass',
        path: '',
        format: SubtitleFormat.ASS,
        styles: [{
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
        }],
        events: [],
        info: {
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
        },
        created: new Date(),
        modified: new Date()
      }

      const newStyle = {
        fontName: 'Times New Roman',
        fontSize: 20,
        fontColor: '#FF0000'
      }

      const result = await processor.applyStyle(file, newStyle)
      
      expect(result.styles[0].fontName).toBe('Times New Roman')
      expect(result.styles[0].fontSize).toBe(20)
      expect(result.styles[0].fontColor).toBe('#FF0000')
    })
  })

  describe('exportFile', () => {
    it('should export file to ASS format', async () => {
      const file = {
        id: 'test',
        name: 'test.ass',
        path: '',
        format: SubtitleFormat.ASS,
        styles: [{
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
        }],
        events: [{
          id: 'event-1',
          start: 1,
          end: 3,
          text: 'Hello World',
          style: 'Default',
          layer: 0,
          marginL: 0,
          marginR: 0,
          marginV: 0,
          effect: ''
        }],
        info: {
          title: 'Test',
          scriptType: 'v4.00+',
          wrapStyle: 0,
          playResX: 1920,
          playResY: 1080,
          scaledBorderAndShadow: false,
          lastStyleStorage: 'Default',
          videoAspectRatio: '16:9',
          videoZoom: 1,
          videoPan: 0
        },
        created: new Date(),
        modified: new Date()
      }

      const result = await processor.exportFile(file, SubtitleFormat.ASS)
      
      expect(result).toContain('[Script Info]')
      expect(result).toContain('Title: Test')
      expect(result).toContain('[V4+ Styles]')
      expect(result).toContain('[Events]')
      expect(result).toContain('Hello World')
    })

    it('should export file to SRT format', async () => {
      const file = {
        id: 'test',
        name: 'test.srt',
        path: '',
        format: SubtitleFormat.SRT,
        styles: [],
        events: [{
          id: 'event-1',
          start: 1,
          end: 3,
          text: 'Hello World',
          style: 'Default',
          layer: 0,
          marginL: 0,
          marginR: 0,
          marginV: 0,
          effect: ''
        }],
        info: {
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
        },
        created: new Date(),
        modified: new Date()
      }

      const result = await processor.exportFile(file, SubtitleFormat.SRT)
      
      expect(result).toContain('1\n00:00:01,000 --> 00:00:03,000\nHello World')
    })
  })
})