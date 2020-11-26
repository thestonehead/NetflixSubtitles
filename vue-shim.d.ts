declare module "*.vue" {
    import Vue from 'vue'
    export default Vue
}

interface Window {
    chrome: typeof chrome;
}