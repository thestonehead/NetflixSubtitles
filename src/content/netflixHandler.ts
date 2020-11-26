'use strict';

import { NetflixSettings } from "@/models/settings";
import { createApp } from "vue";

console.log("Injected script!");

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log("Message received");
        /*if (request == "getMetadata"){
            getVideoData(sendResponse);
            return true;
        }*/
        if (request.srtInput) {
            addSubtitle(request.srtInput, request.settings);
            sendResponse("OK");
        }
    }
);
/*
function getVideoData(sendResponse){
    console.log("getVideoData...");
    var rawMetadata = document.getElementById("netflixWithSubtitles-rawMetadata");
    if (rawMetadata) {
    //if (window.netflixWithSubtitles && window.netflixWithSubtitles.rawMetadata){
        //sendResponse(window.netflixWithSubtitles.rawMetadata);
        sendResponse(JSON.parse(rawMetadata.innerText));
        console.log("Initial message responded to with ");
        console.log(JSON.parse(rawMetadata.innerText));
    }
    else {
        setTimeout(()=>
        requestIdleCallback(()=>getVideoData(sendResponse)), 300); //TODO: timeout
    }
}
*/

/*	return {
        line,
        lineHeight,
        foreground,
        background,
        fontSize,
        encoding
    }; */
let currentInputSrt: string | null = null;
let currentSettings: NetflixSettings | null = null;
let currentSubtitleDelay: number | null = null;
let addingSubtitle = false;
function addSubtitle(inputSrt: string, settings: NetflixSettings, subtitleDelay = 0) {
    if (addingSubtitle) return;
    addingSubtitle = true;
    try {
        console.log(`Setting up subtitles with ${JSON.stringify(settings)} and subtitleDelay ${subtitleDelay}`);
        currentInputSrt = inputSrt;
        currentSettings = settings;
        currentSubtitleDelay = subtitleDelay;
        let subtitle: any = {};

        let cues = [];
        let limit = 0;
        let counter = 0;

        for (let line of inputSrt.split("\n")) {
            if (/^\d+\s*$/i.test(line)) {
                // Number line;
                subtitle = { id: parseInt(line) };
            }
            else if (line.trim() === "") {
                // Empty line
                try {
                    cues.push(new VTTCue(subtitle.startTime, subtitle.endTime, subtitle.text));
                } catch {
                    debugger;
                }
            }
            else {
                // Time line
                const matches = /^((?<startHours>\d{2}):(?<startMinutes>\d{2}):(?<startSeconds>\d{2})[,\.](?<startMiliseconds>\d+)?) --> ((?<endHours>\d{2}):(?<endMinutes>\d{2}):(?<endSeconds>\d{2})[,\.](?<endMiliseconds>\d+)?)\s*$/i.exec(line);
                if (matches && matches.groups) {
                    subtitle.startTime = parseInt(matches.groups["startHours"]) * 3600 +
                        parseInt(matches.groups["startMinutes"]) * 60 +
                        parseInt(matches.groups["startSeconds"]) +
                        parseInt(matches.groups["startMiliseconds"]) / 1000
                        + subtitleDelay / 1000;
                    subtitle.endTime = parseInt(matches.groups["endHours"]) * 3600 +
                        parseInt(matches.groups["endMinutes"]) * 60 +
                        parseInt(matches.groups["endSeconds"]) +
                        parseInt(matches.groups["endMiliseconds"]) / 1000
                        + subtitleDelay / 1000;
                    continue;
                }
                // Text line
                if (subtitle.text) subtitle.text += "<br/>" + line;
                else
                    subtitle.text = line;
            }
            if (limit > 0 && counter++ > limit)
                break;
        }

        var media = document.getElementsByTagName("video")[0];
        for (const c of media.textTracks) { c.mode = "disabled"; }
        var track = media.addTextTrack("captions", "Custom", "c");
        for (const c of cues) { c.line = settings.line || "auto"; track.addCue(c); }
        track.mode = "showing";

        var existingStyleNode = document.getElementById("netflixWithSubtitles");
        if (existingStyleNode) {
            existingStyleNode.remove();
        }

        var styleNode = document.createElement("style");
        styleNode.id = "netflixWithSubtitles"
        styleNode.type = "text/css";
        styleNode.appendChild(document.createTextNode(`
	video::cue{
	  	display: block;
	  	line-height: ${settings.lineHeight || '1em'};
		color: ${settings.foreground || 'white'};
		background: ${settings.background || 'black'};
	  	font-size: ${settings.fontSize || 'regular'};
	}
	`));
        document.head.appendChild(styleNode);
    } finally {
        addingSubtitle = false;
    }
}

document.addEventListener("keydown", (event) => {
    console.log(`Keydown ${!!currentInputSrt} ${!!event.key} ${!!currentSettings} ${currentSubtitleDelay==null}`);
    if (!currentInputSrt || !event.key || !currentSettings || (currentSubtitleDelay == null))
        return;
    if ((event.key == "g" || event.key == "G")) {
        addSubtitle(currentInputSrt, currentSettings, currentSubtitleDelay - 100);
        showFloatingText("Subtitle delay " + currentSubtitleDelay);
        console.log("Subtitle delay " + currentSubtitleDelay);
    }
    else if ((event.key == "h" || event.key == "H")) {
        addSubtitle(currentInputSrt, currentSettings, currentSubtitleDelay + 100);
        showFloatingText("Subtitle delay " + currentSubtitleDelay);
        console.log("Subtitle delay " + currentSubtitleDelay);
    }
    if (event.key == "8"){
        currentSettings.line = (currentSettings.line || 0) + 1;
        addSubtitle(currentInputSrt, currentSettings, currentSubtitleDelay);
        showFloatingText("Line " + currentSettings.line);
    }
    else if (event.key == "2"){
        currentSettings.line = (currentSettings.line || 0) - 1;
        addSubtitle(currentInputSrt, currentSettings, currentSubtitleDelay);
        showFloatingText("Line " + currentSettings.line);
    }
    else if (event.key == "5"){
        currentSettings.line = undefined;
        addSubtitle(currentInputSrt, currentSettings, currentSubtitleDelay);
        showFloatingText("Line " + currentSettings.line);
    }
});
function showFloatingText(text: string) {
    var newdiv = document.createElement("div");
    newdiv.style.color = "white";
    newdiv.style.zIndex = "999999";
    newdiv.style.position = "absolute";
    newdiv.style.left = "50px";
    newdiv.style.top = "200px";
    newdiv.style.transition = "top 0.5s ease-out";
    newdiv.style.fontSize = "40px";
    newdiv.style.webkitTextStroke = "1px black";
    newdiv.innerText = text;
    document.body.append(newdiv);
    requestIdleCallback(() =>
        newdiv.style.top = "100px");

    setTimeout(() => {
        newdiv.remove();
    }, 500);
}