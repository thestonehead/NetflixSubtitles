import { NetflixSettings } from './settings';
import { SubtitleItem } from './subtitle';
import VideoItem from './videoItem';

export class loadSubtitleMessageFromFile {
    message: string = "loadSubtitleFromFile";
    myVideoId: string | null;
    tabId: number | null;

    private fileBuffer: number[] | undefined;
    private fileName: string | undefined;
    private fileType: string | undefined;

    constructor(myVideoId: string | null, tabId: number | null) {
        this.myVideoId = myVideoId;
        this.tabId = tabId;
    }

    public async setFile(file: Blob, fileName: string, fileType: string | null = null): Promise<void> {
        this.fileName = fileName;
        this.fileType = fileType || file.type;

        this.fileBuffer = Array.from(new Uint8Array(await file.arrayBuffer()));
    }

    public getFile(): File | undefined {
        if (this.fileBuffer) {
            const ab = new ArrayBuffer(this.fileBuffer.length);
            const abView = new Uint8Array(ab);
            this.fileBuffer.forEach((v, i) => {
                abView[i] = v;
            });
            return new File([ab as BlobPart], this.fileName || "CustomSubtitleFile", { type: this.fileType });
        }
        return undefined;
    }

    public static fromData(data: any) {
        return Object.assign(new loadSubtitleMessageFromFile(null, null), data);
    }
}
export class loadSubtitleMessageFromUrl {
    message: string = "loadSubtitleFromUrl";
    myVideoId: string | null;
    tabId: number | null;
    subtitleUrl: string | null;
    sourceName: string | null;

    constructor(myVideoId: string | null, tabId: number | null, sourceName: string | null, subtitleUrl: string | null) {
        this.myVideoId = myVideoId;
        this.tabId = tabId;
        this.subtitleUrl = subtitleUrl;
        this.sourceName = sourceName;
    }


    public static fromData(data: any) {
        return Object.assign(new loadSubtitleMessageFromUrl(null, null, null, null), data);
    }
}
export class getSubtitleListFromSourceMessage {
    message: string = "getSubtitleListFromSource";
    myVideoId: string;
    sourceName: string;

    constructor(myVideoId: string, sourceName: string) {
        this.myVideoId = myVideoId;
        this.sourceName = sourceName;
    }
}

export class getSubtitleListFromSourceResponse {
    subtitles: Map<string, SubtitleItem[]>;

    constructor(subtitles: Map<string, SubtitleItem[]>) {
        this.subtitles = subtitles;
    }
}


export class getMetadataMessage {
    message: string = "getMetadata";
    tabId: number;

    constructor(tabId: number) {
        this.tabId = tabId;
    }
}

export class getMetadataResponse {
    videoItem: VideoItem;
    constructor(data: VideoItem) {
        this.videoItem = data;
    }
}

export class injectSubtitleMessage {
    message: string = "injectSubtitle";
    srtInput: string;
    settings: NetflixSettings;

    constructor(srtInput: string, settings: NetflixSettings) {
        this.srtInput = srtInput;
        this.settings = settings;
    }
}

export class setStatusMessage {
    message: string = "setStatus";
    status: string;

    constructor(status: string) {
        this.status = status;
    }
}

export class getMetadataFromTabMessage {
    message: string = "getMetadataFromTab";
}

export class getSettingsMessage {
    message: string = "getSettings";
}

export class setSettingsMessage {
    message: string = "setSettings";
    settings: NetflixSettings;

    constructor(settings: NetflixSettings) {
        this.settings = settings;
    }
}

export class openSubtitlesSelectorTabMessage {
    message: string = "openSubtitlesSelectorTab";
    url: string;
    myVideoId: string;
    source: string;

    constructor(url: string, myVideoId: string, source: string) {
        this.url = url;
        this.myVideoId = myVideoId;
        this.source = source;
    }
}