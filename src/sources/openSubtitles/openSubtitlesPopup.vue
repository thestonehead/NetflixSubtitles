<template>
	<div>
		<a @click="goToWebsite()">Go to OpenSubtitles</a>
	</div>
</template>

<script lang="ts">
import VideoItem, { VideoItemType } from "@/models/videoItem";
import { Vue } from "vue-class-component";
import { Prop } from "vue-property-decorator";
import { languageList } from "../podnapisiNet/podnapisiNet";
import { OpenSubtitlesSettings, sourceName } from "./openSubtitles";

export default class OpenSubtitlesPopup extends Vue {
	@Prop()
	public videoItem!: VideoItem;

	private settings: OpenSubtitlesSettings = new OpenSubtitlesSettings();

	created() {
		chrome.storage.sync.get("OpenSubtitlesSettings", (response) => {
			if (response && response.OpenSubtitlesSettings)
				this.settings = JSON.parse(
					response.OpenSubtitlesSettings
				) as OpenSubtitlesSettings;
		});
    }


    public goToWebsite() : void{
        chrome.tabs.create(
			{
				url: this.searchUrl()
			},
			(tab: any) => {
				chrome.tabs.executeScript(tab.id, {
					code: `alert("hello");window.myVideoId=${this.videoItem.getKey())};`,
				});
			}
		);
    }

	public searchUrl(): string {
		console.log(this.settings);
		console.log(this.videoItem);
		const baseUrl =
			"https://www.opensubtitles.org/" +
			this.settings.siteLanguage +
			"/search";
		const languages =
			this.settings?.languages?.length > 0
				? "sublanguageid-" + this.settings.languages.join(",")
				: null;
		const tvShow =
			this.videoItem.type == VideoItemType.show
				? "searchonlytvseries-on"
				: null;
		const season = this.videoItem.season
			? "season-" + this.videoItem.season
			: null;
		const episode = this.videoItem.episode
			? "episode-" + this.videoItem.episode
			: null;
		const year = this.videoItem.year
			? "movieyear-" + this.videoItem.year
			: null;
		const title = "moviename-" + this.videoItem.title.replaceAll(" ", "+");

		return [baseUrl, languages, tvShow, season, episode, year, title]
			.filter((x) => x)
			.join("/");

		//https://www.opensubtitles.org/en/search/sublanguageid-hrv,eng/searchonlytvseries-on/season-2/episode-4/movieyearsign-5/movieyear-2004/moviename-it+crowd
		//https://www.opensubtitles.org/en/search/imdbid-296572/sublanguageid-hrv,eng/moviename-pitch black
	}
}
</script>

<style lang="scss" scoped>
</style>