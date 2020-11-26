<template>
	<form @submit.prevent="saveSettings">
		<div class="card-header container-fluid">
			<div class="row">
				<div class="col-11">
					<h6>PodnapisiNet settings</h6>
				</div>
				<div class="col-1">
					<a href="https://podnapisi.net"
						><i class="pi pi-home mt-1"></i
					></a>
				</div>
			</div>
		</div>
		<div class="form-group card-body">
			<MultiSelect
				class="col-12"
				id="podnapisi-language"
				v-model="settings.languages"
				:options="languageList"
				placeholder="Pick languages"
				dataKey="code"
				optionLabel="name"
				optionValue="code"
				:filter="true"
			/>
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
///<reference types="chrome" />
import { Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import { languageList, PodnapisiNetSettings } from "./podnapisiNet";
import MultiSelect from "primevue/multiselect";

export default class PodnapisiNetOptions extends Vue {
	languageList = languageList;
	settings: PodnapisiNetSettings = new PodnapisiNetSettings();
	savingInProgress: boolean = false;

	created() {
		console.log(languageList);
		chrome.storage.sync.get("PodnapisiNetSettings", (response) => {
			console.log(response);
			if (response && response.PodnapisiNetSettings)
				this.settings = JSON.parse(
					response.PodnapisiNetSettings
				) as PodnapisiNetSettings;
			console.log(this.settings);
		});
	}

	saveSettings() {
		this.savingInProgress = true;
		const settingsJson = JSON.stringify(this.settings);
		chrome.storage.sync.set({ PodnapisiNetSettings: settingsJson }, () => {
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