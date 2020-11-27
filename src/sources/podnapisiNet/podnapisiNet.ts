import { SubtitleItem } from "../../models/subtitle";
import VideoItem, { VideoItemType } from '@/models/videoItem';
import axios, { AxiosRequestConfig } from "axios";
import { getTransitionRawChildren } from 'vue';
import IGoToSource from '../IGoToSource';

export const sourceName: string = "PodnapisiNet";

export const languageList = [{ code: "af", name: "Afrikaans" },
{ code: "sq", name: "Albanian" },
{ code: "am", name: "Amharic" },
{ code: "ar", name: "Arabic" },
{ code: "an", name: "Aragonese" },
{ code: "es-ar", name: "Argentino" },
{ code: "as", name: "Assamese" },
{ code: "az", name: "Azerbaijani" },
{ code: "eu", name: "Basque" },
{ code: "be", name: "Belarus" },
{ code: "bn", name: "Bengali" },
{ code: "bs", name: "Bosnian" },
{ code: "pt-br", name: "Brazilian" },
{ code: "bg", name: "Bulgarian" },
{ code: "yyef", name: "Cantonese" },
{ code: "ca", name: "Catalan" },
{ code: "zh", name: "Chinese" },
{ code: "hr", name: "Croatian" },
{ code: "cs", name: "Czech" },
{ code: "da", name: "Danish" },
{ code: "nl", name: "Dutch" },
{ code: "dz", name: "Dzongkha" },
{ code: "en", name: "English" },
{ code: "eo", name: "Esperanto" },
{ code: "et", name: "Estonian" },
{ code: "fo", name: "Faroese" },
{ code: "fa", name: "Farsi" },
{ code: "fi", name: "Finnish" },
{ code: "fr", name: "French" },
{ code: "ka", name: "Georgian" },
{ code: "de", name: "German" },
{ code: "el", name: "Greek" },
{ code: "kl", name: "Greenlandic" },
{ code: "gu", name: "Gujarati" },
{ code: "ht", name: "Haitian" },
{ code: "haw", name: "Hawaiian" },
{ code: "he", name: "Hebrew" },
{ code: "hi", name: "Hindi" },
{ code: "hu", name: "Hungarian" },
{ code: "is", name: "Icelandic" },
{ code: "id", name: "Indonesian" },
{ code: "ga", name: "Irish" },
{ code: "it", name: "Italian" },
{ code: "ja", name: "Japanese" },
{ code: "jv", name: "Javanese" },
{ code: "kn", name: "Kannada" },
{ code: "kk", name: "Kazakh" },
{ code: "km", name: "Khmer" },
{ code: "rw", name: "Kinyarwanda" },
{ code: "ko", name: "Korean" },
{ code: "ku", name: "Kurdish" },
{ code: "ky", name: "Kyrgyz" },
{ code: "lo", name: "Lao" },
{ code: "la", name: "Latin" },
{ code: "lv", name: "Latvian" },
{ code: "lt", name: "Lithuanian" },
{ code: "lb", name: "Luxembourgish" },
{ code: "mk", name: "Macedonian" },
{ code: "ms", name: "Malay" },
{ code: "ml", name: "Malayalam" },
{ code: "mt", name: "Maltese" },
{ code: "cmn", name: "Mandarin" },
{ code: "mr", name: "Marathi" },
{ code: "mn", name: "Mongolian" },
{ code: "nb", name: "Ndonga" },
{ code: "ne", name: "Nepali" },
{ code: "se", name: "Northern Sami" },
{ code: "no", name: "Norwegian" },
{ code: "nn", name: "Norwegian Nynorsk" },
{ code: "oc", name: "Occitan" },
{ code: "or", name: "Oriya" },
{ code: "pa", name: "Panjabi" },
{ code: "ps", name: "Pashto" },
{ code: "pl", name: "Polish" },
{ code: "pt", name: "Portuguese" },
{ code: "qu", name: "Quechua" },
{ code: "ro", name: "Romanian" },
{ code: "ru", name: "Russian" },
{ code: "sr", name: "Serbian" },
{ code: "sr-latn", name: "Serbian (Latin)" },
{ code: "si", name: "Sinhala" },
{ code: "sk", name: "Slovak" },
{ code: "sl", name: "Slovenian" },
{ code: "es", name: "Spanish" },
{ code: "sw", name: "Swahili" },
{ code: "sv", name: "Swedish" },
{ code: "tl", name: "Tagalog" },
{ code: "ta", name: "Tamil" },
{ code: "te", name: "Telugu" },
{ code: "th", name: "Thai" },
{ code: "tr", name: "Turkish" },
{ code: "uk", name: "Ukrainian" },
{ code: "ur", name: "Urdu" },
{ code: "ug", name: "Uyghur" },
{ code: "vi", name: "Vietnamese" },
{ code: "vo", name: "Volapük" },
{ code: "wa", name: "Walloon" },
{ code: "cy", name: "Welsh" },
{ code: "xh", name: "Xhosa" },
{ code: "zu", name: "Zulu" }];

export class PodnapisiNetSettings {
    public languages: string[] = [];
}

export class PodnapisiNetGoToSource implements IGoToSource {

    public getGoToUrl(videoItem: VideoItem): Promise<string> {
        if (!videoItem){
            return Promise.reject("videoItem is null");
        }
        return new Promise((resolveFunc, rejectFunc) => {
            chrome.storage.sync.get("PodnapisiNetSettings", (response) => {
                try {
                    const settings = response && response.PodnapisiNetSettings ? JSON.parse(
                        response.PodnapisiNetSettings
                    ) as PodnapisiNetSettings : new PodnapisiNetSettings();
                    const baseUrl =
                        "https://www.podnapisi.net/subtitles/search/advanced";
                    const languages =
                        settings?.languages?.length > 0
                            ? settings.languages.map((l)=>`language=${l}`).join("&")
                            : null;
                    const tvShow = 
                        videoItem.type == VideoItemType.show
                            ? "movie_type=tv-series"
                            : null;
                    const season = videoItem.season
                        ? "seasons=" + videoItem.season
                        : null;
                    const episode = videoItem.episode
                        ? "episodes=" + videoItem.episode
                        : null;
                    const year = videoItem.year
                        ? "year=" + videoItem.year
                        : null;
                    const title = "keywords=" + videoItem.title.replaceAll(" ", "+");
                    resolveFunc(baseUrl + "?" + [languages, tvShow, season, episode, year, title]
                        .filter((x) => x)
                        .join("&"));
                } catch (e) {
                    rejectFunc(e);
                }
            });
        });
    }
}
/*
    async loadSubtitleList(videoItem: VideoItem): Promise<SubtitleItem[]> {
        const response = await axios.get("https://www.podnapisi.net/en/subtitles/search/advanced",
            {
                params: {
                    "keywords": videoItem.title.replace(" ", "+"),
                    "year": videoItem.year,
                    "seasons": videoItem.season,
                    "episodes": videoItem.episode
                }
            });
        if (response.status == 200) {
            var parser = new DOMParser();
            var doc = parser.parseFromString(response.data, "text/html");
            const subtitles: SubtitleItem[] = [];
            doc.querySelectorAll("table tr.subtitle-entry").forEach((row) => {
                const name = row.querySelector(".release")?.textContent || videoItem.title;
                const downloadCount = row.querySelector("td:nth-child(6)")?.textContent;
                const uploadedDate = row.querySelector("td:nth-child(9)")?.textContent;
                const fps = row.querySelector("td:nth-child(2)")?.textContent;
                const subtitleLink = row.getAttribute("href");
                const downloadUrl = "https://www.podnapisi.net" + subtitleLink?.trim() + "/download"
                const language = row.querySelector(".language")?.textContent;
                subtitles.push(
                    new SubtitleItem(name.trim(), (Number)(downloadCount?.trim()), downloadUrl, language ?? "en")
                );

            });
            return subtitles;
        }
        throw new Error("No subtitles found");
    }
}

function LoadSubtitlesFromPodnapisiNet(videoItem: VideoItem) {
    const promise = new Promise((resolveFunc, rejectFunc) => {
        const type = videoItem.season ? 'tv-series' : 'movie';
        var xhr = new XMLHttpRequest();
        //xhr.open("GET", `https://www.podnapisi.net/en/subtitles/search/advanced?keywords=${videoItem.title.replace(" ","+")}&year=${videoItem.year}&movie_type=${videoItem.type}&seasons=${videoItem.season}&episodes=${videoItem.episode}`, true);
        xhr.open("GET", `https://www.podnapisi.net/en/subtitles/search/advanced?keywords=${videoItem.title.replace(" ", "+")}&year=${videoItem.year}&seasons=${videoItem.season}&episodes=${videoItem.episode}`, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status != 200) {
                    rejectFunc();
                    return;
                }
                var parser = new DOMParser();
                var doc = parser.parseFromString(xhr.response, "text/html");
                const subtitles = [];
                doc.querySelectorAll("table tr.subtitle-entry").forEach((row) => {
                    const name = row.querySelector(".release")?.innerText || videoItem.title;
                    const downloadCount = row.querySelector("td:nth-child(6)").innerText;
                    const uploadedDate = row.querySelector("td:nth-child(9)").innerText;
                    const fps = row.querySelector("td:nth-child(2)").innerText;
                    const subtitleLink = row.dataset["href"];
                    const downloadUrl = "https://www.podnapisi.net" + subtitleLink.trim() + "/download"
                    const language = row.querySelector(".language").innerText;
                    subtitles.push(
                        new SubtitleItem(name.trim(), downloadCount.trim(), downloadUrl, language)
                    );

                });
                videoItem.subtitles = subtitles;
                resolveFunc(subtitles);
            }
        }
        xhr.send();
    });
    return promise;
}


export { languageList, PodnapisiNetSettings }*/