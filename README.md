[English Version](README-en.md)

# 我不亂看 (WereBlock)

一個簡單且易於管理的 Firefox 擴充功能，幫助您封鎖特定的網站，減少網路干擾。

## 功能特色

* 輕鬆封鎖和解除封鎖特定網站。
* 透過選項頁面集中管理封鎖清單。
* 選項頁面支援新增、移除、修改和複製封鎖清單中的網址。
* 透過工具列彈出視窗快速封鎖/解除封鎖當前網站。
* 支援淺色和深色主題。
* 支援多國語言 (目前包含繁體中文和英文)。
* 封鎖後重新導向至提示頁面，解除封鎖後自動跳轉回原網站。

## 安裝

您可以透過以下步驟從原始碼安裝此擴充功能：

1.  複製 (Clone) 本地儲存庫：
    ```bash
    git clone https://github.com/hhs456/toolkid.wereblock.git
    ```
2.  打開 Firefox。
3.  在網址列輸入 `about:debugging#/runtime/this-firefox` 並按下 Enter。
4.  點擊「載入臨時附加元件...」(Load Temporary Add-on...) 按鈕。
5.  瀏覽到您複製到本地的專案資料夾，選擇 `manifest.json` 檔案。

擴充功能將會被載入並可以使用。請注意，以這種方式載入的附加元件在 Firefox 關閉後會被移除，需要重新載入。若要永久安裝，需要至 [Firefox 附加元件網站 (AMO)](https://addons.mozilla.org/)。

## 使用說明

* **封鎖網站：**
    * 在選項頁面 (工具 -> 附加元件與主題 -> 您的擴充功能 -> 選項)，輸入網址並點擊「新增」。
    * 或訪問要封鎖的網站，點擊工具列上的擴充功能圖標，在彈出視窗中點擊「封鎖此網站」。
* **管理清單：**
    * 在選項頁面查看所有被封鎖的網站。
    * 點擊每個網址旁邊的「修改」按鈕來編輯網址，點擊「儲存」或「取消」。
    * 點擊每個網址旁邊的「移除」按鈕來將其從清單中移除。
    * 網址文字可以直接選取和複製。
* **解除封鎖：**
    * 在選項頁面從清單中移除網址。
    * 或在被封鎖頁面時，點擊工具列圖標，在彈出視窗中點擊「解除封鎖此網站」。解除封鎖後將自動跳轉回原網站。

## 專案結構

* `manifest.json`: 擴充功能的設定檔，包含名稱、版本、權限等。
* `background.js`: 背景腳本，負責監聽網路請求和管理封鎖邏輯。
* `options/`: 包含選項頁面相關檔案。
    * `options.html`: 選項頁面的 HTML 結構。
    * `options.js`: 選項頁面的 JavaScript 邏輯。
    * `options.css`: 選項頁面的樣式。
* `popup/`: 包含工具列彈出視窗相關檔案。
    * `popup.html`: 彈出視窗的 HTML 結構。
    * `popup.js`: 彈出視窗的 JavaScript 邏輯。
    * `popup.css`: 彈出視窗的樣式。
* `block_page/`: 包含被封鎖後重新導向的提示頁面檔案。
    * `blocked.html`: 提示頁面的 HTML 結構。
    * `blocked.js`: 提示頁面的 JavaScript 邏輯 (顯示網址、返回)。
    * `blocked.css`: 提示頁面的樣式。
* `_locales/`: 包含國際化語言檔案。
    * `en/messages.json`: 英文語系文字。
    * `zh_TW/messages.json`: 繁體中文語系文字。
* `icons/`: 包含擴充功能所需的圖標檔案。

## 國際化 (i18n)

本擴充功能支援多國語言。所有使用者可見的文字都儲存在 `_locales` 資料夾的 `messages.json` 檔案中。

要新增一種語言：

1.  在 `_locales` 資料夾下建立一個新的子資料夾，資料夾名稱使用語言環境代碼 (例如：`fr` 代表法文，`ja` 代表日文)。
2.  將 `messages.json` 檔案複製到新的子資料夾中。
3.  翻譯新檔案中 `message` 屬性的文字內容。

## 貢獻

如果您發現 Bug、有功能建議，或想提交程式碼修改，歡迎任何形式的貢獻！

## 授權

本專案根據 [MIT 授權](https://opensource.org/licenses/MIT) 釋出。詳細內容請參閱 [LICENSE](LICENSE.md) 檔案。

## 致謝

本文件與部分程式碼由 Google Gemini AI 協作。

