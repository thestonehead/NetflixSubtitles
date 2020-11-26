export class SubtitleItem {
    used: boolean = false;
    name: string;
    downloadCount: number;
    downloadUrl: string;
    language: string;

    constructor(name: string, downloadCount: number, downloadUrl: string, language: string) {
        this.used = false;
        this.name = name;
        this.downloadCount = downloadCount;
        this.downloadUrl = downloadUrl;
        this.language = language;

    }

    getKey() { return "subtitle:" + this.downloadUrl }



}

export class SubtitleFileItem {
    dateAdded: number = new Date().getUTCDate();
    srt: File | Blob | string;

    constructor(srt: File | Blob | string) {
        this.srt =
            srt;
    }
};

