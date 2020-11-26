'use strict';

import { loadSubtitleMessageFromFile, loadSubtitleMessageFromUrl } from "@/models/messages";
import Axios, { AxiosResponse } from 'axios';

console.log("Loading injected script!");
const titleCells = document.querySelectorAll("table tr.subtitle-entry td:nth-child(1)");
console.log(titleCells);
for (const cell of titleCells) {
    console.log("Adding a button!");
    console.log(cell);
    const floatingButton = document.createElement("div");
    floatingButton.addEventListener("click", function (ev) {
        ev.preventDefault();
        ev.cancelBubble = true;
        console.log("Button pressed.");
        debugger;
        const downloadAnchor = (this.parentElement as HTMLElement).querySelector("div.pull-left a[data-original-title=\"Download subtitles.\"]") as HTMLLinkElement;
        const link = downloadAnchor.href;

        Axios.get(link, {
            responseType: "blob"
        }).then((response:AxiosResponse<File|Blob>)=>{
            const file = response.data;
            console.log(file);
            const message = new loadSubtitleMessageFromFile((window as any).myVideoId, (window as any).videoTabId);
            message.setFile(file, "PodnapisiNet", "application/zip").then(()=>{
                chrome.runtime.sendMessage(message);
            });
        });

    });
    floatingButton.classList.add("floatingButton");
    const buttonContent = document.createElement("div");
    buttonContent.innerText = "Fetch subtitle!"
    floatingButton.appendChild(buttonContent);
    cell.appendChild(floatingButton);
    (cell as HTMLTableCellElement).style.position = "relative";
}



var styleNode = document.createElement("style");
styleNode.id = "netflixWithSubtitles"
styleNode.type = "text/css";
styleNode.appendChild(document.createTextNode(`
	.floatingButton{
        display: block;
        position: absolute;
        left: 0px;
        top: 0px;
        margin-left: -100px;
        width: 97px;
        border: 2px solid crimson;
        border-radius: 50px 10px 10px 50px;
        border-right: 0px;
        background: crimson;
    }
    .floatingButton:hover {
        background: red !important;
    }
    .floatingButton div {
        border: 2px solid gold;
        border-radius: 50px 10px 10px 50px;
        padding: 3px;
        border-right: none;
        color: white;
    }
	`));
document.head.appendChild(styleNode);
