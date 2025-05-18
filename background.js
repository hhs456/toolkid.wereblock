// background.js

// 在背景腳本記憶體中儲存封鎖清單和設定
let currentBlockedSites = [];
let currentSettings = {};

// 從 storage 載入封鎖網站清單
function loadBlockedSites() {
  browser.storage.local.get('blockedSites')
    .then((result) => {
      currentBlockedSites = result.blockedSites || [];
      console.log('背景腳本已載入封鎖清單:', currentBlockedSites);
    })
    .catch((error) => {
      console.error('背景腳本載入封鎖清單失敗:', error);
    });
}

// 從 storage 載入設定
async function loadSettings() {
    browser.storage.local.get('settings')
        .then((result) => {
            // 預設值：如果沒有儲存過設定，設定為 'redirect'
            currentSettings = result.settings || { postUnblockBehavior: 'redirect' };
            console.log('背景腳本已載入設定:', currentSettings);
        })
        .catch(error => console.error('背景腳本載入設定失敗:', error));
}

// 在 background script 啟動時呼叫載入設定和封鎖清單
console.log("背景腳本啟動中...");
loadSettings();
loadBlockedSites();

// 監聽 storage 儲存空間的變化，更新背景腳本中的變數
browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    if (changes.settings) {
      currentSettings = changes.settings.newValue || { postUnblockBehavior: 'redirect' };
      console.log('背景腳本偵測到設定更新:', currentSettings);
    }
    if (changes.blockedSites) {
       const newBlockedSites = changes.blockedSites.newValue || [];
       currentBlockedSites = newBlockedSites; // 更新背景腳本中的清單變數
       console.log('背景腳本偵測到封鎖清單更新:', currentBlockedSites);
   }
  }
});

// 監聽所有網頁發出的請求
browser.webRequest.onBeforeRequest.addListener(
  function(details) {
    for (let i = 0; i < currentBlockedSites.length; i++) {
      const site = currentBlockedSites[i];
      if (site && details.url.includes(site)) {
        console.log("背景腳本已攔截請求並重新導向:", details.url);

        // 重新導向到 blocked.html，並傳遞原網址作為參數
        const redirectUrl = browser.runtime.getURL("block_page/blocked.html?url=" + encodeURIComponent(details.url));

        return {redirectUrl: redirectUrl}; // 執行重新導向
      }
    }
    // 如果網址不在封鎖清單中，則不做任何處理
    return {};
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

// 處理來自其他腳本 (如 popup) 的訊息
browser.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.type === 'checkBlocked') {
      // 檢查網址是否被封鎖
      const urlToCheck = request.url;
      const isBlocked = currentBlockedSites.some(site => urlToCheck && urlToCheck.includes(site));
      sendResponse({ isBlocked: isBlocked });
      return false; // 同步回傳
    } else if (request.type === 'addBlocked') {
      // 新增封鎖網址
      const urlToAdd = request.url;
      const targetTabId = request.tabId;

      if (urlToAdd && targetTabId !== null && !currentBlockedSites.some(site => urlToAdd.includes(site))) {
        browser.storage.local.get('blockedSites')
          .then((result) => {
            const sites = result.blockedSites || [];
            sites.push(urlToAdd);
            browser.storage.local.set({ blockedSites: sites });
            console.log('背景腳本已新增封鎖網址:', urlToAdd);

            // 新增成功後，如果目標分頁是該網址，則重新導向到封鎖頁面
            const redirectUrl = browser.runtime.getURL("block_page/blocked.html?url=" + encodeURIComponent(urlToAdd));
            browser.tabs.update(targetTabId, { url: redirectUrl })
              .catch(error => console.error(`重新導向分頁 ${targetTabId} 失敗:`, error));

            sendResponse({ success: true, redirect: true });
          })
          .catch(error => {
             console.error('新增封鎖網址並重導向失敗:', error);
             sendResponse({ success: false, error: 'Storage update failed' });
          });
        return true; // 異步回傳響應
      }
       sendResponse({ success: false, error: 'Invalid URL or already blocked or invalid tabId' });
       return false; // 同步回傳錯誤
    } else if (request.type === 'removeBlocked') {
      // 移除封鎖網址
      const urlToRemove = request.url;
      const targetTabId = request.tabId;

       if (urlToRemove && targetTabId !== null) {
         browser.storage.local.get('blockedSites')
           .then((result) => {
             let sites = result.blockedSites || [];
             const indexToRemove = sites.indexOf(urlToRemove); // 使用 indexOf 精確匹配

             if (indexToRemove !== -1) {
               sites.splice(indexToRemove, 1);
               browser.storage.local.set({ blockedSites: sites });
               console.log('背景腳本已移除封鎖網址:', urlToRemove);

               // 移除成功後，根據設定跳轉回原網址
               // 注意：這裡使用了 currentSettings，確保已載入最新的設定
               if (currentSettings.postUnblockBehavior === 'redirect') {
                 browser.tabs.update(targetTabId, { url: urlToRemove })
                   .catch(error => console.error(`跳轉回原網址 ${targetTabId} 失敗:`, error));
               }


               sendResponse({ success: true, redirected: currentSettings.postUnblockBehavior === 'redirect' }); // 回傳成功並指示是否已跳轉
             } else {
                console.warn('移除封鎖網址失敗: 網址不在清單中', urlToRemove);
                sendResponse({ success: false, error: 'URL not found in list' });
             }
           })
           .catch(error => {
              console.error('移除封鎖網址失敗:', error);
              sendResponse({ success: false, error: 'Storage update failed' });
           });
         return true; // 異步回傳響應
       }
       sendResponse({ success: false, error: 'Invalid URL or invalid tabId' });
       return false; // 同步回傳錯誤
    }

    // 如果不是我們的訊息類型，回傳 false
    return false;
  }
);