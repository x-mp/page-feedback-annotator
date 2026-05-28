const DEFAULT_SETTINGS = {
  active: false,
  panelOpen: false,
  accentColor: "#14b8a6",
  autoCopy: false,
  copyAndClear: false,
  includeText: true,
  settingsPanelOpen: false,
  minimized: false,
  panelPosition: null,
  miniPosition: null
};

const state = {
  tabId: null,
  url: "",
  count: 0,
  settings: { ...DEFAULT_SETTINGS }
};

const activeToggle = document.querySelector("#activeToggle");
const toggleLabel = document.querySelector("#toggleLabel");
const modeText = document.querySelector("#modeText");
const pageState = document.querySelector("#pageState");
const count = document.querySelector("#count");
const status = document.querySelector("#status");

function sendToTab(message) {
  if (!state.tabId) return Promise.resolve(null);
  return chrome.tabs.sendMessage(state.tabId, message).catch(async () => {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: state.tabId },
        files: ["content.js"]
      });
      return await chrome.tabs.sendMessage(state.tabId, message);
    } catch {
      return null;
    }
  });
}

function setStatus(message) {
  status.textContent = message;
}

function formatCount(value) {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return `${value} комментарий`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${value} комментария`;
  return `${value} комментариев`;
}

function isEnabled() {
  return Boolean(state.settings.active || state.settings.panelOpen);
}

function syncUi() {
  const enabled = isEnabled();
  activeToggle.setAttribute("aria-pressed", String(enabled));
  toggleLabel.textContent = enabled ? "Выключить" : "Включить";
  modeText.textContent = enabled
    ? "Панель открыта на странице. Настройки, копирование и очистка доступны там."
    : "Плавающая кнопка появится на странице.";
  count.textContent = formatCount(state.count);

  try {
    pageState.textContent = state.url ? new URL(state.url).hostname : "Страница недоступна";
  } catch {
    pageState.textContent = "Страница недоступна";
  }
}

async function readTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  state.tabId = tab?.id || null;
  state.url = tab?.url || "";
}

async function refresh() {
  await readTab();
  const response = await sendToTab({ type: "pfa:getState" });
  if (response?.settings) state.settings = { ...DEFAULT_SETTINGS, ...response.settings };
  if (typeof response?.count === "number") state.count = response.count;
  syncUi();
}

async function updateSettings(patch) {
  state.settings = { ...state.settings, ...patch };
  syncUi();
  const response = await sendToTab({ type: "pfa:updateSettings", settings: state.settings });
  if (!response?.settings) {
    setStatus("Не удалось открыть на этой странице");
    return;
  }
  state.settings = { ...DEFAULT_SETTINGS, ...response.settings };
  state.count = response.count ?? state.count;
  setStatus("");
  syncUi();
}

activeToggle.addEventListener("click", () => {
  const nextEnabled = !isEnabled();
  updateSettings({
    active: nextEnabled,
    panelOpen: nextEnabled,
    minimized: false
  });
});

refresh();
