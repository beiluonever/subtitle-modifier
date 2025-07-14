import { createApp } from 'vue'
import "./style.css"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
// 临时注释掉Node.js API示例，因为它不能在渲染进程中运行
// import './samples/node-api'

createApp(App)
  .use(ElementPlus)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
