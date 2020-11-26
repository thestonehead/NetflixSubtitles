import { createApp } from 'vue'
import App from './App'
/*global.browser = require('webextension-polyfill')*/
import ColorPicker from "primevue/colorpicker";
import MultiSelect from "primevue/multiselect";
import Dropdown from 'primevue/dropdown';

const app = createApp(App);

app.component('ColorPicker', ColorPicker);
app.component('MultiSelect', MultiSelect);
app.component('Dropdown', Dropdown);

app.mount("#app");