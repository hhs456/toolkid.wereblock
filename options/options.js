// options.js

// 獲取 DOM 元素
const siteInput = document.getElementById('site-input');
const addSiteButton = document.getElementById('addSiteButton');
const blockedSitesList = document.getElementById('blocked-sites-list');

async function saveBlockedSites(sites) {
  browser.storage.local.set({ blockedSites: sites })
    .then(() => {
      console.log('封鎖清單已儲存');
    })
    .catch((error) => {
      console.error('儲存封鎖清單失敗:', error);
      loadBlockedSites(); // 儲存失敗時重新載入清單
    });
}

async function loadBlockedSites() {
  browser.storage.local.get('blockedSites')
    .then((result) => {
      const sites = result.blockedSites || [];
      displayBlockedSites(sites); // 載入後顯示清單
    })
    .catch((error) => {
      console.error('載入封鎖清單失敗:', error);
      blockedSitesList.innerHTML = '';
      const errorItem = document.createElement('li');
      errorItem.textContent = browser.i18n.getMessage('loadFailedError') || "載入清單失敗。";
      blockedSitesList.appendChild(errorItem);
    });
}

// 移除網站函數 (通過值查找)
async function removeBlockedSiteByValue(siteValueToRemove) {
  const result = await browser.storage.local.get('blockedSites');
  let sites = result.blockedSites || [];

  const currentIndex = sites.indexOf(siteValueToRemove); // 使用 indexOf 精確匹配值

  if (currentIndex !== -1) {
    sites.splice(currentIndex, 1);
    await saveBlockedSites(sites); // 保存更新後的清單
    console.log('移除封鎖網址:', siteValueToRemove);
  } else {
    console.warn(`嘗試移除網址失敗: ${siteValueToRemove} 未在當前清單中找到。`);
    loadBlockedSites(); // 強制重新載入以同步介面
  }
}

// 新增網址到清單
async function addBlockedSite() {
  const site = siteInput.value.trim();

  if (site) {
    const result = await browser.storage.local.get('blockedSites');
    const sites = result.blockedSites || [];
    if (!sites.includes(site)) { // 避免重複新增
      sites.push(site);
      await saveBlockedSites(sites); // 儲存更新後的清單
      siteInput.value = ''; // 清空輸入框
      console.log(`已新增網址: ${site}`);
    } else {
      alert(browser.i18n.getMessage('siteAlreadyBlockedError') || '此網址已在清單中！');
    }
  }
}

// 載入國際化文字並更新介面
function loadLocalizedText() {
  document.title = browser.i18n.getMessage('optionsTitle');
  document.getElementById('blockSitesTitle').textContent = browser.i18n.getMessage('blockSitesTitle');
  document.getElementById('site-input').placeholder = browser.i18n.getMessage('inputPlaceholder');
  document.getElementById('addSiteButton').textContent = browser.i18n.getMessage('addButtonText');
}

// 輔助函數：渲染單個封鎖網站的列表項 (顯示模式)
function renderViewItem(site, index) {
  const li = document.createElement('li');
  li.classList.add('blocked-site-item');

  const siteTextSpan = document.createElement('span');
  siteTextSpan.textContent = site;
  siteTextSpan.classList.add('site-text');
  siteTextSpan.style.userSelect = 'text'; // 使網址文字可選取複製
  siteTextSpan.style.cursor = 'text';
  siteTextSpan.style.marginRight = '10px';

  li.appendChild(siteTextSpan);

  // 添加修改按鈕
  const editButton = document.createElement('button');
  editButton.textContent = browser.i18n.getMessage('editText');
  editButton.classList.add('edit-button');
  editButton.style.marginLeft = 'auto';

  editButton.addEventListener('click', () => {
    enterEditMode(li, site, index); // 進入編輯模式
  });

  li.appendChild(editButton);

  // 添加移除按鈕
  const removeButton = document.createElement('button');
  removeButton.textContent = browser.i18n.getMessage('removeButtonText');
  removeButton.classList.add('remove-button');
  removeButton.style.marginLeft = '5px';

  removeButton.addEventListener('click', () => {
    removeBlockedSiteByValue(site); // 使用 removeBlockedSiteByValue 移除
  });

  li.appendChild(removeButton);

  return li;
}

// 主函數：顯示封鎖清單
function displayBlockedSites(sites) {
  if (!blockedSitesList) return;

  blockedSitesList.innerHTML = ''; // 清空現有列表內容

  if (sites && sites.length > 0) {
    sites.forEach((site, index) => {
      const li = renderViewItem(site, index);
      blockedSitesList.appendChild(li);
    });
  } else {
    // 清單為空時的提示
    const emptyMessage = document.createElement('li');
    emptyMessage.textContent = browser.i18n.getMessage('noBlockedSitesMessage');
    emptyMessage.classList.add('empty-message');
    blockedSitesList.appendChild(emptyMessage);
  }
}

// 輔助函數：將列表項切換到編輯模式
function enterEditMode(li, originalSite, index) {
  li.innerHTML = '';
  li.classList.add('editing');

  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.value = originalSite; // 預填充原始網址
  editInput.classList.add('edit-input');
  editInput.style.marginRight = '5px';
  editInput.style.flexGrow = 1;

  li.appendChild(editInput);

  const saveButton = document.createElement('button');
  saveButton.textContent = browser.i18n.getMessage('saveButtonText');
  saveButton.classList.add('save-button');
  saveButton.style.marginLeft = '5px';

  saveButton.addEventListener('click', async () => {
    const newSite = editInput.value.trim();
    if (newSite && newSite !== originalSite) {
      const result = await browser.storage.local.get('blockedSites');
      const sites = result.blockedSites || [];
      const oldIndex = sites.indexOf(originalSite); // 查找原始值當前的索引

      if (oldIndex !== -1) {
        sites[oldIndex] = newSite; // 替換值
        await saveBlockedSites(sites); // 保存
        console.log(`網址 ${originalSite} 已更新為 ${newSite}`);
      } else {
        console.warn(`嘗試儲存網址失敗: 未在清單中找到原始網址 ${originalSite}`);
        alert(browser.i18n.getMessage('saveFailedError') || "儲存失敗：原始網址未在清單中找到。");
        loadBlockedSites(); // 強制重新載入以同步介面
      }
    } else {
      exitEditMode(li, originalSite, index); // 沒有修改或輸入為空，退出編輯模式
    }
  });

  li.appendChild(saveButton);

  const cancelButton = document.createElement('button');
  cancelButton.textContent = browser.i18n.getMessage('cancelButtonText');
  cancelButton.classList.add('cancel-button');
  cancelButton.style.marginLeft = '5px';

  cancelButton.addEventListener('click', () => {
    exitEditMode(li, originalSite, index); // 放棄修改，退出編輯模式
  });

  li.appendChild(cancelButton);

  editInput.focus(); // 自動獲取焦點
}

// 輔助函數：將列表項切換回顯示模式
function exitEditMode(li, originalSite, index) {
  li.innerHTML = '';
  li.classList.remove('editing');

  const siteTextSpan = document.createElement('span');
  siteTextSpan.textContent = originalSite;
  siteTextSpan.classList.add('site-text');
  siteTextSpan.style.userSelect = 'text';
  siteTextSpan.style.cursor = 'text';
  siteTextSpan.style.marginRight = '10px';

  li.appendChild(siteTextSpan);

  const editButton = document.createElement('button');
  editButton.textContent = browser.i18n.getMessage('editText');
  editButton.classList.add('edit-button');
  editButton.style.marginLeft = 'auto';
  editButton.addEventListener('click', () => {
    enterEditMode(li, originalSite, index);
  });
  li.appendChild(editButton);

  const removeButton = document.createElement('button');
  removeButton.textContent = browser.i18n.getMessage('removeButtonText');
  removeButton.classList.add('remove-button');
  removeButton.style.marginLeft = '5px';
  removeButton.addEventListener('click', () => {
    removeBlockedSiteByValue(originalSite); // 移除
  });
  li.appendChild(removeButton);
}

// 監聽 storage 儲存空間的變化
browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.blockedSites) {
    const newBlockedSites = changes.blockedSites.newValue || [];
    console.log('Options 頁面偵測到封鎖清單更新:', newBlockedSites);
    displayBlockedSites(newBlockedSites); // 偵測到變化後，重新顯示整個列表
  }
});

// 初始載入和事件綁定
document.addEventListener('DOMContentLoaded', async () => {
  loadLocalizedText(); // 載入國際化文字
  loadBlockedSites();  // 載入並顯示封鎖清單

  // 綁定新增按鈕事件
  if (addSiteButton) {
    addSiteButton.classList.add('add-button');
    addSiteButton.addEventListener('click', addBlockedSite);
  } else {
    console.error("錯誤：找不到 ID 為 'addSiteButton' 的按鈕元素！");
  }

  // 綁定輸入框回車事件
  if (siteInput) {
    siteInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault(); // 避免表單預設提交
        addBlockedSite();
      }
    });
  }
});

// 補充說明：
// - 需要確保 options.html 中存在 ID 為 'site-input', 'addSiteButton', 'blocked-sites-list' 的元素。
// - 需要在 options.css 中為相關 class 添加樣式，以控制列表項在顯示和編輯模式下的佈局和外觀。
// - 確保 _locales 資料夾和 messages.json 文件正確設定了國際化文字。