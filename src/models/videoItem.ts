export default class VideoItem {
    videoId: number;
    episodeId: number;
    title: string;
    type: VideoItemType;
    year: number;
    episode: number | undefined;
    season: number | undefined;
    dateAdded: number;

    constructor(videoId: number, episodeId: number, title: string, type: string, year: number, episode: number | undefined, season: number | undefined) {
        this.videoId = videoId;
        this.episodeId = episodeId;
        this.title = title;
        this.type = type as VideoItemType;
        this.year = year;
        this.episode = episode;
        this.season = season;
        this.dateAdded = new Date().getUTCDate();
    }

    public static fromAny(object: any): VideoItem {
        return new VideoItem(object.videoId, object.episodeId, object.title, object.type, object.year, object.episode, object.season);
    }

    public getKey(): string {
        return this.videoId + (this.episodeId ? (":" + this.episodeId) : "");
    }

}


export enum VideoItemType {
    show = "show",
    movie = "movie"
}