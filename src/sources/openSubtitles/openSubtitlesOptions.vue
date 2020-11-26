<template>
	<form @submit.prevent="saveSettings">
		<div class="card-header container-fluid">
			<div class="row">
				<div class="col-11">
					<h6>OpenSubtitles settings</h6>
				</div>
				<div class="col-1">
					<a href="https://www.opensubtitles.org"
						><i class="pi pi-home mt-1"></i
					></a>
				</div>
			</div>
		</div>
		<div class="card-body">
			<div class="form-group">
				<MultiSelect
					class="col-12"
					id="opensubtitles-language"
					v-model="settings.languages"
					:options="languageList"
					placeholder="Pick subtitle languages"
					dataKey="code"
					optionLabel="name"
					optionValue="code"
					:filter="true"
				/>
			</div>
			<div class="form-group">
				<Dropdown
					class="col-12"
					id="opensubtitles-site-language"
					:options="siteLanguageList"
					v-model="settings.siteLanguage"
					placeholder="Pick site language"
					dataKey="code"
					optionLabel="name"
					optionValue="code"
				/>
			</div>
		</div>
		<div class="card-footer">
			<button
				class="btn btn-primary col-2 offset-10"
				:disabled="savingInProgress"
			>
				<div
					class="spinner-border spinner-border-sm"
					small
					v-if="savingInProgress"
				>
					<span class="">Saving...</span>
				</div>
				<span class="">{{
					savingInProgress ? "Saving..." : "Save"
				}}</span>
			</button>
		</div>
	</form>
</template>

<script lang="ts">
import { Vue } from "vue-class-component";
import Dropdown from "primevue/dropdown";
import MultiSelect from "primevue/multiselect";
import {
	OpenSubtitlesSettings,
	languageList,
	siteLanguageList,
} from "./openSubtitles";

export default class OpenSubtitlesOptions extends Vue {
	languageList = languageList;
	siteLanguageList = siteLanguageList;
	settings: OpenSubtitlesSettings = new OpenSubtitlesSettings();
	savingInProgress: boolean = false;

	created() {
		console.log(languageList);
		chrome.storage.sync.get("OpenSubtitlesSettings", (response) => {
			console.log(response);
			if (response && response.OpenSubtitlesSettings)
				this.settings = JSON.parse(
					response.OpenSubtitlesSettings
				) as OpenSubtitlesSettings;
			console.log(this.settings);
		});
	}

	saveSettings() {
		this.savingInProgress = true;
		const settingsJson = JSON.stringify(this.settings);
		chrome.storage.sync.set({ OpenSubtitlesSettings: settingsJson }, () => {
			console.log("Settings set to: " + settingsJson);
			this.savingInProgress = false;
		});
	}
}
</script>


<style lang="scss" scoped>
@import "bootstrap";
@import "~primevue/resources/primevue.min.css";
@import "~primevue/resources/themes/bootstrap4-light-blue/theme.css";
</style>