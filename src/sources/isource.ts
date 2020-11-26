import { SubtitleItem } from "../models/subtitle";
import VideoItem from "../models/videoItem";


export default interface ISource {
    loadSubtitleList(videoItem: VideoItem): Promise<SubtitleItem[]>;
    downloadSubtitle(url: string): Promise<Blob | File>;
}