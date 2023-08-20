import { parse, stringify } from 'ass-compiler'
import * as JSZip from 'jszip';

const prefix = 'changed-'
const fontName = '华文楷体'
const fontSize = '10'
const marginV = '40'
const isEnglish = new RegExp('[A-Za-z]+')
const isChinese = new RegExp('[\u4E00-\u9FA5]+')

function getFileExtension(filename: string): string {
  const name = filename.split('.').pop()
  if(name != undefined){
    return name.toLowerCase()
  }
  return '';
}
function extractFileName(filePath: string) {
  const fileName = filePath.replace(/^.*[\\/]/, '') // 从路径中提取文件名
  return fileName
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
  let dataString = ''
  for (let i = 0; i < fileData.length; i++) {
    dataString += String.fromCharCode(fileData[i])
  }

  return dataString
}

function processAssFileAndDownload(e: Error, content: string, fileName: string) {
  console.log('start process Ass')
  const json_ass = parse(content)

  json_ass.styles.style[0]['Fontsize'] = fontSize
  json_ass.styles.style[0]['Fontname'] = fontName
  json_ass.styles.style[0]['MarginV'] = marginV

  json_ass.events.dialogue.forEach((d) => {
    const paresd = d.Text.parsed
    d.Text.raw = ''
    paresd.forEach((p, i) => {
      if (isChinese.test(p.text)) {
        p.tags = [
          { fn: 'OPlusSans 3.0 Medium' },
          { fs: '10' },
          { c1: 'HFFFFFF' },
        ]
      }
      if ((p.text != '\\N' && p.text != '\\\\N') && isEnglish.test(p.text)) {
        //{\fnOPlusSans 3.0 Medium\fs9\1c&H00FFFF&}
        p.tags = [
          { fn: 'OPlusSans 3.0 Medium' },
          { fs: '9' },
          { c1: 'H00FFFF' },
        ]
      }
    })
  })

  const blob = new Blob([stringify(json_ass)], { type: 'text/plain' })
  const fileURL = URL.createObjectURL(blob)
  const downloadLink = document.createElement('a')
  downloadLink.href = fileURL
  downloadLink.download = prefix + fileName
  downloadLink.textContent = 'Download '
  downloadLink.hidden = true
  downloadLink
  document.body.appendChild(downloadLink)
  downloadLink.click()
  URL.revokeObjectURL(fileURL)
}

function processZipFileAndDownload(e: Error, zipData : BinaryType) {
  JSZip.loadAsync(zipData)
    .then(function (zip):  void{
      console.log('zipData size is :' + zipData.length)
      // 遍历 ZIP 包中的每个文件
      zip.forEach(function (relativePath, zipEntry) {
        if (!zipEntry.dir) {
          // 解压非目录文件
          zipEntry.async('uint8array').then(function (fileData) {
            // 处理文件数据
            console.log('filename:', zipEntry.name)
            let zipEntryExtension = getFileExtension(zipEntry.name)
            if (zipEntryExtension == 'ass') {
              console.log('content:', fileData)
              processAssFileAndDownload(
                e,
                Uint8ArrayToString(fileData),
                zipEntry.name
              )
            }
          })
        }
      })
    })
    .catch(function (error) {
      console.error('解压 ZIP 包时出错:', error)
    })
}

export {
  processAssFileAndDownload,
  getFileExtension,
  extractFileName,
  processZipFileAndDownload,
  prefix
}
