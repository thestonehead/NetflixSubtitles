import VideoItem from "../models/videoItem";



export default interface IGoToSource {
    getGoToUrl(videoItem: VideoItem): Promise<string>;
}
