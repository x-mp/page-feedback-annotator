(function () {
  const APP_ID = "pfa-root";
  const STORAGE_PREFIX = "pfa:";
  const GLOBAL_SETTINGS_KEY = `${STORAGE_PREFIX}global-settings`;
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

  if (window.__pageFeedbackAnnotatorLoaded) return;
  window.__pageFeedbackAnnotatorLoaded = true;

  let settings = { ...DEFAULT_SETTINGS };
  let notes = [];
  let rootHost;
  let shadow;
  let hoverBox;
  let selectionBox;
  let noteLayer;
  let dragBox;
  let panel;
  let composer;
  let activeElement = null;
  let draftElements = [];
  let dragStart = null;
  let floatingDrag = null;
  let isPointerDown = false;
  let ignoreNextClick = false;
  let suppressPanelClick = false;

  const cssEscape = window.CSS?.escape || ((value) => String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&"));

  function pageKey() {
    return `${STORAGE_PREFIX}${location.origin}${location.pathname}`;
  }

  function storageGet(keys) {
    return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
  }

  function storageSet(value) {
    return new Promise((resolve) => chrome.storage.local.set(value, resolve));
  }

  function isOwnNode(node) {
    return Boolean(rootHost && (node === rootHost || rootHost.contains(node)));
  }

  function selectableFromEvent(event) {
    const pathElement = event.composedPath?.().find((node) => node instanceof Element && !isOwnNode(node));
    if (pathElement) return pathElement;

    const pointElement = document
      .elementsFromPoint(event.clientX, event.clientY)
      .find((node) => node instanceof Element && !isOwnNode(node));

    return pointElement || event.target;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function viewport() {
    return `${window.innerWidth}x${window.innerHeight}`;
  }

  function viewportClampPosition(x, y, width, height) {
    return {
      x: clamp(Math.round(x), 8, Math.max(8, window.innerWidth - width - 8)),
      y: clamp(Math.round(y), 8, Math.max(8, window.innerHeight - height - 8))
    };
  }

  function normalizeMode() {
    if (settings.minimized) {
      settings.minimized = false;
      settings.active = false;
      settings.panelOpen = false;
      return;
    }

    if (settings.panelOpen) {
      settings.active = true;
      return;
    }

    settings.active = false;
  }

  function shortText(element) {
    const value = (element.innerText || element.getAttribute("aria-label") || element.getAttribute("alt") || "")
      .replace(/\s+/g, " ")
      .trim();
    return value.slice(0, 140);
  }

  function elementLabel(element) {
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : "";
    const classes = Array.from(element.classList || []).slice(0, 3).map((name) => `.${name}`).join("");
    return `${tag}${id}${classes}`;
  }

  function uniqueSelector(element) {
    if (!(element instanceof Element)) return "";
    if (element.id) return `#${cssEscape(element.id)}`;

    const parts = [];
    let current = element;
    while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.body) {
      const tag = current.tagName.toLowerCase();
      const dataAttr = ["data-testid", "data-test", "data-cy"].find((attr) => current.hasAttribute(attr));
      const dataId = dataAttr ? current.getAttribute(dataAttr) : "";
      let part = tag;
      if (dataId) {
        part += `[${dataAttr}="${dataId.replaceAll('"', '\\"')}"]`;
        parts.unshift(part);
        break;
      }
      const classes = Array.from(current.classList || [])
        .filter((name) => !/^(active|selected|hover|focus|open|closed)$/i.test(name))
        .slice(0, 2);
      if (classes.length) part += classes.map((name) => `.${cssEscape(name)}`).join("");

      const parent = current.parentElement;
      if (parent) {
        const sameTag = Array.from(parent.children).filter((child) => child.tagName === current.tagName);
        if (sameTag.length > 1) part += `:nth-of-type(${sameTag.indexOf(current) + 1})`;
      }

      parts.unshift(part);
      current = current.parentElement;
    }

    return parts.join(" > ");
  }

  function domPath(element) {
    const parts = [];
    let current = element;
    while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.documentElement) {
      parts.unshift(elementLabel(current));
      current = current.parentElement;
    }
    return parts.join(" > ");
  }

  function captureElement(element) {
    const rect = element.getBoundingClientRect();
    return {
      selector: uniqueSelector(element),
      path: domPath(element),
      label: elementLabel(element),
      text: settings.includeText ? shortText(element) : "",
      rect: {
        x: Math.round(rect.left + window.scrollX),
        y: Math.round(rect.top + window.scrollY),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      }
    };
  }

  function noteTitle(note) {
    if (note.elements.length === 1) return note.elements[0].label;
    return `${note.elements[0].label} + ${note.elements.length - 1}`;
  }

  function totalElementsCount() {
    return notes.reduce((sum, note) => sum + note.elements.length, 0);
  }

  function reportText() {
    const lines = [
      `## Page Feedback: ${location.pathname || "/"}`,
      `**URL:** ${location.href}`,
      `**Viewport:** ${viewport()}`,
      `**Captured:** ${new Date().toISOString()}`,
      ""
    ];

    notes.forEach((note, index) => {
      lines.push(`### ${index + 1}. ${noteTitle(note)}`);
      lines.push(`**Location:** ${note.elements.map((item) => item.selector).join(", ")}`);
      lines.push(`**Path:** ${note.elements.map((item) => item.path).join(" | ")}`);
      lines.push(`**Elements:** ${note.elements.length}`);
      lines.push(`**Element Rects:** ${note.elements.map((item) => `${item.rect.x},${item.rect.y},${item.rect.width}x${item.rect.height}`).join(" | ")}`);
      lines.push(`**Source:** ${note.url}`);
      lines.push(`**Viewport At Comment:** ${note.viewport}`);
      if (settings.includeText) {
        const texts = note.elements.map((item) => item.text).filter(Boolean);
        if (texts.length) lines.push(`**Text:** ${texts.join(" | ")}`);
      }
      lines.push(`**Feedback:** ${note.comment}`);
      lines.push("");
    });

    return lines.join("\n").trim();
  }

  async function persist() {
    normalizeMode();
    await storageSet({
      [pageKey()]: { notes, settings },
      [GLOBAL_SETTINGS_KEY]: settings
    });
  }

  async function closePanel() {
    settings.active = false;
    settings.panelOpen = false;
    settings.minimized = false;
    hideComposer();
    await persist();
    renderPanel();
  }

  async function copyReportToClipboard() {
    const report = reportText();
    try {
      await navigator.clipboard.writeText(report);
    } catch {
      // Popup can still copy the returned string when page clipboard access is denied.
    }
    return report;
  }

  function ensureRoot() {
    if (rootHost) return;

    rootHost = document.createElement("div");
    rootHost.id = APP_ID;
    rootHost.style.all = "initial";
    document.documentElement.appendChild(rootHost);
    shadow = rootHost.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = styles();
    shadow.appendChild(style);

    hoverBox = document.createElement("div");
    hoverBox.className = "pfa-hover";
    selectionBox = document.createElement("div");
    selectionBox.className = "pfa-selection";
    noteLayer = document.createElement("div");
    noteLayer.className = "pfa-note-layer";
    dragBox = document.createElement("div");
    dragBox.className = "pfa-drag";
    panel = document.createElement("aside");
    composer = document.createElement("form");
    composer.className = "pfa-composer";

    shadow.append(noteLayer, hoverBox, selectionBox, dragBox, panel, composer);
    panel.addEventListener("click", handlePanelAction);
    panel.addEventListener("input", handlePanelAction);
    panel.addEventListener("pointerdown", handleFloatingPointerDown);
    composer.addEventListener("submit", handleComposer);
    composer.addEventListener("click", handleComposerClick);
    composer.addEventListener("keydown", handleComposerKeydown);
    composer.addEventListener("pointerdown", handleFloatingPointerDown);
  }

  function renderPanel() {
    ensureRoot();
    rootHost.style.display = settings.panelOpen || settings.active || settings.minimized || composer.classList.contains("visible") ? "block" : "none";
    const visible = settings.panelOpen || settings.minimized;
    panel.className = `pfa-panel${visible ? " visible" : ""}${settings.minimized ? " minimized" : ""}`;
    if (settings.minimized) {
      panel.innerHTML = `
        <button class="pfa-mini" type="button" data-action="expand" title="Развернуть" aria-label="Развернуть">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path><path d="M8 9h8"></path><path d="M8 13h5"></path></svg>
          ${totalElementsCount() ? `<span>${totalElementsCount()}</span>` : ""}
        </button>
      `;
      panel.style.setProperty("--pfa-accent", settings.accentColor);
      placePanel();
      renderNoteMarkers();
      return;
    }

    const actionsHtml = `
      <div class="pfa-actions">
        <button type="button" data-action="copy" title="Копировать" aria-label="Копировать" ${notes.length ? "" : "disabled"}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="10" height="10" rx="2"></rect><path d="M5 15V7a2 2 0 0 1 2-2h8"></path></svg>
        </button>
        <button type="button" data-action="copy-clear" title="Копировать и очистить" aria-label="Копировать и очистить" ${notes.length ? "" : "disabled"}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="9" height="9" rx="2"></rect><path d="M5 14V6a1 1 0 0 1 1-1h8"></path><path d="M19 13v7"></path><path d="M16 16h6"></path></svg>
        </button>
        <button type="button" data-action="clear" title="Очистить" aria-label="Очистить" ${notes.length ? "" : "disabled"}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M6 7l1 13h10l1-13"></path><path d="M9 7V4h6v3"></path></svg>
        </button>
        <button type="button" data-action="toggle-settings" title="Настройки" aria-label="Настройки">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"></path><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 0 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 0 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 0 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1a2 2 0 0 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z"></path></svg>
        </button>
        <button type="button" data-action="minimize" title="Закрыть" aria-label="Закрыть">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12"></path><path d="M18 6 6 18"></path></svg>
        </button>
      </div>
    `;

    panel.innerHTML = `
      ${actionsHtml}
      <div class="pfa-settings${settings.settingsPanelOpen ? " visible" : ""}">
        <label>
          <span>Цвет</span>
          <input type="color" data-action="accent-color" value="${escapeHtml(settings.accentColor)}">
        </label>
        <label>
          <input type="checkbox" data-action="auto-copy" ${settings.autoCopy ? "checked" : ""}>
          <span>Автокопирование после комментария</span>
        </label>
        <label>
          <input type="checkbox" data-action="copy-clear-setting" ${settings.copyAndClear ? "checked" : ""}>
          <span>Очищать после копирования</span>
        </label>
        <label>
          <input type="checkbox" data-action="include-text" ${settings.includeText ? "checked" : ""}>
          <span>Добавлять текст элемента</span>
        </label>
      </div>
    `;
    panel.style.setProperty("--pfa-accent", settings.accentColor);
    placePanel();
    renderNoteMarkers();
  }

  function renderNoteMarkers() {
    if (!noteLayer) return;
    noteLayer.textContent = "";
    notes.forEach((note, noteIndex) => {
      note.elements.forEach((item) => {
        if (!item.rect?.width || !item.rect?.height) return;
        const marker = document.createElement("div");
        marker.className = "pfa-note-marker";
        marker.style.cssText = [
          `--pfa-accent:${settings.accentColor}`,
          `left:${Math.round(item.rect.x - window.scrollX)}px`,
          `top:${Math.round(item.rect.y - window.scrollY)}px`,
          `width:${Math.round(item.rect.width)}px`,
          `height:${Math.round(item.rect.height)}px`
        ].join(";");
        marker.innerHTML = `<span>${noteIndex + 1}</span>`;
        noteLayer.appendChild(marker);
      });
    });
  }

  function placePanel() {
    const key = settings.minimized ? "miniPosition" : "panelPosition";
    const fallbackWidth = settings.minimized ? 44 : 206;
    const fallbackHeight = settings.minimized ? 44 : 46;
    const savedPosition = settings.minimized
      ? settings.miniPosition
      : settings.miniPosition
        ? { x: settings.miniPosition.x + 44 - fallbackWidth, y: settings.miniPosition.y }
        : settings[key];

    if (!savedPosition) {
      panel.style.left = "";
      panel.style.top = "";
      panel.style.right = "12px";
      panel.style.bottom = "12px";
      return;
    }

    const rect = panel.getBoundingClientRect();
    const position = viewportClampPosition(savedPosition.x, savedPosition.y, rect.width || fallbackWidth, rect.height || fallbackHeight);
    panel.style.left = `${position.x}px`;
    panel.style.top = `${position.y}px`;
    panel.style.right = "auto";
    panel.style.bottom = "auto";
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);
  }

  function updateHover(element) {
    if (!settings.active || !element || isOwnNode(element)) {
      hoverBox.classList.remove("visible");
      return;
    }

    const rect = element.getBoundingClientRect();
    hoverBox.classList.add("visible");
    hoverBox.style.cssText = boxCss(rect);
  }

  function updateSelection(elements) {
    if (!elements.length) {
      selectionBox.classList.remove("visible");
      return;
    }

    const rects = elements.map((element) => element.getBoundingClientRect());
    const left = Math.min(...rects.map((rect) => rect.left));
    const top = Math.min(...rects.map((rect) => rect.top));
    const right = Math.max(...rects.map((rect) => rect.right));
    const bottom = Math.max(...rects.map((rect) => rect.bottom));
    selectionBox.classList.add("visible");
    selectionBox.style.cssText = boxCss({ left, top, width: right - left, height: bottom - top });
  }

  function boxCss(rect) {
    return [
      `--pfa-accent:${settings.accentColor}`,
      `left:${Math.round(rect.left)}px`,
      `top:${Math.round(rect.top)}px`,
      `width:${Math.round(rect.width)}px`,
      `height:${Math.round(rect.height)}px`
    ].join(";");
  }

  function showComposer(elements, point) {
    draftElements = Array.from(new Set(elements)).filter(Boolean);
    if (!draftElements.length) return;

    const x = clamp(point.clientX + 12, 8, window.innerWidth - 300);
    const y = clamp(point.clientY + 12, 8, window.innerHeight - 190);
    updateSelection(draftElements);

    composer.className = "pfa-composer visible";
    composer.style.left = `${x}px`;
    composer.style.top = `${y}px`;
    composer.style.setProperty("--pfa-accent", settings.accentColor);
    composer.innerHTML = `
      <div class="pfa-composer-head" data-drag-handle="composer" title="Перетащить форму">
        <strong>${draftElements.length === 1 ? "Комментарий" : `Группа: ${draftElements.length}`}</strong>
        <button type="button" data-action="cancel" title="Закрыть">x</button>
      </div>
      <label>
        <textarea name="comment" rows="4" placeholder="Что нужно изменить?"></textarea>
      </label>
      <div class="pfa-composer-actions">
        <button type="button" data-action="cancel">Отмена</button>
        <button type="submit">Сохранить</button>
      </div>
    `;
    composer.querySelector("textarea").focus();
  }

  function hideComposer() {
    composer.className = "pfa-composer";
    composer.innerHTML = "";
    draftElements = [];
    updateSelection([]);
  }

  async function addNote(comment) {
    const clean = comment.trim();
    if (!clean || !draftElements.length) return;

    notes.push({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: new Date().toISOString(),
      viewport: viewport(),
      url: location.href,
      comment: clean,
      elements: draftElements.map(captureElement)
    });

    hideComposer();
    await persist();
    renderPanel();

    if (settings.autoCopy) {
      await copyReportToClipboard();
      if (settings.copyAndClear) {
        notes = [];
        await persist();
        renderPanel();
      }
    }
  }

  function elementsInsideDragRect(rect) {
    const candidates = Array.from(document.body.querySelectorAll("body *")).filter((element) => {
      if (isOwnNode(element)) return false;
      const style = getComputedStyle(element);
      if (style.visibility === "hidden" || style.display === "none" || style.pointerEvents === "none") return false;
      const item = element.getBoundingClientRect();
      if (item.width < 4 || item.height < 4) return false;
      return item.left < rect.right && item.right > rect.left && item.top < rect.bottom && item.bottom > rect.top;
    });

    return candidates
      .filter((element) => !candidates.some((other) => other !== element && other.contains(element)))
      .slice(0, 20);
  }

  function onPointerMove(event) {
    if (floatingDrag) return;
    if (!settings.active) return;
    if (isPointerDown && dragStart) {
      const left = Math.min(dragStart.x, event.clientX);
      const top = Math.min(dragStart.y, event.clientY);
      const width = Math.abs(event.clientX - dragStart.x);
      const height = Math.abs(event.clientY - dragStart.y);
      if (width > 8 || height > 8) {
        ignoreNextClick = true;
        dragBox.classList.add("visible");
        dragBox.style.cssText = boxCss({ left, top, width, height });
      }
      return;
    }
    updateHover(selectableFromEvent(event));
  }

  function onPointerDown(event) {
    if (floatingDrag) return;
    if (!settings.active || event.button !== 0 || isOwnNode(event.target)) return;
    isPointerDown = true;
    dragStart = { x: event.clientX, y: event.clientY };
  }

  function onPointerUp(event) {
    if (floatingDrag) return;
    if (!settings.active || !isPointerDown || !dragStart) return;
    isPointerDown = false;
    const width = Math.abs(event.clientX - dragStart.x);
    const height = Math.abs(event.clientY - dragStart.y);
    dragBox.classList.remove("visible");

    if (width > 12 || height > 12) {
      event.preventDefault();
      event.stopPropagation();
      const rect = {
        left: Math.min(dragStart.x, event.clientX),
        top: Math.min(dragStart.y, event.clientY),
        right: Math.max(dragStart.x, event.clientX),
        bottom: Math.max(dragStart.y, event.clientY)
      };
      showComposer(elementsInsideDragRect(rect), event);
    }
    dragStart = null;
  }

  function onClick(event) {
    if (floatingDrag) return;
    if (!settings.active || isOwnNode(event.target)) return;
    event.preventDefault();
    event.stopPropagation();

    if (ignoreNextClick) {
      ignoreNextClick = false;
      return;
    }

    const eventTarget = selectableFromEvent(event);
    const target = eventTarget.closest("a, button, input, textarea, select, [role='button']") || eventTarget;
    activeElement = target;
    const elements = event.shiftKey ? [...draftElements, target] : [target];
    showComposer(elements, event);
  }

  async function handlePanelAction(event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (event.type === "input" && action !== "accent-color") return;
    if (suppressPanelClick) {
      suppressPanelClick = false;
      event.preventDefault();
      return;
    }

    if (action === "expand") {
      settings.active = true;
      settings.panelOpen = true;
      settings.minimized = false;
      await persist();
      renderPanel();
      return;
    }

    if (action === "toggle-settings") {
      settings.settingsPanelOpen = !settings.settingsPanelOpen;
      await persist();
      renderPanel();
      return;
    }

    if (action === "accent-color") {
      settings.accentColor = button.value;
      await persist();
      panel.style.setProperty("--pfa-accent", settings.accentColor);
      return;
    }

    if (action === "auto-copy") {
      settings.autoCopy = button.checked;
      await persist();
      renderPanel();
      return;
    }

    if (action === "copy-clear-setting") {
      settings.copyAndClear = button.checked;
      await persist();
      renderPanel();
      return;
    }

    if (action === "include-text") {
      settings.includeText = button.checked;
      await persist();
      renderPanel();
      return;
    }

    if (action === "copy") {
      await copyReportToClipboard();
      if (settings.copyAndClear) notes = [];
      await persist();
      renderPanel();
      return;
    }

    if (action === "copy-clear") {
      await copyReportToClipboard();
      notes = [];
      await persist();
      renderPanel();
      return;
    }

    if (action === "clear") {
      notes = [];
      await persist();
      renderPanel();
      return;
    }

    if (action === "minimize") {
      await closePanel();
      return;
    }

  }

  async function handleComposer(event) {
    event.preventDefault();
    await addNote(new FormData(composer).get("comment") || "");
  }

  function handleComposerClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    if (button.dataset.action === "cancel") hideComposer();
  }

  async function handleComposerKeydown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      await closePanel();
      return;
    }
    if (event.key !== "Enter" || event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.target?.tagName !== "TEXTAREA") return;
    event.preventDefault();
    await addNote(event.target.value || "");
  }

  function handleFloatingPointerDown(event) {
    const mini = event.target.closest(".pfa-mini");
    const handle = event.target.closest("[data-drag-handle]") || (mini ? panel : null);
    if (!handle || event.button !== 0) return;
    if (!mini && event.target.closest("button, input, textarea, select, summary, label")) return;

    const target = handle.dataset?.dragHandle === "composer" ? composer : panel;
    const rect = target.getBoundingClientRect();
    floatingDrag = {
      target,
      type: handle.dataset?.dragHandle === "composer" ? "composer" : "panel",
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      startX: event.clientX,
      startY: event.clientY,
      width: rect.width,
      height: rect.height,
      moved: false
    };
    target.classList.add("dragging");
    event.preventDefault();
    event.stopPropagation();
  }

  async function handleFloatingPointerMove(event) {
    if (!floatingDrag) return;
    const position = viewportClampPosition(
      event.clientX - floatingDrag.offsetX,
      event.clientY - floatingDrag.offsetY,
      floatingDrag.width,
      floatingDrag.height
    );
    floatingDrag.target.style.left = `${position.x}px`;
    floatingDrag.target.style.top = `${position.y}px`;
    floatingDrag.target.style.right = "auto";
    floatingDrag.target.style.bottom = "auto";
    if (floatingDrag.type === "panel") {
      if (settings.minimized) {
        settings.miniPosition = position;
      } else {
        settings.panelPosition = position;
      }
    }
    if (Math.abs(event.clientX - floatingDrag.startX) > 3 || Math.abs(event.clientY - floatingDrag.startY) > 3) {
      floatingDrag.moved = true;
    }
    event.preventDefault();
  }

  async function handleFloatingPointerUp() {
    if (!floatingDrag) return;
    floatingDrag.target.classList.remove("dragging");
    const shouldPersist = floatingDrag.type === "panel";
    suppressPanelClick = floatingDrag.type === "panel" && floatingDrag.moved;
    floatingDrag = null;
    if (shouldPersist) await persist();
  }

  function styles() {
    return `
      :host, * { box-sizing: border-box; }
      .pfa-note-layer {
        position: fixed;
        inset: 0;
        z-index: 2147483644;
        pointer-events: none;
      }
      .pfa-note-marker {
        position: fixed;
        border: 2px solid var(--pfa-accent);
        border-radius: 8px;
        background: color-mix(in srgb, var(--pfa-accent) 8%, transparent);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--pfa-accent) 14%, transparent);
        pointer-events: none;
      }
      .pfa-note-marker span {
        position: absolute;
        top: -10px;
        left: -10px;
        min-width: 20px;
        height: 20px;
        padding: 0 6px;
        border-radius: 999px;
        background: var(--pfa-accent);
        color: #f8fafc;
        font: 700 11px/20px ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        box-shadow: 0 4px 10px rgba(15, 23, 42, .22);
        text-align: center;
      }
      .pfa-hover, .pfa-selection, .pfa-drag {
        position: fixed;
        z-index: 2147483645;
        pointer-events: none;
        display: none;
        border-radius: 8px;
      }
      .pfa-hover.visible, .pfa-selection.visible, .pfa-drag.visible { display: block; }
      .pfa-hover {
        border: 2px solid var(--pfa-accent);
        background: color-mix(in srgb, var(--pfa-accent) 10%, transparent);
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--pfa-accent) 16%, transparent);
      }
      .pfa-selection {
        border: 2px solid var(--pfa-accent);
        background: color-mix(in srgb, var(--pfa-accent) 14%, transparent);
      }
      .pfa-drag {
        border: 1px dashed var(--pfa-accent);
        background: color-mix(in srgb, var(--pfa-accent) 12%, transparent);
      }
      .pfa-panel, .pfa-composer {
        position: fixed;
        z-index: 2147483646;
        font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #111827;
      }
      .pfa-panel {
        right: 12px;
        bottom: 12px;
        width: 206px;
        max-height: min(320px, calc(100vh - 24px));
        display: none;
        overflow: hidden;
        border: 1px solid #d8dee8;
        border-radius: 8px;
        background: #f9fafb;
        box-shadow: 0 18px 55px rgba(15, 23, 42, 0.22);
      }
      .pfa-panel.visible { display: block; }
      .pfa-panel.minimized {
        width: 44px;
        height: 44px;
        overflow: visible;
        border: 0;
        border-radius: 999px;
        background: transparent;
        box-shadow: none;
      }
      .pfa-mini {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 44px;
        border: 1px solid color-mix(in srgb, var(--pfa-accent) 55%, #0f172a);
        border-radius: 999px;
        background: var(--pfa-accent);
        color: #f8fafc;
        box-shadow: 0 12px 30px rgba(15, 23, 42, .24);
        cursor: pointer;
      }
      .pfa-mini svg {
        width: 21px;
        height: 21px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .pfa-mini span {
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        border-radius: 999px;
        background: #111827;
        color: #f8fafc;
        font-size: 11px;
        font-weight: 700;
        line-height: 18px;
      }
      .pfa-composer.dragging .pfa-composer-head { cursor: grabbing; }
      .pfa-actions { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; padding: 7px; }
      .pfa-actions button, .pfa-composer button {
        min-height: 30px;
        border: 1px solid #d8dee8;
        border-radius: 8px;
        background: #f8fafc;
        color: #111827;
        font: inherit;
        font-size: 11px;
        cursor: pointer;
      }
      .pfa-actions button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      }
      .pfa-actions svg {
        width: 16px;
        height: 16px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .pfa-actions button:first-child, .pfa-composer button[type="submit"] {
        border-color: var(--pfa-accent);
        background: var(--pfa-accent);
        color: #f8fafc;
        font-weight: 700;
      }
      .pfa-actions button[data-action="minimize"] {
        color: #991b1b;
        background: #fee2e2;
        border-color: #fecaca;
      }
      .pfa-actions button:disabled { opacity: .5; cursor: not-allowed; }
      .pfa-settings {
        display: none;
        margin: 0 7px 7px;
        padding: 8px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: #ffffff;
      }
      .pfa-settings.visible { display: block; }
      .pfa-settings label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-top: 9px;
        color: #526070;
        font-size: 12px;
        line-height: 1.3;
      }
      .pfa-settings label:has(input[type="checkbox"]) {
        justify-content: flex-start;
      }
      .pfa-settings input[type="checkbox"] {
        width: 16px;
        height: 16px;
        flex: 0 0 auto;
        accent-color: var(--pfa-accent);
      }
      .pfa-settings input[type="color"] {
        width: 38px;
        height: 28px;
        padding: 2px;
        border: 1px solid #d8dee8;
        border-radius: 6px;
        background: #f8fafc;
      }
      .pfa-composer {
        display: none;
        width: 286px;
        padding: 8px;
        border: 1px solid #d8dee8;
        border-radius: 8px;
        background: #f9fafb;
        box-shadow: 0 18px 55px rgba(15, 23, 42, 0.24);
      }
      .pfa-composer.visible { display: block; }
      .pfa-composer-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin: -2px -2px 7px;
        padding: 4px 4px 6px;
        border-bottom: 1px solid #e2e8f0;
        cursor: grab;
        user-select: none;
      }
      .pfa-composer-head strong { font-size: 12px; line-height: 1.2; }
      .pfa-composer-head button {
        width: 24px;
        min-height: 24px;
        border: 0;
        background: #fee2e2;
        color: #991b1b;
      }
      .pfa-composer textarea {
        width: 100%;
        min-height: 74px;
        resize: vertical;
        border: 1px solid #d8dee8;
        border-radius: 8px;
        padding: 8px;
        color: #111827;
        background: #ffffff;
        font: inherit;
        font-size: 12px;
        line-height: 1.4;
      }
      .pfa-composer textarea:focus { outline: 3px solid color-mix(in srgb, var(--pfa-accent) 24%, transparent); outline-offset: 1px; }
      .pfa-composer-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 7px; }
    `;
  }

  async function load() {
    const data = await storageGet([pageKey(), GLOBAL_SETTINGS_KEY]);
    const saved = data[pageKey()] || {};
    const globalSettings = data[GLOBAL_SETTINGS_KEY] || {};
    settings = { ...DEFAULT_SETTINGS, ...(saved.settings || {}), ...globalSettings };
    notes = Array.isArray(saved.notes) ? saved.notes : [];
    const hadSavedMiniButton = settings.minimized;
    normalizeMode();
    if (hadSavedMiniButton) await persist();
    ensureRoot();
    renderPanel();
  }

  document.addEventListener("pointermove", onPointerMove, true);
  document.addEventListener("pointerdown", onPointerDown, true);
  document.addEventListener("pointerup", onPointerUp, true);
  document.addEventListener("click", onClick, true);
  window.addEventListener("pointermove", handleFloatingPointerMove, true);
  window.addEventListener("pointerup", handleFloatingPointerUp, true);
  window.addEventListener("scroll", renderNoteMarkers, true);
  window.addEventListener("resize", renderNoteMarkers, true);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closePanel();
    }
  }, true);

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    (async () => {
      if (message.type === "pfa:getState") {
        sendResponse({ settings, count: notes.length });
      }

      if (message.type === "pfa:updateSettings") {
        settings = { ...DEFAULT_SETTINGS, ...message.settings };
        normalizeMode();
        await persist();
        renderPanel();
        sendResponse({ settings, count: notes.length });
      }

      if (message.type === "pfa:copyReport") {
        const report = reportText();
        if (message.clearAfter) notes = [];
        await persist();
        renderPanel();
        sendResponse({ ok: true, report, count: notes.length });
      }

      if (message.type === "pfa:clear") {
        notes = [];
        await persist();
        renderPanel();
        sendResponse({ ok: true, count: notes.length });
      }
    })();
    return true;
  });

  load();
})();
