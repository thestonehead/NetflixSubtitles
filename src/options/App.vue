<template>
	<div class="options-container">
		<form id="settings-form" class="form" @submit.prevent="saveSettings">
			<div class="form-row">
				<div class="form-group col-6">
					<div class="form-row">
						<label for="line" class="col-6 form-col-label"
							>Line</label
						>
						<div class="col-6">
							<input
								type="checkbox"
								name="lineDefault"
								id="lineDefault"
								class="form-check-inline"
								v-model="lineDefault"
							/>
							<label class="form-check-label" for="lineDefault"
								>default</label
							>
						</div>
					</div>
					<input
						name="line"
						id="line"
						type="number"
						placeholder="auto"
						class="form-control"
						v-model.number="netflixSettings.line"
						:disabled="lineDefault"
					/>
				</div>
				<div class="form-group col-6">
					<div class="form-row">
						<label for="fontSize" class="col-6 form-col-label"
							>Font size</label
						>
						<div class="col-6">
							<input
								type="checkbox"
								name="fontSizeDefault"
								id="fontSizeDefault"
								class="form-check-inline"
								v-model="fontSizeDefault"
							/>
							<label
								class="form-check-label"
								for="fontSizeDefault"
								>default</label
							>
						</div>
					</div>
					<div class="form-row">
						<input
							name="fontSize"
							id="fontSize"
							type="text"
							class="form-control"
							placeholder="16px or 1.8em or 10% or 'x-large'"
							v-model="netflixSettings.fontSize"
							:disabled="fontSizeDefault"
						/>
					</div>
				</div>
			</div>
			<div class="form-row">
				<div class="form-group col-6">
					<div>Text color</div>
					<ColorPicker v-model="foregroundColor" />
				</div>
				<div class="form-group col-6">
					<div>Background color</div>
					<ColorPicker v-model="backgroundColor" />
				</div>
			</div>
			<div
				id="subtitle-colors-example"
				class="form-group"
				:style="{
					backgroundColor: '#' + backgroundColor,
					color: '#' + foregroundColor,
				}"
			>
				Subtitle example
			</div>
			<div class="form-group">
				<label for="encoding-select">Encoding</label>
				<select
					id="encoding-select"
					name="encoding-select"
					class="form-control"
					v-model="netflixSettings.encoding"
				>
					<option>UTF-8</option>
					<option>windows-1250</option>
					<option>ANSI</option>
					<option>Unicode</option>
				</select>
			</div>
			<div class="form-group">
				<button type="submit" class="btn btn-primary">
					Save settings
				</button>
			</div>
			<div v-for="(item, index) in allOptions" :key="index" class="card">
				<div class="">
					<component :is="item"></component>
				</div>
			</div>
		</form>
	</div>
</template>

<script lang="ts">
///<reference types="chrome" />
import { NetflixSettings } from "../models/settings";
import { Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import {  allOptions } from "@/sources/sourceList";

export default class Options extends Vue {
	netflixSettings = new NetflixSettings();
	fontSizeDefault = true;
	lineDefault = true;
	allOptions = allOptions;

	foregroundColor: any = null;
	backgroundColor: any = null;

	created() {
		this.loadSettings();
	}

	mounted() {}

	loadSettings() {
		this.getSettings().then((settings: NetflixSettings) => {
			this.netflixSettings = settings;
			this.lineDefault = settings.line == null;
			this.fontSizeDefault = settings.fontSize == null;
			this.foregroundColor = settings.foreground?.substring(1);
			this.backgroundColor = settings.background?.substring(1);
		});
	}

	async saveSettings() {
		const settings = await this.getSettings(); //.then((settings) => {
		settings.line = this.lineDefault
			? undefined
			: this.netflixSettings.line;
		settings.fontSize = this.fontSizeDefault
			? undefined
			: this.netflixSettings.fontSize;
		settings.foreground = "#" + this.foregroundColor;
		settings.background = "#" + this.backgroundColor;
		settings.encoding = this.netflixSettings.encoding;
		settings.lineHeight = undefined;
		await this.setSettings(settings);
		//});
	}

	// Messages
	getSettings(): Promise<NetflixSettings> {
		return new Promise((resolveFunc, rejectFunc) => {
			chrome.runtime.sendMessage(
				{
					message: "getSettings",
				},
				(settings) => {
					console.log("getSettings - RESULT:");
					console.log(settings);
					if (settings) resolveFunc(settings);
					else rejectFunc("No settings fetched.");
				}
			);
		});
	}
	setSettings(netflixSettings: NetflixSettings) {
		return new Promise((resolveFunc, rejectFunc) => {
			chrome.runtime.sendMessage({
				message: "setSettings",
				settings: netflixSettings,
			});
			console.log("Sent 'setSettings' message.");
		});
	}
}
</script>

<style lang="scss">
@import "~primeicons/primeicons.css";
</style>

<style lang="scss" scoped>
//@import "~bootstrap/scss/bootstrap";
//@import "./node_modules/bootstrap/scss/bootstrap.scss";
@import "bootstrap";
@import "~primevue/resources/primevue.min.css";
@import "~primevue/resources/themes/bootstrap4-light-blue/theme.css";

p {
	font-size: 20px;
}

.options-container {
	width: 460px;
}

#subtitle-colors-example {
	padding: 10px;
}

::v-deep(.btn) {
	background-image: unset;
}

::v-deep(.btn:hover) {
	background-image: unset;
}
</style>
