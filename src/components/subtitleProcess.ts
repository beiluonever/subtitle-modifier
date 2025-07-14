// 这个文件已被重构，新的字幕处理逻辑在 src/services/subtitle/SubtitleProcessor.ts
// 保留这个文件是为了向后兼容，但建议使用新的架构

import { parse, stringify } from "ass-compiler";
import * as JSZip from "jszip";

const isEnglish = new RegExp("[A-Za-z]+");
const isChinese = new RegExp("[\u4E00-\u9FA5]+");
const globalConfig = {
  prefix: "changed-",
  fontName: "华文楷体",
  fontSize: "10",
  marginV: "40",
};

type AssStyleSetting = {
  Name: string;
  Fontname: string;
  Fontsize: string;
  PrimaryColour: string;
  SecondaryColour: string;
  OutlineColour: string;
  BackColour: string;
  Bold: string;
  Italic: string;
  Underline: string;
  StrikeOut: string;
  ScaleX: string;
  ScaleY: string;
  Spacing: string;
  Angle: string;
  BorderStyle: string;
  Outline: string;
  Shadow: string;
  Alignment: string;
  MarginL: string;
  MarginR: string;
  MarginV: string;
  Encoding: string;
};

type SubtitleSetting = {
  globalFontSize?: number;
  globalFontNmae?: string;
  fontSize: number;
  fontName: string;
  color?: string;
  EngFontSize?: number;
  EngFontName?: string;
  EngColor?: string;
  marginV?: number;
};

function getFileExtension(filename: string): string {
  const name = filename.split(".").pop();
  if (name != undefined) {
    return name.toLowerCase();
  }
  return "";
}
function extractFileName(filePath: string) {
  const fileName = filePath.replace(/^.*[\\/]/, ""); // 从路径中提取文件名
  return fileName;
}

// function getContentFromURL(url : string, callback: Function) {
//   //v3 use fetch
//   fetch(url).then(function(response){
//       if (xhr.readyState === 4) {
//           if (xhr.status === 200) {
//               var response = xhr.response;
//               console.log('response size is :', response.length)
//               callback(null, response);
//           } else {
//               callback(new Error('Request failed. Status code: ' + xhr.status));
//           }
//       }
//   })
//   // const xhr = new XMLHttpRequest()
//   // xhr.responseType = 'blob'
//   // xhr.onreadystatechange = function () {
//   //   if (xhr.readyState === 4) {
//   //     if (xhr.status === 200) {
//   //       const response = xhr.response
//   //       console.log('response size is :', response.length)
//   //       callback(null, response)
//   //     } else {
//   //       callback(new Error('Request failed. Status code: ' + xhr.status))
//   //     }
//   //   }
//   // }
//   // xhr.open('GET', url, true)
//   // xhr.send()
// }

function Uint8ArrayToString(fileData: Uint8Array) {
  let dataString = "";
  for (let i = 0; i < fileData.length; i++) {
    dataString += String.fromCharCode(fileData[i]);
  }

  return dataString;
}

function processAssFileAndDownload(
  e: Error,
  content: string,
  fileName: string,
  settings: SubtitleSetting
) {
  console.log("start process Ass");
  const json_ass = parse(content);

  json_ass.styles.style[0]["Fontsize"] = settings.globalFontSize
    ? settings.globalFontSize.toString()
    : globalConfig.fontSize;
  json_ass.styles.style[0]["Fontname"] = settings.globalFontNmae
    ? settings.globalFontNmae
    : globalConfig.fontName;
  json_ass.styles.style[0]["MarginV"] = settings.marginV
    ? settings.marginV.toString()
    : globalConfig.marginV;

  let color = "";
  if (settings.color && settings.color.startsWith("#")) {
    for (let char of settings.color.toString()) {
      if (char != "#") {
        color = char + color;
      }
    }
  }

  json_ass.events.dialogue.forEach((d) => {
    const paresd = d.Text.parsed;
    d.Text.raw = "";
    paresd.forEach((p, i) => {
      if (isChinese.test(p.text)) {
        p.tags = [
          { fn: settings.fontName },
          { fs: settings.fontSize.toString() },
          { c1: color != "" ? "H" + color : "HFFFFFF" },
        ];
      }
      if (p.text != "\\N" && p.text != "\\\\N" && isEnglish.test(p.text)) {
        //{\fnOPlusSans 3.0 Medium\fs9\1c&H00FFFF&}
        p.tags = [
          { fn: settings.EngFontName },
          { fs: settings.EngFontSize ? settings.EngFontSize.toString() : "9" },
          { c1: settings.EngColor ? settings.EngColor.toString() : "H00FFFF" },
        ];
      }
    });
  });

  const blob = new Blob([stringify(json_ass)], { type: "text/plain" });
  const fileURL = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = fileURL;
  downloadLink.download = globalConfig.prefix + fileName;
  downloadLink.textContent = "Download ";
  downloadLink.hidden = true;
  downloadLink;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  URL.revokeObjectURL(fileURL);
}

function processZipFileAndDownload(
  e: Error,
  zipData: BinaryType,
  settings: SubtitleSetting
) {
  JSZip.loadAsync(zipData)
    .then(function (zip): void {
      console.log("zipData size is :" + zipData.length);
      // 遍历 ZIP 包中的每个文件
      zip.forEach(function (relativePath, zipEntry) {
        if (!zipEntry.dir) {
          // 解压非目录文件
          zipEntry.async("uint8array").then(function (fileData) {
            // 处理文件数据
            console.log("filename:", zipEntry.name);
            let zipEntryExtension = getFileExtension(zipEntry.name);
            if (zipEntryExtension == "ass") {
              console.log("content:", fileData);
              let encodedString = Uint8ArrayToString(new Uint8Array(fileData));
              let decodedString = decodeURIComponent(escape(encodedString)); //没有这一步中文会乱码
              processAssFileAndDownload(
                e,
                decodedString,
                zipEntry.name,
                settings
              );
            }
          });
        }
      });
    })
    .catch(function (error) {
      console.error("解压 ZIP 包时出错:", error);
    });
}

/**
 * 
Field 1:      Name. The name of the Style. Case sensitive. Cannot include commas.
Field 2:      Fontname. The fontname as used by Windows. Case-sensitive.
Field 3:      Fontsize.
Field 4:      PrimaryColour. A long integer BGR (blue-green-red)  value. ie. the byte order in the hexadecimal equivelent of this number is BBGGRR
                 This is the colour that a subtitle will normally appear in.
Field 5:      SecondaryColour. A long integer BGR (blue-green-red)  value. ie. the byte order in the hexadecimal equivelent of this number is BBGGRR
                 This colour may be used instead of the Primary colour when a subtitle is automatically shifted to prevent an onscreen collsion, to distinguish the different subtitles.
Field 6:      OutlineColor (TertiaryColour). A long integer BGR (blue-green-red)  value. ie. the byte order in the hexadecimal equivelent of this number is BBGGRR
                 This colour may be used instead of the Primary or Secondary colour when a subtitle is automatically shifted to prevent an onscreen collsion, to distinguish the different subtitles.
Field 7:     BackColour. This is the colour of the subtitle outline or shadow, if these are used. A long integer BGR (blue-green-red)  value. ie. the byte order in the hexadecimal equivelent of this number is BBGGRR.
Field 4-7:  The color format contains the alpha channel, too. (AABBGGRR)
Field 8:      Bold. This defines whether text is bold (true) or not (false). -1 is True, 0 is False. This is independant of the Italic attribute - you can have have text which is both bold and italic.
Field 9:      Italic. This defines whether text is italic (true) or not (false). -1 is True, 0 is False. This is independant of the bold attribute - you can have have text which is both bold and italic.
Field 9.1:  Underline. [-1 or 0]
Field 9.2:  Strikeout. [-1 or 0]
Field 9.3:  ScaleX. Modifies the width of the font. [percent]
Field 9.4:  ScaleY. Modifies the height of the font. [percent]
Field 9.5:  Spacing. Extra space between characters. [pixels]
Field 9.6:  Angle.  The origin of the rotation is defined by the alignment. Can be a floating point number. [degrees]
Field 10:    BorderStyle. 1=Outline + drop shadow, 3=Opaque box
Field 11:    Outline. If BorderStyle is 1,  then this specifies the width of the outline around the text, in pixels.
Values may be 0, 1, 2, 3 or 4.
Field 12:    Shadow. If BorderStyle is 1,  then this specifies the depth of the drop shadow behind the text, in pixels. Values may be 0, 1, 2, 3 or 4. Drop shadow is always used in addition to an outline - SSA will force an outline of 1 pixel if no outline width is given.
Field 13:    Alignment. This sets how text is "justified" within the Left/Right onscreen margins, and also the vertical placing. Values may be 1=Left, 2=Centered, 3=Right. Add 4 to the value for a "Toptitle". Add 8 to the value for a "Midtitle".
eg. 5 = left-justified toptitle
Field 13:   Alignment, but after the layout of the numpad (1-3 sub, 4-6 mid, 7-9 top).
Field 14:    MarginL. This defines the Left Margin in pixels. It is the distance from the left-hand edge of the screen.The three onscreen margins (MarginL, MarginR, MarginV) define areas in which the subtitle text will be displayed.
Field 15:    MarginR. This defines the Right Margin in pixels. It is the distance from the right-hand edge of the screen. The three onscreen margins (MarginL, MarginR, MarginV) define areas in which the subtitle text will be displayed.
Field 16:    MarginV. This defines the vertical Left Margin in pixels.
For a subtitle, it is the distance from the bottom of the screen.
For a toptitle, it is the distance from the top of the screen.
For a midtitle, the value is ignored - the text will be vertically centredField 17:    AlphaLevel. This defines the transparency of the text. SSA does not use this yet.
Field 17:   Not present in ASS.
Field 18:    Encoding. This specifies the font character set or encoding and on multi-lingual Windows installations it provides access to characters used in multiple than one languages. It is usually 0 (zero) for English (Western, ANSI) Windows.
                 When the file is Unicode, this field is useful during file format conversions.

example: Chs,宋体,&H00F5F5F5,&HF00000000,$H00FFCD26,&H0000000000,0,0,0,0,100,100,0,0,0,1,1,2,0,0,5,1
         Eng,Microsoft YaHei,14,&H0014D7F8,&HF0000000,&H00000000,&H00000000,0,0,0,0,100,100,0,0,0,1,1,2,0,0,10,1 

         
*/
function getConfigFromAssStyle(styleString: string) {
  var [
    Name,
    Fontname,
    Fontsize,
    PrimaryColour,
    SecondaryColour,
    OutlineColour,
    BackColour,
    Bold,
    Italic,
    Underline,
    StrikeOut,
    ScaleX,
    ScaleY,
    Spacing,
    Angle,
    BorderStyle,
    Outline,
    Shadow,
    Alignment,
    MarginL,
    MarginR,
    MarginV,
    Encoding,
  ] = styleString.split(",");
  var assStyle: AssStyleSetting = {Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow,  Alignment, MarginL, MarginR, MarginV, Encoding}
  return assStyle;
}

function assStyleToString(assStyle : AssStyleSetting){
  return assStyle.Name+ ',' + assStyle.Fontname+ ',' + assStyle.Fontsize+ ',' + assStyle.PrimaryColour+ ',' + assStyle.SecondaryColour+ ',' + assStyle.OutlineColour+ ',' + assStyle.BackColour+ ',' + assStyle.Bold+ ',' + assStyle.Italic+ ',' + assStyle.Underline+ ',' + assStyle.StrikeOut+ ',' + assStyle.ScaleX+ ',' + assStyle.ScaleY+ ',' + assStyle.Spacing+ ',' + assStyle.Angle+ ',' + assStyle.BorderStyle+ ',' + assStyle.Outline+ ',' + assStyle.Shadow+ ',' + assStyle. Alignment+ ',' + assStyle.MarginL+ ',' + assStyle.MarginR+ ',' + assStyle.MarginV+ ',' + assStyle.Encoding;
}

export {
  processAssFileAndDownload,
  getFileExtension,
  extractFileName,
  processZipFileAndDownload,
  Uint8ArrayToString,
  globalConfig,
};
export type { SubtitleSetting };
