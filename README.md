# yomichan-sr-hr 🇷🇸 🇭🇷

### A Serbo-Croatian hover dictionary. It's a modified version of Yomichan that works with Serbian and Croatian.

#### Examples:
![example-1](https://github.com/seth-js/yomichan-sr-hr/assets/83692925/104599c8-0f80-40a7-9a46-10ac2f7d13d7)
![example-2](https://github.com/seth-js/yomichan-sr-hr/assets/83692925/2f4fea5e-9935-4d74-a28a-70e7590d91f3)

### Instructions (firefox)
1. Download the repository, clone it, whatever.

2. Download `yomichan-settings-2023-05-31.json`, `SerboCroatian.Dictionary.zip`, and either `Serbian.Forvo.zip` or `Croatian.Forvo.zip` from the [Releases](https://github.com/seth-js/yomichan-sr-hr/releases) section.

3. Go to: about:debugging#/runtime/this-firefox

4. Click `Load Temporary Add-on`…

5. Navigate to `yomichan-firefox/manifest.json` in the repository and choose it.

*Yomichan should now be installed.*

6. Head to the bottom of the Yomichan settings page.

7. Select `Import Settings`.

8. Choose `yomichan-settings-2023-05-31.json`

9. Search for `Enable search page clipboard text monitoring` and turn it off and on.

10. Go to the `Dictionaries` section and import `SerboCroatian.Dictionary.zip`

### Instructions (chromium-based)
1. Download the repository, clone it, whatever.

2. Download `yomichan-settings-2023-05-31.json`, `SerboCroatian.Dictionary.zip`, and either `Serbian.Forvo.zip` or `Croatian.Forvo.zip` from the [Releases](https://github.com/seth-js/yomichan-sr-hr/releases) section.

3. Go to: chrome://extensions/

4. Turn on `Developer mode`

5. Click `Load unpacked`

6. Navigate to `yomichan-chromium` in the repository, and select the folder.

*Yomichan should now be installed.*

7. Head to the bottom of the Yomichan settings page.

8. Select `Import Settings`.

9. Choose `yomichan-settings-2023-05-31.json`

10. Search for `Enable search page clipboard text monitoring` and turn it off and on.

11. Go to the `Dictionaries` section and import `SerboCroatian.Dictionary.zip`

*Everything should now be set up for Yomichan on Firefox/Chromium.*

### Forvo setup

1. Extract the `Croatian Forvo` folder from `Croatian.Forvo.zip` or extract the `Serbian Forvo` folder from `Serbian.Forvo.zip`

2. Throw it in your `addons21` folder in your [Anki appdata folder](https://docs.ankiweb.net/files.html?file-locations#file-locations).

*Mine's in `C:\Users\[Username]\AppData\Roaming\Anki2\addons21`*

3. Install [AnkiConnect](https://ankiweb.net/shared/info/2055492159).

4. Restart Anki.

*Anki must be open to connect to the Forvo server.*

#### Inflected audio feature

I added the ability to hear the inflected version of the word you've clicked on. By clicking the sound button while holding the Alt key, it will play the inflected version (ex. govorim instead of govoriti).

### Notes

If you are already using Yomichan for Japanese, consider using this extension in a separate browser profile. This is a modified version of Yomichan and the unmodified version will have unintended results.

The dictionary takes data from [Kaikki's Serbo-Croatian Wiktionary dump](https://kaikki.org/dictionary/Serbo-Croatian/) and specially formats it to work with this custom version of Yomichan. It contains over ~70,000 lemmas. That sounds like a lot, but there are still cases where you'll encounter a word that doesn't have a definition.

Many thanks to [Tatu Ylonen](http://www.lrec-conf.org/proceedings/lrec2022/pdf/2022.lrec-1.140.pdf)'s project [Wiktextract](https://github.com/tatuylonen/wiktextract). Without it, this project, and others I've made like it wouldn't exist.

I also want to thank [Alexei Yatskov](https://github.com/FooSoft) for creating Yomichan. It's the best hover dictionary available, and I'm glad I've been able to tweak it to work with other languages.

The Firefox extension unfortunately doesn't survive restarts. This means you'll have to add it through the debugging page each time, although your settings and the dictionary will not be lost.

Chrome is planning to drop support for extensions that use Manifest V2. This means that unless the developer for Yomichan updates it by then, Chrome may no longer be supported.

Yomichan's developer has stopped working on the project. This means that the Manifest V3 issue will most likely break Yomichan possibly on both browsers unless a new developer comes in and forks the project and fixes the handlebars issue. I'll most likely just keep an older browser installed to keep using the extension.
