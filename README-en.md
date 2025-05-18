[中文版本](README.md)

# WereBlock

A simple and easy-to-manage Firefox extension to help you block specific websites and reduce online distractions.

## Features

* Easily block and unblock specific websites.
* Manage your blocked list centrally through the options page.
* The options page supports adding, removing, editing, and copying URLs in the blocked list.
* Quickly block/unblock the current website via the toolbar popup.
* Supports light and dark themes.
* Supports multiple languages (currently includes Traditional Chinese and English).
* Redirects to a blocked page after blocking, and automatically redirects back to the original site after unblocking via the popup.

## Installation

You can install this extension from source using the following steps:

1.  Clone the repository:
    ```bash
    git clone https://github.com/hhs456/toolkid.wereblock.git
    ```
2.  Open Firefox.
3.  Navigate to `about:debugging#/runtime/this-firefox` in the address bar and press Enter.
4.  Click the "Load Temporary Add-on..." button.
5.  Browse to the project folder you cloned locally and select the `manifest.json` file.

The extension will be loaded and ready to use. Please note that add-ons loaded this way are removed when Firefox is closed and need to be reloaded. For permanent installation, you need go to [Firefox Add-ons website (AMO)](https://addons.mozilla.org/).

## Usage

* **Blocking a Website:**
    * On the options page (Tools -> Add-ons and themes -> Your extension -> Options), enter a URL and click "Add".
    * Alternatively, visit the website you want to block, click the extension icon in the toolbar, and click "Block this site" in the popup.
* **Managing the List:**
    * View all blocked websites on the options page.
    * Click the "Edit" button next to each URL to modify it, then click "Save" or "Cancel".
    * Click the "Remove" button next to each URL to remove it from the list.
    * The URL text is directly selectable and copyable.
* **Unblocking:**
    * Remove the URL from the list on the options page.
    * Alternatively, while on the blocked page, click the toolbar icon and click "Unblock this site" in the popup. After unblocking via the popup, you will be automatically redirected back to the original site.

## Project Structure

* `manifest.json`: Extension manifest file, containing name, version, permissions, etc.
* `background.js`: Background script, responsible for listening to web requests and managing the blocking logic.
* `options/`: Contains files related to the options page.
    * `options.html`: HTML structure for the options page.
    * `options.js`: JavaScript logic for the options page.
    * `options.css`: Styles for the options page.
* `popup/`: Contains files related to the toolbar popup.
    * `popup.html`: HTML structure for the popup.
    * `popup.js`: JavaScript logic for the popup.
    * `popup.css`: Styles for the popup.
* `block_page/`: Contains files for the blocked redirection page.
    * `blocked.html`: HTML structure for the blocked page.
    * `blocked.js`: JavaScript logic for the blocked page (displaying URL, go back).
    * `blocked.css`: Styles for the blocked page.
* `_locales/`: Contains internationalization language files.
    * `en/messages.json`: English messages.
    * `zh_TW/messages.json`: Traditional Chinese messages.
* `icons/`: Contains icon files required by the extension.

## Internationalization (i18n)

This extension supports multiple languages. All user-visible text is stored in `messages.json` files within the `_locales` folder.

To add a new language:

1.  Create a new subfolder within the `_locales` folder, named using the locale code (e.g., `fr` for French, `ja` for Japanese).
2.  Copy the `messages.json` file into the new subfolder.
3.  Translate the text content of the `message` properties in the new file.

## Contributing

Contributions are welcome! If you find a bug, have a feature suggestion, or want to submit code changes.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). See the [LICENSE](LICENSE.md) file for details.

## Acknowledgements

This document and part of the code were developed in collaboration with Google Gemini AI.