const BLOCK_AI_KEY = "BlockAI";
const BLOCK_NSFW_KEY = "BlockNSFW";

const BASE_SETTINGS = {
    [BLOCK_AI_KEY]: "false",
    [BLOCK_NSFW_KEY]: "false",
    bg_color: "#1f1f1f",
    header_color: "#000000",
    footer_color: "#000000",
    title_color: "#ffffff",
    details_color: "#e0e0e0",
    info_color: "#cccccc",
    link_color: "#4dabf7",
    border_color: "#ffffff",
    h1_size: "32",
    h2_size: "24",
    p_size: "16",
    a_size: "14"
};

const COLOR_CONTROLS = [
    { key: "bg_color", cssVar: "--bg-color" },
    { key: "header_color", cssVar: "--header-bg-color" },
    { key: "footer_color", cssVar: "--footer-bg-color" },
    { key: "title_color", cssVar: "--title-color" },
    { key: "details_color", cssVar: "--details-color" },
    { key: "info_color", cssVar: "--info-color" },
    { key: "link_color", cssVar: "--link-color" },
    { key: "border_color", cssVar: "--border-color" }
];

const FONT_CONTROLS = [
    { key: "h1_size", cssVar: "--h1-size" },
    { key: "h2_size", cssVar: "--h2-size" },
    { key: "p_size", cssVar: "--p-size" },
    { key: "a_size", cssVar: "--a-size" }
];

Object.entries(BASE_SETTINGS).forEach(([key, value]) => ensureSetting(key, value));

syncCheckbox(BLOCK_AI_KEY, "ai_filter");
syncCheckbox(BLOCK_NSFW_KEY, "nsfw_filter");
initializeThemeControls();
applyTheme();

const settingsPanel = document.getElementById("settings");
if (settingsPanel) {
    settingsPanel.setAttribute("aria-hidden", "true");
}

function menu() {
    const menuEl = document.getElementById("settings");
    if (!menuEl) return;
    const isOpen = menuEl.classList.toggle("open");
    document.body.classList.toggle("settings-open", isOpen);
    menuEl.setAttribute("aria-hidden", isOpen ? "false" : "true");
}

function AI(){
    const checkbox = document.getElementById("ai_filter");
    const isChecked = checkbox ? checkbox.checked : false;
    localStorage.setItem(BLOCK_AI_KEY, isChecked ? "true" : "false");
}

function NSFW(){
    const checkbox = document.getElementById("nsfw_filter");
    const isChecked = checkbox ? checkbox.checked : false;
    localStorage.setItem(BLOCK_NSFW_KEY, isChecked ? "true" : "false");
}

function unadded(){
    alert("This feature is still being worked on.")
}

function ensureSetting(key, defaultValue) {
    if (localStorage.getItem(key) === null) {
        localStorage.setItem(key, defaultValue);
    }
}

function syncCheckbox(key, checkboxId) {
    const checkbox = document.getElementById(checkboxId);
    if (checkbox) {
        checkbox.checked = localStorage.getItem(key) === "true";
    }
}

function initializeThemeControls() {
    const allControls = [...COLOR_CONTROLS, ...FONT_CONTROLS];
    allControls.forEach(({ key }) => {
        const input = document.getElementById(key);
        if (!input) return;
        input.value = getSetting(key);
        input.addEventListener("input", handleThemeInput);
    });
}

function handleThemeInput(event) {
    const { id, value, type } = event.target;
    if (!id) return;

    let newValue = value;
    const isFontControl = FONT_CONTROLS.some(control => control.key === id);
    if (isFontControl) {
        newValue = clampFontValue(value, id);
        event.target.value = newValue;
    } else if (type === "color" && !isValidColor(value)) {
        newValue = getSetting(id);
        event.target.value = newValue;
    }

    localStorage.setItem(id, newValue);
    applyTheme();
}

function clampFontValue(value, key) {
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) {
        return BASE_SETTINGS[key];
    }
    const clamped = Math.min(Math.max(parsed, 8), 72);
    return String(clamped);
}

function isValidColor(value) {
    return /^#[0-9a-fA-F]{6}$/.test(value);
}

function getSetting(key) {
    return localStorage.getItem(key) ?? BASE_SETTINGS[key];
}

function applyTheme() {
    const root = document.documentElement;
    COLOR_CONTROLS.forEach(({ key, cssVar }) => {
        root.style.setProperty(cssVar, getSetting(key));
    });
    FONT_CONTROLS.forEach(({ key, cssVar }) => {
        root.style.setProperty(cssVar, `${getSetting(key)}px`);
    });
}
