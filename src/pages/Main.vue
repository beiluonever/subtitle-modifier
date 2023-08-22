<script setup lang="ts">
import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

import type { UploadProps, UploadUserFile } from "element-plus";
import fontNameJson from "../../resouces/fontname.json";

import {
  processAssFileAndDownload,
  getFileExtension,
  processZipFileAndDownload,
} from "../components/subtitleProcess";
import type { SubtitleSetting } from "../components/subtitleProcess";
import { file } from "jszip";

const fileList = ref<UploadUserFile[]>([]);

let settings: SubtitleSetting;
settings = {
  globalFontNmae: "华文楷体",
  globalFontSize: 10,
  fontName: "华文楷体",
  fontSize: 10,
  color: "HFFFFFF",
  EngFontName: "OPlusSans 3.0 Medium",
  EngFontSize: 9,
  EngColor: "H00FFFF",
  marginV: 40
};

let ch_fontnames = fontNameJson["chinese"];
let en_fontnames = fontNameJson["english"];

const handleRemove: UploadProps["onRemove"] = (file, uploadFiles) => {
  console.log(file, uploadFiles);
};

const handlePreview: UploadProps["onPreview"] = (uploadFile) => {
  console.log(uploadFile);
};

const handleExceed: UploadProps["onExceed"] = (files, uploadFiles) => {
  ElMessage.warning(
    `The limit is 3, you selected ${files.length} files this time, add up to ${
      files.length + uploadFiles.length
    } totally`
  );
};

const beforeRemove: UploadProps["beforeRemove"] = (uploadFile, uploadFiles) => {
  return ElMessageBox.confirm(
    `Cancel the transfer of ${uploadFile.name} ?`
  ).then(
    () => true,
    () => false
  );
};
function submitFiles() {
  console.log(fileList);
  fileList.value.forEach((element: any) => {
    console.log(element);
    const fileName = element.name;
    const extension = getFileExtension(fileName);
    if (extension != "ass" && extension != "zip") {
      console.error("file type wrong, please repick");
      return;
    }

    // 解析上传的文件
    let reader = new FileReader();
    // abort none 中断读取
    // readAsBinaryString file 将文件读取为二进制码，通常我们将它传送到后端，后端可以通过这段字符串存储文件
    // readAsDataURL file 将文件读取为 DataURL，一段以 data: 开头的字符串，这段字符串的实质就是 Data URL，Data URL是一种将小文件直接嵌入文档的方案。这里的小文件通常是指图像与 html 等格式的文件
    // readAsText file, [encoding] 将文件读取为文本，读取的结果即是这个文本文件中的内容
    reader.readAsBinaryString(element.raw);
    // onabort 中断时触发
    // onerror 出错时触发
    // onload 文件读取成功完成时触发
    // onloadend 读取完成触发，无论成功或失败
    // onloadstart 读取开始时触发
    // onprogress 读取中
    reader.onload = (e: any) => {
      // 读取文件内容
      const target = e.target;
      const fileString = target.result;
      if (extension == "ass") {
        processAssFileAndDownload(e, fileString, fileName, settings);
      } else if (extension == "zip") {
        processZipFileAndDownload(e, fileString, settings);
      }
    };
  });
}
</script>

<template>
  <div class="text-center m-4">
    <el-form label-width="2 em">
      <el-form-item label="全局默认字号">
        <el-input-number v-model="settings.globalFontSize" :min="1" :max="50" />
      </el-form-item>

      <el-form-item label="全局默认字体">
        <el-select
          v-model="settings.globalFontNmae"
          class="m-2"
          placeholder="Select"
        >
          <el-option
            v-for="item in ch_fontnames"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="中文字号">
        <el-input-number v-model="settings.fontSize" :min="1" :max="50" />
      </el-form-item>

      <el-form-item label="中文字体">
        <el-select v-model="settings.fontName" class="m-2" placeholder="Select">
          <el-option
            v-for="item in ch_fontnames"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
<!-- 
      <el-form-item label="中文字幕颜色">
        <el-color-picker v-model="settings.EngColor" />
      </el-form-item> -->

      <el-form-item label="英文字号">
        <el-input-number v-model="settings.EngFontSize" />
      </el-form-item>

      <el-form-item label="英文字体">
        <el-select
          v-model="settings.EngFontName"
          class="m-2"
          placeholder="Select"
        >
          <el-option
            v-for="item in en_fontnames"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="英文字幕颜色">
        <el-color-picker v-model="settings.EngColor" />
      </el-form-item> -->

      <el-form-item label="上传字幕文件">
        <el-upload
          v-model:file-list="fileList"
          class="upload-demo"
          multiple
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :before-remove="beforeRemove"
          :limit="3"
          :on-exceed="handleExceed"
          :auto-upload="false"
        >
          <el-button type="primary">Click to upload</el-button>
          <template #tip>
            <div class="el-upload__tip">ass/zip files</div>
          </template>
        </el-upload>
      </el-form-item>
      <el-button @click="submitFiles">提交</el-button>
    </el-form>
    <!-- <RouterLink to="/about">About</RouterLink> -->
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
