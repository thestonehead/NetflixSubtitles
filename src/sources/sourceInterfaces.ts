import VideoItem from "../models/videoItem";



export interface IGoToSource {
    getGoToUrl(videoItem: VideoItem): Promise<string>;
}


export interface ISourceOptionsComponentBase {
    model: any;
}

export interface ISourceOptionsComponent<T> extends ISourceOptionsComponentBase {
    model: T;
}