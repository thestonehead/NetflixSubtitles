'use strict';

import { loadSubtitleMessageFromFile, loadSubtitleMessageFromUrl } from "@/models/messages";
import Axios, { AxiosResponse } from 'axios';



//document.addEventListener("DOMContentLoaded", function () {
/*if (!(window as any).myVideoId) {
    console.log("Subtitle extension - wasn't loaded from the extension popup.");
    return;
}*/
console.log("Loading injected script!");
const titleCells = document.querySelectorAll("#search_results tr td[id^=main]");

for (const cell of titleCells) {
    const floatingButton = document.createElement("div");
    floatingButton.addEventListener("click", function (ev) {
        console.log("Button pressed.");
        const downloadAnchor = ((this.parentElement?.parentElement) as HTMLElement).querySelector("td:nth-child(5) a") as HTMLLinkElement;
        const link = downloadAnchor.href;

        Axios.get(link, {
            responseType: "blob"
        }).then((response:AxiosResponse<File|Blob>)=>{
            const file = response.data;
            console.log(file);
            const message = new loadSubtitleMessageFromFile((window as any).myVideoId, (window as any).videoTabId);
            message.setFile(file, "OpenSubtitles.org").then(()=>{
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
//});