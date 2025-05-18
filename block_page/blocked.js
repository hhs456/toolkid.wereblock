// blocked.js

document.addEventListener('DOMContentLoaded', () => {
  // 獲取需要更新文字的元素
  const blockedPageTitle = document.getElementById('blockedPageTitle');
  const blockedPageMessage = document.getElementById('blockedPageMessage');
  const blockedPageUrlLabel = document.getElementById('blockedPageUrlLabel');
  const goBackButton = document.getElementById('goBackButton');
  const blockedUrlSpan = document.getElementById('blocked-url');


  // === 載入國際化文字並更新介面 ===
  blockedPageTitle.textContent = browser.i18n.getMessage('blockedPageTitle');
  blockedPageMessage.textContent = browser.i18n.getMessage('blockedPageMessage');
  blockedPageUrlLabel.textContent = browser.i18n.getMessage('blockedPageUrlLabel');
  goBackButton.textContent = browser.i18n.getMessage('goBackButton');
  // ================================


  // 從當前頁面的網址中讀取查詢參數 (query parameters)
  const urlParams = new URLSearchParams(window.location.search);
  const originalUrl = urlParams.get('url');

  if (originalUrl) {
    blockedUrlSpan.textContent = originalUrl;
  } else {
    blockedUrlSpan.textContent = "無法獲取網址"; // 這個提示文字也可以國際化
    // 例如： blockedUrlSpan.textContent = browser.i18n.getMessage('urlNotAvailable');
  }

  // 為返回按鈕添加事件監聽
  goBackButton.addEventListener('click', (event) => {
    event.preventDefault();
    window.history.back();
  });
});