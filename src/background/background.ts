import { NetflixSettings } from "../models/settings";
import { SubtitleFileItem, SubtitleItem } from "../models/subtitle";
import VideoItem from "../models/videoItem";
import { getMetadataMessage, getMetadataResponse, getSettingsMessage, getSubtitleListFromSourceMessage, getSubtitleListFromSourceResponse, loadSubtitleMessageFromFile, loadSubtitleMessageFromUrl, openSubtitlesSelectorTabMessage, setSettingsMessage } from '@/models/messages';
import { allGoToSources, allSources } from "@/sources/sourceList";
import Axios from 'axios';

//global.browser = require('webextension-polyfill')
// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

declare global {
    interface Window {
        // add you custom properties and methods
        openTabs: any;
        netflixSubtitles: any;
    }
}

var zip: any = (window as any).zip || {};
zip.workerScriptsPath = "/libs/";

// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function () {
    // Replace all rules ...
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        // With a new rule ...
        chrome.declarativeContent.onPageChanged.addRules([{
            // That fires when a page's URL contains a 'g' ...
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: { urlContains: 'netflix.com' },
                })
            ],
            // And shows the extension's page action.
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

class DataStorage {
    videos: VideoItem[] = [];
    openTabs: Map<number, string> = new Map<number, string>();
    usedSubtitles: Map<string, SubtitleFileItem> = new Map<string, SubtitleFileItem>();
    //tabPorts: Map<number, chrome.runtime.Port> = new Map<number, chrome.runtime.Port>();

    getByMyVideoId(myVideoId: string) {
        return this.videos.find(s => s.getKey() === myVideoId);
    }

    addMetadataFromATab(tabId: number, item: VideoItem) {
        this.videos.push(item);
        this.openTabs.set(tabId, item.getKey());
    }

    getByTabId(tabId: number): VideoItem | null {
        const myVideoId = this.openTabs.get(tabId);
        if (myVideoId) {
            return this.videos.find(s => s.getKey() === myVideoId) || null;
        }
        return null;
    }

    closeTab(tabId: number) {
        const existingIndex = this.videos.findIndex(x => x === this.getByTabId(tabId));
        if (existingIndex >=0 ) {
            this.videos.splice(existingIndex, 1);
            this.openTabs.delete(tabId);
        }
    }

    setUsedSubtitle(myVideoId: string, sourceName: string, subtitle: SubtitleFileItem) {
        this.usedSubtitles.set(myVideoId, subtitle);
    }

    getUsedSubtitle(myVideoId: string): SubtitleFileItem | undefined {
        return this.usedSubtitles.get(myVideoId);
    }

    getTabIdFromMyVideoId(myVideoId: string): number | null {
        let tabId: number | null = null;
        this.openTabs.forEach((v, k) => {
            if (v == myVideoId) {
                tabId = k;
            }
        });
        return tabId;
    }

    /*setTabPort(tabId: number, port: chrome.runtime.Port){
        this.tabPorts.set(tabId, port);
    }

    getTabPort(tabId: number){
        return this.tabPorts.get(tabId);
    }*/
}

const dataStorage = new DataStorage();

//#region Message listener and handlers
chrome.runtime.onMessage.addListener(
    (message, sender, callback) => {
        console.log(message);
        console.log(sender);

        let videoItem: VideoItem | undefined | null = null;

        switch (message.message) {
            case "metadataLoaded":
                return MetadataLoaded(message, sender);
            case "getMetadata":
                return GetMetdata(message, callback);
            case "loadSubtitleFromFile":
                LoadSubtitleFromFile(loadSubtitleMessageFromFile.fromData(message), sender);
                break;
            //#region urlload
            /*case "loadSubtitleFromUrl":
                const loadSubtitleMessageUrl = loadSubtitleMessageFromUrl.fromData(message);
                var myVideoId = loadSubtitleMessageUrl.myVideoId;
                var tabId = loadSubtitleMessageUrl.tabId;
                if (!tabId) {
                    if (myVideoId) {
                        tabId = dataStorage.getTabIdFromMyVideoId(myVideoId);
                    }
                    else {
                        throw ("Can't resolve neither tab nor video.");
                    }
                }
                var subtitleUrl = loadSubtitleMessageUrl.subtitleUrl;

                if (!tabId) {
                    throw "Not such tab";
                }
                videoItem = myVideoId ? dataStorage.getByMyVideoId(myVideoId) : null;
                // Remove opened subtitle selection tab (if that's the source)
                if (sender.tab?.id) {
                    chrome.tabs.remove(sender.tab.id);
                }
                console.log(videoItem);
                if (tabId && subtitleUrl) {
                    const source = allSources.get(message.sourceName);
                    const goToSource = allGoToSources.find(v=>v.key == message.sourceName)?.value;
                    let fileDownloadPromise : Promise<File|Blob> | undefined = undefined;
                    if (source){
                        fileDownloadPromise = source.downloadSubtitle(subtitleUrl);
                    }
                    else {
                        fileDownloadPromise = downloadFile(subtitleUrl);
                    }
                    fileDownloadPromise!.then(async (file) => {
                        debugger;
                        if (file) {
                            //messages.setStatus("Downloaded file.");
                            let srtFile: string | null = null;
                            if (typeof file === "string") {
                                srtFile = file;
                            }
                            else {
                                const settings = await getSettings();//.then(settings => {
                                srtFile = await fileHandler.loadFile(file as File | Blob, settings.encoding) //TODO: handle encoding
                            }
                            //messages.setStatus("Unpacked file.");
                            messages.injectSubtitle(tabId!, srtFile!).then(function () {
                                if (myVideoId)
                                    dataStorage.setUsedSubtitle(myVideoId, message.sourceName, new SubtitleFileItem(srtFile!));
                            }, setErrorStatus);
                        }
                        else {
                            //TODO: set error status
                            return;
                        }
                    }, (error) => {
                        setErrorStatus(error);
                    });
                }
                break;*/
            //#endregion
            case "setSettings":
                SetSettings(message);
                break;
            case "getSettings":
                return GetSettings(message, callback);
            case "openSubtitlesSelectorTab":
                ShowSubtitlesSelectorTab(message as openSubtitlesSelectorTabMessage);
                break;
        }
    }
);

function MetadataLoaded(message: any, sender: chrome.runtime.MessageSender){
    if (!sender.tab || !sender.tab.id)
    return; //TODO: throw exception
    console.log("Tab loaded: " + sender.tab.id);
    dataStorage.addMetadataFromATab(sender.tab.id, VideoItem.fromAny(message.metadata));
    //dataStorage.setTabPort(sender.tab.id, chrome.tabs.connect(sender.tab.id));
}

function GetMetdata(message: getMetadataMessage, callback:(response?: any)=>void){
    console.log("Message 'getMetadata' with tabId: " + message.tabId);
    const videoItem = dataStorage.getByTabId(message.tabId);
    //TODO: Reload metadata when background doesn't have metadata!
    if (!videoItem) {
        console.log(dataStorage);
        console.log(message.tabId);
        console.log("No data!");
        /*messages.getMetadataFromTab(message.tabId).then((result) => {
            dataStorage.addMetadataFromATab(message.tabId, result);
            callback(new getMetadataResponse(result));
        })*/
        return true;
    }
    callback(new getMetadataResponse(videoItem));
}

function LoadSubtitleFromFile(message: loadSubtitleMessageFromFile, sender: chrome.runtime.MessageSender){
    var myVideoId = message.myVideoId;
    var tabId = message.tabId;
    if (!tabId) {
        if (myVideoId) {
            tabId = dataStorage.getTabIdFromMyVideoId(myVideoId);
        }
        else {
            throw ("Can't resolve neither tab nor video.");
        }
    }
    var subtitleFile = message.getFile();

    if (!tabId) {
        throw "Not such tab";
    }

    const videoItem = myVideoId ? dataStorage.getByMyVideoId(myVideoId) : null;

    // Remove opened subtitle selection tab (if that's the source)
    if (sender.tab?.id) {
        console.log("Removing tab");
        console.log(sender);
        chrome.tabs.remove(sender.tab.id);
    }

    if (tabId && subtitleFile) {
        getSettings().then(settings => {
            if (typeof (subtitleFile) == "string") {
                messages.injectSubtitle(tabId!, subtitleFile).then(async () => {
                    let srtFile = await fileHandler.loadFile(subtitleFile, settings.encoding);
                    if (myVideoId) {
                        dataStorage.setUsedSubtitle(myVideoId, "", new SubtitleFileItem(srtFile));
                    }
                }, setErrorStatus);
            }
            else {
                fileHandler.loadFile(subtitleFile, settings.encoding).then((srt: string) => {
                    messages.injectSubtitle(tabId!, srt).then(function () {
                        if (myVideoId) {
                            dataStorage.setUsedSubtitle(myVideoId, "", new SubtitleFileItem(srt));
                        }
                    }, setErrorStatus);
                })
            }
        });
    }
}

function SetSettings(message:setSettingsMessage){
    const setSettingsMessage = message as setSettingsMessage;
    if (!message.settings) {
        return;
    }
    chrome.storage.sync.set({ "Settings": message.settings }, function () {
        console.log("Settings set to: " + JSON.stringify(message.settings));
    });
}

function GetSettings(message:getSettingsMessage, callback:(response?: any)=>void){
    getSettings().then((settings) => {
        if (settings) {
            console.log("Setings read from sync.");
            console.log(settings);
            callback(settings as NetflixSettings);
        }
        else {
            callback(new NetflixSettings());
        }
    });
    return true;
}


function ShowSubtitlesSelectorTab(message: openSubtitlesSelectorTabMessage){
    chrome.tabs.create(
        {
            url: message.url,
        },
        (tab: chrome.tabs.Tab) => {
            console.log("Tab created");
            console.log(tab);
            const injectInterval = setInterval(() =>
                chrome.tabs.get(tab.id!, function (tabDetails: any) {
                    console.log(tabDetails);
                    if (!tabDetails) {
                        clearInterval(injectInterval);
                        return;
                    }
                    if (tabDetails.status == 'complete') {
                        chrome.tabs.executeScript(tabDetails.id!, { code: `window.myVideoId=${message.myVideoId};`, }, function () {
                            chrome.tabs.executeScript(tabDetails.id!, {
                                file: 'content-'+message.source +'.js'
                            }, function (result) {
                                console.log(result);
                                clearInterval(injectInterval);
                            });
                        });
                    }

                }), 250);
        }
    );

}

//#endregion

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    dataStorage.closeTab(tabId);
    /*var videoId = openTabs[tabId];
    netflixSubtitles[videoId] = undefined; //TODO: time-sensitive cache invalidation
    openTabs[tabId] = undefined;*/
});



function setErrorStatus(error: string) {
    //messages.setStatus("Error: " + error);
    console.log(JSON.stringify(error));
}

async function downloadFile(url: string): Promise<Blob> {
    const response = await Axios.get(url, {
        responseType: "blob"
    });
    return response.data;
}


function getSettings(): Promise<NetflixSettings> {
    return new Promise((resolveFunc, rejectFunc) => {
        chrome.storage.sync.get("Settings", function (response) {
            if (response && response.Settings && Object.keys(response.Settings).length > 0)
                resolveFunc(response.Settings);
            return resolveFunc(new NetflixSettings());
        });
    });
}




var port;
var messages = {
    injectSubtitle: (tabId: number, srtFile: string): Promise<void> => {
        return new Promise(async (resolveFunc, rejectFunc) => {
            const settings = await getSettings();//.then((settings) => {
            chrome.tabs.sendMessage(tabId, {
                message: "injectSubtitle",
                srtInput: srtFile,
                settings: settings
            }, function (response) {
                //messages.setStatus("Subtitles injected.");
                resolveFunc();
            });
            //});
        });
    },
    setStatus: (statusMessage: string) => {
        return new Promise((resolveFunc, rejectFunc) => {
            chrome.runtime.sendMessage({
                message: "setStatus",
                status: statusMessage
            }, function () {
                resolveFunc();
            });
        });
    },
    getMetadataFromTab: async (tabId: number): Promise<VideoItem> => {
        console.log(tabId);
        return new Promise((resolveFunc, rejectFunc) => {
            //This probably means extension got reloaded, so we need to reconnect to the tab
            //console.log("Message posted");
            //const port = dataStorage.getTabPort(tabId);
            //port?.postMessage("getMetadataFromTab");
            chrome.tabs.sendMessage(tabId, { message: "getMetadataFromTab" }, function (metadata) {
                console.log(metadata);
                resolveFunc(VideoItem.fromAny(metadata));
            });
        });
    }
};


var fileHandler: any = {
    loadFile: function (file: File | Blob, encoding = "UTF-8"): Promise<string> {
        if (file.type == "application/x-zip-compressed" || file.type == "application/zip") {
            return this.loadZippedFile(file, encoding);
        }
        else {
            return new Promise((resolveFunc, rejectFunc) => {
                var reader = new FileReader();
                reader.onload = function (event: Event) {
                    resolveFunc((event.target as any).result as string);
                };
                reader.readAsText(file);
            });
        }
    },

    loadZippedFile: function (file: File | Blob, encoding = "UTF-8"): Promise<string> {
        return new Promise((resolveFunc, rejectFunc) => {
            zip.createReader(new zip.BlobReader(file), function (reader: any) {
                reader.getEntries(function (entries: any) {
                    for (var entry of entries) {
                        if (entry.filename.endsWith(".srt")) {
                            entry.getData(new zip.TextWriter(encoding), function (text: string) {
                                resolveFunc(text);
                                reader.close();
                                console.log("Uploaded file read.");
                            });
                            return;
                        }
                        console.log(entry);
                    }
                    rejectFunc("Subtitle is not in .srt format.");
                });
            }, function (error: any) {
                rejectFunc(error);
            });
        });
    }
};