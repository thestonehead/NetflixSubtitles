import { createApp } from 'vue'
import App from './App'
/*global.browser = require('webextension-polyfill')*/


const app = createApp(App);

app.mount("#app");