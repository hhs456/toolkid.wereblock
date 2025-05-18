// popup.js

// 獲取 DOM 元素
const currentUrlElement = document.getElementById('currentUrl');
const blockButton = document.getElementById('blockButton');
const statusMessageElement = document.getElementById('statusMessage');

// --- 載入國際化文字 ---
function loadLocalizedText() {
  // 頁面標題（彈出頁面通常沒有明顯標題，但可以設定 document.title）
  document.title = browser.i18n.getMessage('extensionName'); // 使用擴充功能名稱作為標題

  // 按鈕文字和其他狀態文字會根據網站是否被封鎖動態設定
  // 狀態訊息元素先清空或設定一個預設值
  statusMessageElement.textContent = ''; // 初始清空
}

// --- 修改：獲取當前分頁網址 和 分頁 ID ---
async function getCurrentTabData() { // 改名以便同時返回 URL 和 tabId
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });

    if (tabs && tabs.length > 0) {
      const currentTab = tabs[0]; // 獲取整個分頁物件
      const currentTabUrl = currentTab.url;
      const currentTabId = currentTab.id; // 獲取分頁 ID

      console.log("獲取到當前分頁 URL:", currentTabUrl, "ID:", currentTabId);

      const blockedPageUrlBase = browser.runtime.getURL("block_page/blocked.html");

      if (currentTabUrl.startsWith(blockedPageUrlBase)) {
        console.log("當前頁面是我們的封鎖頁面。");
        try {
          const urlObject = new URL(currentTabUrl);
          const originalBlockedUrl = urlObject.searchParams.get('url');

          if (originalBlockedUrl) {
            console.log("從封鎖頁面網址解析出原始被封鎖網址:", originalBlockedUrl);
            // 返回原始網址 和 分頁 ID
            return { url: originalBlockedUrl, tabId: currentTabId };
          } else {
            console.warn("封鎖頁面網址中沒有找到原始網址參數:", currentTabUrl);
            statusMessageElement.textContent = browser.i18n.getMessage('gettingUrlError') + " (無原始網址參數)";
            blockButton.disabled = true;
            return { url: null, tabId: currentTabId }; // 無法獲取網址，但仍返回 tabId
          }
        } catch (e) {
          console.error("解析封鎖頁面網址參數失敗:", e);
          statusMessageElement.textContent = browser.i18n.getMessage('gettingUrlError') + " (網址解析錯誤)";
          blockButton.disabled = true;
          return { url: null, tabId: currentTabId }; // 解析失敗，但仍返回 tabId
        }
      } else {
        console.log("當前頁面不是封鎖頁面，直接使用 URL:", currentTabUrl);
        // 直接返回獲取的網址 和 分頁 ID
        return { url: currentTabUrl, tabId: currentTabId };
      }
    } else {
      console.log("沒有找到當前分頁或無法獲取其 URL/ID。");
      statusMessageElement.textContent = browser.i18n.getMessage('gettingUrlError');
      blockButton.disabled = true;
      return { url: null, tabId: null }; // 無法獲取分頁資訊
    }
  } catch (error) {
    console.error('獲取當前分頁數據失敗:', error); // 更新錯誤訊息
    statusMessageElement.textContent = browser.i18n.getMessage('gettingUrlError');
    blockButton.disabled = true;
    return { url: null, tabId: null };
  }
}


// --- 向背景腳本發送訊息 (檢查、新增、移除) ---
// 新增 tabId 和 url 到訊息中
function sendMessageToBackground(type, url, tabId) {
  return browser.runtime.sendMessage({ type: type, url: url, tabId: tabId }) // 添加 tabId
    .catch((error) => {
      console.error('向背景腳本發送訊息失敗:', error);
    });
}
function sendMessageToBackground(type, url) {
  // 使用 browser.runtime.sendMessage 向背景腳本發送訊息
  // 訊息是一個物件，包含類型 (type) 和相關數據 (url)
  return browser.runtime.sendMessage({ type: type, url: url })
    .catch((error) => {
      console.error('向背景腳本發送訊息失敗:', error);
    });
}

// --- 檢查當前網址是否被封鎖 ---

function checkUrlBlockedStatus(url) {
  // 向背景腳本發送檢查指令
  sendMessageToBackground('checkBlocked', url)
    .then((response) => {
      // 背景腳本會回傳一個物件，例如 { isBlocked: true }
      const isBlocked = response.isBlocked;
      updatePopupButton(isBlocked, url); // 根據狀態更新按鈕
    });
}
function checkUrlBlockedStatus(url, tabId) { // 接收 tabId (雖然這個函數裡沒用到，但在下面呼叫時會傳遞)
  sendMessageToBackground('checkBlocked', url, tabId) // 傳遞 tabId
    .then((response) => {
      const isBlocked = response.isBlocked;
      updatePopupButton(isBlocked, url, tabId); // 傳遞 tabId
    });
}


// --- 更新按鈕狀態和文字 ---
// 接收 tabId (雖然這個函數裡沒用到，但在下面呼叫時會傳遞)
function updatePopupButton(isBlocked, url, tabId) {
  blockButton.disabled = false;

  if (isBlocked) {
    blockButton.textContent = browser.i18n.getMessage('unblockButtonText');
    blockButton.classList.add('unblock');
    blockButton.classList.remove('block');
    statusMessageElement.textContent = browser.i18n.getMessage('siteBlockedStatus');

  } else {
    blockButton.textContent = browser.i18n.getMessage('blockButtonText');
    blockButton.classList.add('block');
    blockButton.classList.remove('unblock');
    statusMessageElement.textContent = browser.i18n.getMessage('siteNotBlockedStatus');
  }

  if (!blockButton.dataset.listenerAdded) {
    blockButton.addEventListener('click', () => {
      if (blockButton.classList.contains('block')) {
        // 發送新增指令，包含 url 和 tabId
        sendMessageToBackground('addBlocked', url, tabId)
          .then(() => {
            // 指令發送後，可以立即更新介面為「解除封鎖」狀態
            updatePopupButton(true, url, tabId);
          });
      } else {
        // 發送移除指令，包含 url 和 tabId
        sendMessageToBackground('removeBlocked', url, tabId)
          .then(() => {
            updatePopupButton(false, url, tabId);
          });
      }
    });
    blockButton.dataset.listenerAdded = 'true';
  }
}

// --- 初始化彈出頁面 ---
document.addEventListener('DOMContentLoaded', async () => {
  loadLocalizedText(); // 先載入文字

  // **修改：呼叫新的函數，獲取數據物件**
  const tabData = await getCurrentTabData(); // { url: ..., tabId: ... }

  // 檢查是否成功獲取到網址和分頁 ID
  if (tabData && tabData.url && tabData.tabId !== null) { // 確保 url 不為 null 且 tabId 有效
    // 顯示獲取的網址
    currentUrlElement.textContent = tabData.url;
    // 使用獲取的網址和分頁 ID 去檢查封鎖狀態並更新按鈕
    checkUrlBlockedStatus(tabData.url, tabData.tabId); // 傳遞 url 和 tabId
  } else {
    // 如果無法獲取到網址或分頁 ID，顯示錯誤並禁用按鈕
    currentUrlElement.textContent = browser.i18n.getMessage('gettingUrlError');
    blockButton.disabled = true;
  }
});