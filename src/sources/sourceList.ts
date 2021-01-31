import IGoToSource from "./IGoToSource";
import { PodnapisiNetGoToSource, sourceName as podnapisiNetSourceName } from "./podnapisiNet/podnapisiNet";
import PodnapisiNetOptions from "./podnapisiNet/podnapisiNetOptions.vue";
import OpenSubtitlesOptions from "./openSubtitles/openSubtitlesOptions.vue";
import { Vue } from "vue-class-component";
import { OpenSubtitlesGoToSource, sourceName as openSubtitlesSourceName } from './openSubtitles/openSubtitles';


export const allOptions: any[] = [
    PodnapisiNetOptions,
    OpenSubtitlesOptions
];


export class KeyValue<T> {
    public key: string;
    public value: T;

    constructor(key: string, value: T) {
        this.key = key;
        this.value = value;
    }
}

export const allGoToSources: KeyValue<IGoToSource>[] = [
    new KeyValue<IGoToSource>(openSubtitlesSourceName, new OpenSubtitlesGoToSource()),
    new KeyValue<IGoToSource>(podnapisiNetSourceName, new PodnapisiNetGoToSource())
];
