
import IGoToSource from "../IGoToSource";
import { SubtitleItem } from "../../models/subtitle";
import VideoItem, { VideoItemType } from '@/models/videoItem';
import Axios from 'axios';

export const sourceName: string = "OpenSubtitles";

export const languageList = [{ code: "all", name: "ALL" },
{ code: "hrv", name: "Croatian" },
{ code: "eng", name: "English" },
{ code: "abk", name: "Abkhazian" },
{ code: "afr", name: "Afrikaans" },
{ code: "alb", name: "Albanian" },
{ code: "ara", name: "Arabic" },
{ code: "arg", name: "Aragonese" },
{ code: "arm", name: "Armenian" },
{ code: "asm", name: "Assamese" },
{ code: "ast", name: "Asturian" },
{ code: "aze", name: "Azerbaijani" },
{ code: "baq", name: "Basque" },
{ code: "bel", name: "Belarusian" },
{ code: "ben", name: "Bengali" },
{ code: "bos", name: "Bosnian" },
{ code: "bre", name: "Breton" },
{ code: "bul", name: "Bulgarian" },
{ code: "bur", name: "Burmese" },
{ code: "cat", name: "Catalan" },
{ code: "chi", name: "Chinese (simplified)" },
{ code: "zht", name: "Chinese (traditional)" },
{ code: "zhe", name: "Chinese bilingual" },
{ code: "cze", name: "Czech" },
{ code: "dan", name: "Danish" },
{ code: "dut", name: "Dutch" },
{ code: "epo", name: "Esperanto" },
{ code: "est", name: "Estonian" },
{ code: "ext", name: "Extremaduran" },
{ code: "fin", name: "Finnish" },
{ code: "fre", name: "French" },
{ code: "gla", name: "Gaelic" },
{ code: "glg", name: "Galician" },
{ code: "geo", name: "Georgian" },
{ code: "ger", name: "German" },
{ code: "ell", name: "Greek" },
{ code: "heb", name: "Hebrew" },
{ code: "hin", name: "Hindi" },
{ code: "hun", name: "Hungarian" },
{ code: "ice", name: "Icelandic" },
{ code: "ibo", name: "Igbo" },
{ code: "ind", name: "Indonesian" },
{ code: "ina", name: "Interlingua" },
{ code: "gle", name: "Irish" },
{ code: "ita", name: "Italian" },
{ code: "jpn", name: "Japanese" },
{ code: "kan", name: "Kannada" },
{ code: "kaz", name: "Kazakh" },
{ code: "khm", name: "Khmer" },
{ code: "kor", name: "Korean" },
{ code: "kur", name: "Kurdish" },
{ code: "lav", name: "Latvian" },
{ code: "lit", name: "Lithuanian" },
{ code: "ltz", name: "Luxembourgish" },
{ code: "mac", name: "Macedonian" },
{ code: "may", name: "Malay" },
{ code: "mal", name: "Malayalam" },
{ code: "mni", name: "Manipuri" },
{ code: "mon", name: "Mongolian" },
{ code: "mne", name: "Montenegrin" },
{ code: "nav", name: "Navajo" },
{ code: "nep", name: "Nepali" },
{ code: "sme", name: "Northern Sami" },
{ code: "nor", name: "Norwegian" },
{ code: "oci", name: "Occitan" },
{ code: "ori", name: "Odia" },
{ code: "per", name: "Persian" },
{ code: "pol", name: "Polish" },
{ code: "por", name: "Portuguese" },
{ code: "pob", name: "Portuguese (BR)" },
{ code: "pom", name: "Portuguese (MZ)" },
{ code: "rum", name: "Romanian" },
{ code: "rus", name: "Russian" },
{ code: "scc", name: "Serbian" },
{ code: "snd", name: "Sindhi" },
{ code: "sin", name: "Sinhalese" },
{ code: "slo", name: "Slovak" },
{ code: "slv", name: "Slovenian" },
{ code: "som", name: "Somali" },
{ code: "spa", name: "Spanish" },
{ code: "spn", name: "Spanish (EU)" },
{ code: "spl", name: "Spanish (LA)" },
{ code: "swa", name: "Swahili" },
{ code: "swe", name: "Swedish" },
{ code: "syr", name: "Syriac" },
{ code: "tgl", name: "Tagalog" },
{ code: "tam", name: "Tamil" },
{ code: "tat", name: "Tatar" },
{ code: "tel", name: "Telugu" },
{ code: "tha", name: "Thai" },
{ code: "tur", name: "Turkish" },
{ code: "tuk", name: "Turkmen" },
{ code: "ukr", name: "Ukrainian" },
{ code: "urd", name: "Urdu" },
{ code: "vie", name: "Vietnamese" }];


export const siteLanguageList = [
    { code: "en", name: "English subtitles - opensubtitles.org" },
    { code: "an", name: "Subtitols en aragonés - opensubtitles.org" },
    { code: "ar", name: "ترجمة عربى - opensubtitles.org" },
    { code: "eu", name: "Euskarazko azpidatziak - opensubtitles.org" },
    { code: "bg", name: "Български субтитри - opensubtitles.org" },
    { code: "hr", name: "Hrvatski titlovi - opensubtitles.org" },
    { code: "ca", name: "Subtítols en Català - opensubtitles.org" },
    { code: "cs", name: "České titulky - opensubtitles.org" },
    { code: "da", name: "Danske undertekster - opensubtitles.org" },
    { code: "de", name: "Deutsche Untertitel - opensubtitles.org" },
    { code: "nl", name: "Nederlandse Ondertitels - opensubtitles.org" },
    { code: "et", name: "Eesti subtiitrid - opensubtitles.org" },
    { code: "eo", name: "Esperantaj subtekstoj - opensubtitles.org" },
    { code: "es", name: "subtítulos en Espańol - opensubtitles.org" },
    { code: "fa", name: "زیرنویس فارسی - opensubtitles.org" },
    { code: "fi", name: "Suomi tekstitykset - opensubtitles.org" },
    { code: "fr", name: "Sous-titres français - opensubtitles.org" },
    { code: "gl", name: "Subtítulos en galego - opensubtitles.org" },
    { code: "gr", name: "Ελληνικά υπότιτλοι - opensubtitles.org" },
    { code: "he", name: "כתוביות עברית - opensubtitles.org" },
    { code: "hi", name: "हिन्दी सबटायटल - opensubtitles.org" },
    { code: "hu", name: "Magyar feliratok - opensubtitles.org" },
    { code: "is", name: "Íslenskir Textar - opensubtitles.org" },
    { code: "id", name: "Subjudul Bahasa Indonesia - opensubtitles.org" },
    { code: "it", name: "Italiano sottotitoli - opensubtitles.org" },
    { code: "ja", name: "日本のサブタイトル - opensubtitles.org" },
    { code: "ka", name: "ქართული სუბტიტრები - opensubtitles.org" },
    { code: "km", name: "អត្ថបទរឿងជាភាសាខ្មែរ - opensubtitles.org" },
    { code: "ko", name: "한국 부제 - opensubtitles.org" },
    { code: "mk", name: "Македонски преводи - opensubtitles.org" },
    { code: "mc", name: "Subjudul Bahasa Melayu - opensubtitles.org" },
    { code: "no", name: "Norske undertekster - opensubtitles.org" },
    { code: "oc", name: "Sostítols en occitan - opensubtitles.org" },
    { code: "pl", name: "Polskie napisy - opensubtitles.org" },
    { code: "pt", name: "legendas em Portuguęs - opensubtitles.org" },
    { code: "pb", name: "legendas em Português Brasileiro - opensubtitles.org" },
    { code: "ro", name: "Romana subtitrari - opensubtitles.org" },
    { code: "ru", name: "Русские субтитры - opensubtitles.org" },
    { code: "si", name: "සින්හල උපසිරසි - opensubtitles.org" },
    { code: "sq", name: "Titra shqip - opensubtitles.org" },
    { code: "sr", name: "Srpski prevodi - opensubtitles.org" },
    { code: "sk", name: "Slovenské titulky - opensubtitles.org" },
    { code: "sv", name: "Svenska undertexter - opensubtitles.org" },
    { code: "th", name: "คำบรรยายไทย - opensubtitles.org" },
    { code: "tr", name: "Türkçe altyazı - opensubtitles.org" },
    { code: "tl", name: "Tagalog subtitles - opensubtitles.org" },
    { code: "uk", name: "Українські субтитри - opensubtitles.org" },
    { code: "vi", name: "Phụ đề tiếng Việt - opensubtitles.org" },
    { code: "zh", name: "中文字幕 - opensubtitles.org" }
];

export class OpenSubtitlesSettings {
    public languages: string[] = [];
    public siteLanguage: string = "en";
}


export class OpenSubtitlesGoToSource implements IGoToSource {
    public getGoToUrl(videoItem: VideoItem): Promise<string> {
        if (!videoItem){
            return Promise.reject("videoItem is null");
        }
        return new Promise((resolveFunc, rejectFunc) => {
            chrome.storage.sync.get("OpenSubtitlesSettings", (response) => {
                try {
                    const settings = response && response.OpenSubtitlesSettings ? JSON.parse(
                        response.OpenSubtitlesSettings
                    ) as OpenSubtitlesSettings : new OpenSubtitlesSettings();
                    const baseUrl =
                        "https://www.opensubtitles.org/" +
                        settings.siteLanguage +
                        "/search";
                    const languages =
                        settings?.languages?.length > 0
                            ? "sublanguageid-" + settings.languages.join(",")
                            : null;
                    const tvShow =
                        videoItem.type == VideoItemType.show
                            ? "searchonlytvseries-on"
                            : null;
                    const season = videoItem.season
                        ? "season-" + videoItem.season
                        : null;
                    const episode = videoItem.episode
                        ? "episode-" + videoItem.episode
                        : null;
                    const year = videoItem.year
                        ? "movieyear-" + videoItem.year
                        : null;
                    const title = "moviename-" + videoItem.title.replaceAll(" ", "+");

                    resolveFunc([baseUrl, languages, tvShow, season, episode, year, title]
                        .filter((x) => x)
                        .join("/"));
                } catch (e) {
                    rejectFunc(e);
                }
            });
        });
    }
}