<template>
	<div
		style="max-width: 500px; min-width: 400px; background: #c8c8c8"
		class="container"
	>
		<div class="header row">
			<div id="title" class="col-10 h5">
				{{
					metadata
						? metadata.title +
						  " (" +
						  metadata.year +
						  ") " +
						  (metadata.season ? "S" + metadata.season : "") +
						  (metadata.episode ? "E" + metadata.episode : "")
						: "Loading..."
				}}
			</div>
			<div class="col-2 text-right" v-show="!metadata">
				<button class="btn btn-danger btn-sm" title="Refresh" @click="refreshHandler"><svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-arrow-counterclockwise" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
  <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
</svg></button>
			</div>
		</div>
		<div class="everything-together">
			<div class="main-container">
				<div class="row list-group">
					<button
						v-for="(item, index) in allGoToSources"
						:key="index"
						type="button"
						class="list-group-item list-group-item-action"
						@click="goToWebsite(item.key, item.value.getGoToUrl(metadata));"
					>
						Go to {{ item.key }}
					</button>
				</div>
				<div class="row">
					<div class="upload-area col-12">
						<form>
							<div class="form-group">
								<label for="uploadSubtitle">Upload a custom .srt file</label>
								<input type="file" class="form-control-file" id="uploadSubtitle" @change="uploadSubtitleHandler">
							</div>
						</form>
					</div>
				</div>
			</div>
			<div class="log-container row"></div>
		</div>
		<div class="row">
			<div id="status-message" class="message col-12 text-left">
				{{ statusMessage }}
			</div>
		</div>
	</div>
</template>

<script lang="ts">
///<reference types="chrome" />
import { SubtitleItem } from "../models/subtitle";
import { Vue } from "vue-class-component";
import { allGoToSources } from "../sources/sourceList";
import {
	getMetadataMessage,
	getMetadataResponse,
	getSubtitleListFromSourceMessage,
	getSubtitleListFromSourceResponse,
	loadSubtitleMessageFromFile,
  openSubtitlesSelectorTabMessage,
} from "@/models/messages";
import VideoItem from "@/models/videoItem";
import { NetflixSettings } from "@/models/settings";

class KeyValuePair<TK, TV> {
	key: TK;
	value: TV;
	constructor(key: TK, value: TV) {
		this.key = key;
		this.value = value;
	}
}

export default class Popup extends Vue {
	metadata: VideoItem | null = null;
	tabId: number | null = null;
	myVideoId: string | null = null;
	statusMessage = "Waiting for subtitle...";
	allGoToSources = allGoToSources;

	setStatus(status: string) {
		this.statusMessage = status;
	}

	created() {
		console.log(this.allGoToSources);
		chrome.tabs.query(
			{
				active: true,
				currentWindow: true,
			},
			async (tabs) => {
				console.log("There are active: " + tabs.length);
				if (tabs.length > 0 && tabs[0].id) {
					const response = (await this.getMetadata(
						tabs[0].id
					)) as getMetadataResponse;
					debugger;
					if (!response) {
						console.log("Error loading metadata");
						//TODO: Error loading metadata
						return;
					}
					console.log(response);
					this.metadata = VideoItem.fromAny(response.videoItem);
					this.myVideoId = this.metadata.getKey();
					this.tabId = tabs[0].id;
				}
			}
		);

		chrome.runtime.onMessage.addListener((message, sender, callback) => {
			console.log(message);
			console.log(sender);

			switch (message.message) {
				case "setStatus":
					this.setStatus(message.status);
					break;
			}
		});
	}

	public goToWebsite(source: string, urlTask: Promise<string>): void {
		console.log(urlTask);
		if (!this.myVideoId)
			return; //TODO error
		urlTask.then((url) => {
			console.log("url: "+ url);
			chrome.runtime.sendMessage(
				new openSubtitlesSelectorTabMessage(url, this.myVideoId!, source),
				(response)=>{
					
				}
			)
		});
	}

	public uploadSubtitleHandler(event: Event){
		const fileList = (event.target as any).files as FileList;
		debugger;
		if (this.tabId){
			const file = fileList[0];
		
			this.loadSubtitle(
					this.myVideoId,
					this.tabId,
					file
				);
		}
		//console.log(event.target.files);
	}

	public refreshHandler(){
		chrome.tabs.query(
			{
				active: true,
				currentWindow: true,
			},
			async (tabs) => {
				console.log("There are active: " + tabs.length);
				if (tabs.length > 0 && tabs[0].id) {
					this.getMetadata(tabs[0].id).then((response : getMetadataResponse)=>{
						debugger;
						if (!response) {
							console.log("Error loading metadata");
							//TODO: Error loading metadata
							return;
						}
						console.log(response);
						this.metadata = VideoItem.fromAny(response.videoItem);
						this.myVideoId = this.metadata.getKey();
						this.tabId = tabs[0].id || null;

					});
				}
			}
		);
	}

	// Messages
	loadSubtitle(
		myVideoId: string | null,
		tabId: number,
		subtitleFile: File
	): Promise<void> {
		return new Promise(async (resolveFunc, rejectFunc) => {
			const message = new loadSubtitleMessageFromFile(myVideoId, tabId);
			if (subtitleFile){
				await message.setFile(subtitleFile as File, subtitleFile.name);
			}
			console.log(message);
			chrome.runtime.sendMessage(
				message,
				(response) => {
					resolveFunc();
				}
			);
		});
	}
	getSubtitleListFromSource(
		sourceName: string,
		myVideoId: string
	): Promise<getSubtitleListFromSourceResponse> {
		return new Promise((resolveFunc, rejectFunc) => {
			chrome.runtime.sendMessage(
				new getSubtitleListFromSourceMessage(myVideoId, sourceName),
				(response) => {
					resolveFunc(response);
				}
			);
		});
	}
	getMetadata(tabId: number): Promise<getMetadataResponse> {
		return new Promise((resolveFunc, rejectFunc) => {
			chrome.runtime.sendMessage(
				new getMetadataMessage(tabId),
				(response) => {
					console.log("getMetadata-RESPONSE: " + JSON.stringify(response));
					if (response) resolveFunc(response);
					else rejectFunc("No metadata fetched.");
				}
			);
		});
	}

	loadSubtitleDirectly(): Promise<void>{
		return new Promise((resolveFunc, rejectFunc)=>{
			
		});
	}
}
</script>

<style lang="scss" scoped>
@import "bootstrap";

body {
	border: 2px solid #e50914;
	margin: 0;
}

.options-container,
.podnapisi-container {
	height: 75%;
}

.header {
	background: #FB636B;
}

#title {
	white-space: nowrap;
}

.options-button,
.back-button {
	text-align: right;
}

.footer {
	width: 100%;
	height: 25%;
}

#subtitle-colors-example {
	text-align: center;
	grid-column: 1 / span 2;
}

.subtitle-name {
	white-space: wrap;
	text-align: left;
	font-size: smaller;
	width: 100%;
	overflow-wrap: break-word;
	white-space: normal;
}

.subtitle-actions {
	width: auto;
}

.subtitle-downloads {
	width: auto;
	font-size: smaller;
}

table {
	table-layout: fixed;
}

table tr {
	cursor: pointer;
}

tr.subtitle-used {
	background-color: #bbb891;
}

tr.subtitle-current {
	font-weight: bold;
}

.upload-area{
	background: #FB636B;
}
</style>
