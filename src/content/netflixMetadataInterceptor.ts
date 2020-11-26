///<reference types="requestIdleCallback" />
/* eslint-disable no-console */
'use strict';


console.log("Injected Metadata script!");
import VideoItem from "@/models/videoItem";
import { Tab } from 'bootstrap';

/*chrome.runtime.onConnect.addListener(function(port){
    console.log("Connection port received.");
    port.onMessage.addListener(function(message){
        checkForData();
    });
    port.onDisconnect.addListener(function(disconnectedPort:chrome.runtime.Port){
        
    });
})*/
/*
var port: chrome.runtime.Port | null = null;
function connectPort(){
    port = chrome.runtime.connect();
    port.onDisconnect.addListener(function(disconnectedPort:chrome.runtime.Port){
        setTimeout(connectPort,1000);
    });
}
        */


function interceptData() {
    const xhrOverrideScript = document.createElement('script');
    xhrOverrideScript.type = 'text/javascript';
    xhrOverrideScript.innerHTML = `
    (function() {
        var XHR = XMLHttpRequest.prototype;
        var send = XHR.send;
        var open = XHR.open;
        XHR.open = function(method, url) {
            if (url.includes('/metadata')) {
                this.addEventListener('readystatechange', function(e){
				if (this.readyState == 4){
					console.log("ReadyState: " + this.readyState);
					console.log(this.response);
					console.log(this.status);
					window.netflixWithSubtitles = window.netflixWithSubtitles || {};
                    window.netflixWithSubtitles.rawMetadata = this.response;
                    const existingEl = document.querySelector("#netflixWithSubtitles-rawMetadata");
                    if (existingEl)
                        existingEl.remove()
                        var scriptEl = document.createElement('script');
                        scriptEl.setAttribute('type', 'application/json');
                        scriptEl.innerText = JSON.stringify(this.response);
					scriptEl.setAttribute('id', 'netflixWithSubtitles-rawMetadata');
					document.body.appendChild(scriptEl);
				}
			});
		}
        this.url = url; // the request url
        return open.apply(this, arguments);
    }
})();
`
    document.head.prepend(xhrOverrideScript);
}


function GetCurrentMetadata() {
    const rawMetadata = document.getElementById("netflixWithSubtitles-rawMetadata");
    if (!rawMetadata) {
        return null;
    }
    const md = JSON.parse(rawMetadata.innerText);
    //const videoIdText = /\/([0-9]+)\?/.exec(location.href);
    //const videoId = videoIdText && videoIdText.length >= 2 ? videoIdText[1] : null;
    const videoId = md.video.currentEpisode || md.video.id;
    if (!videoId) {
        return null;
    }

    let season = undefined;
    let episode = undefined;
    if (md.video.seasons)
        for (const s of md.video.seasons) {
            for (const e of s.episodes) {
                if (e.episodeId == videoId) {
                    episode = e.seq;
                    season = s.seq;
                    break;
                }
            }
            if (episode)
                break;
        }

    /*const metadata = {
        videoId: md.video.id,
        episodeId: videoId != md.video.id ? videoId : null,
        title: md.video.title,
        type: md.video.type, //Possible values: show, movie
        //year: md.video.year || (md.video.seasons ? md.video.seasons.map((s)=>s.year)[season-1] : undefined),
        year: md.video.year || (md.video.seasons ? md.video.seasons[0].year : undefined),
        episode: episode,
        season: season
    };*/
    return new VideoItem(
        md.video.id,
        Number(videoId != md.video.id ? videoId : null),
        md.video.title,
        md.video.type, //Possible values: show, movie
        md.video.year || (md.video.seasons ? md.video.seasons[0].year : undefined),
        episode,
        season);
}

function checkForData() {
    const rawMetadata = document.getElementById("netflixWithSubtitles-rawMetadata");
    if (rawMetadata) {
        chrome.runtime.sendMessage(
            {
                message: "metadataLoaded",
                metadata: GetCurrentMetadata()
            });
        //TODO: Reload metadata when background doesn't have metadata!
    }
    else {
        requestIdleCallback(checkForData); //TODO: timeout
    }
}

function checkForDOM() {
    if (document.body && document.head) {
        requestIdleCallback(checkForData);
        interceptData();
    } else {
        requestIdleCallback(checkForDOM);
    }
}
requestIdleCallback(checkForDOM); //TODO: timeout


chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log("Message received");
        /*if (request == "getMetadata"){
            getVideoData(sendResponse);
            return true;
        }*/
        if (request.message == "getMetadataFromTab") {
            sendResponse(GetCurrentMetadata());
        }

    }
);


