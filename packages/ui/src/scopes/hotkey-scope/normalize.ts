import { match } from "../../utils/match";
import { firstExisted } from "../../utils/filter";
import { detectOS } from "../../utils/os";
import type { EventKeyConfig, EventKeyInfo, HotkeyName, IHotkey, KBDStyle, KeySequence, KeySequenceArray, KeySequenceString } from "./types";


export const normalizeHotkeySequence = function normalizeHotkeySequence(hotkey: KeySequence): KeySequenceString {
  if (typeof hotkey === "string") {
    return hotkey;
  }
  return hotkey.join("+") as KeySequenceString;
}

export const parseHotkeySequence = function parseHotkeySequence(hotkey: KeySequence): KeySequenceArray {
  if (Array.isArray(hotkey)) {
    return hotkey;
  }
  return hotkey.split("+") as KeySequenceArray;
};

export const encodeHotkey = function encodeHotkey(hotkey: KeySequence): EventKeyConfig | null {
  const seq = parseHotkeySequence(hotkey);
  let config: EventKeyConfig = {
    codes: [],
    keys: [],
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    shiftKey: false,
  };

  for (const key of seq) {
    switch (key) {
      case "Ctrl": {
        config.ctrlKey = true;
      }
      case "Alt": {
        config.altKey = true;
      }
      case "Meta": {
        config.metaKey = true;
      }
      case "Shift": {
        config.shiftKey = true;
      }
      default: {
        config.codes = [key];
        config.keys = [config.shiftKey ? key : key.toLowerCase()];
      }
    }
  }

  return config.codes.length === 0 ? null : config;
};

const MODIFIER_KEY_LABEL_MS: { [key in HotkeyName.Modifier1 | HotkeyName.Modifier2]: string } = {
  "Ctrl": "Ctrl",
  "Alt": "Alt",
  "Meta": "Win",
  "Shift": "Shift",
} as const;

const MODIFIER_KEY_LABEL_MAC_OS: { [key in HotkeyName.Modifier1 | HotkeyName.Modifier2]: string } = {
  "Ctrl": "Control",
  "Alt": "Option",
  "Meta": "Command",
  "Shift": "Shift",
} as const;

const MODIFIER_KEY_SYMBOL: { [key in HotkeyName.Modifier1 | HotkeyName.Modifier2]: string } = {
  "Ctrl": "^",
  "Alt": "\u2387",
  "Meta": "\u2318",
  "Shift": "\u21E7",
} as const;

const MODIFIER_KEY_SYMBOL_MAC_OS: { [key in HotkeyName.Modifier1 | HotkeyName.Modifier2]: string } = {
  "Ctrl": "\u2303",
  "Alt": "\u2325",
  "Meta": "\u2318",
  "Shift": "\u21E7",
} as const;

const CURSOR_KEY_SYMBOLS: { [key in HotkeyName.Navigation]: string } = {
  "ArrowDown": "\u2193",
  "ArrowUp": "\u2191",
  "ArrowLeft": "\u2190",
  "ArrowRight": "\u2192",
} as const;

const FUNCTION_KEYS = new Array(12).fill(0).map((_, i) => `F${i+1}`) as HotkeyName.GeneralPurposeFunction[];
const CCA = 'A'.codePointAt(0)!;
const ALPHABET_KEYS = new Array(26).fill(0).map((_, i) => String.fromCodePoint(CCA + i)) as HotkeyName.Alphabet[];
const CC0 = '0'.codePointAt(0)!;
const DIGIT_KEYS = new Array(10).fill(0).map((_, i) => String.fromCodePoint(CC0 + i)) as HotkeyName.Digits[];
const DIGIT_KEY_TOPS = [")", "!", "@", "#", "$", "%", "^", "&", "*", "("];
const PUNCTUATION_KEYS = ["`", "-", "=", "[", "]", "\\", ";", "'", ",", ".", "/"] as HotkeyName.Punctuations[];
const PUNCTUATION_NAMES = ["Backquote", "Minus", "Equal", "Bracket", "Bracket", "Backslash", "Semicolon", "Quote", "Comma", "Period", "Slash"];
const PUNCTUATION_TOPS = ["~", "_", "+", "{", "}", "|", ":", "\"", "<", ">", "?"];

function msOldStyled(str: string): string {
  return str.replaceAll(/\B[A-Z]/g, c => ` ${c}`).toLocaleUpperCase();
}

export const describeHotkey = function describeHotkey(key: HotkeyName.Any): IHotkey {
  return match(key)
    .oneOf<HotkeyName.Modifier1 | HotkeyName.Modifier2, IHotkey>(["Ctrl", "Alt", "Meta", "Shift"], k => {
      const labelMs = MODIFIER_KEY_LABEL_MS[k];
      const labelMacOS = MODIFIER_KEY_LABEL_MAC_OS[k];
      return {
        id: k,
        codes: [k, `${k}Left`, `${k}Right`],
        keys: [k],
        name: k,
        symbol: MODIFIER_KEY_SYMBOL[k],
        notationMsOld: `${labelMs.toUpperCase()}-`,
        notationMs: `${labelMs}+`,
        notationMacOS: `${labelMacOS}-`,
        notationMacOSSimple: MODIFIER_KEY_SYMBOL_MAC_OS[k],
      };
    })
    .eq(" ", k => ({
      id: k,
      codes: ["Space"],
      keys: [k],
      name: "Space",
      symbol: "\u2423",
      notationMsOld: "SPACE",
      notationMs: "Space",
      notationMacOS: "Space",
      notationMacOSSimple: "\u2423",
    }))
    .eq("Enter", k => ({
      id: k,
      codes: [k],
      keys: [k],
      name: "Enter",
      symbol: "\u21B5",
      notationMsOld: "ENTER",
      notationMs: "Enter",
      notationMacOS: "Return",
      notationMacOSSimple: "\u2324",
    }))
    .eq("Tab", k => ({
      id: k,
      codes: [k],
      keys: [k],
      name: "Tab",
      symbol: "\u21B9",
      notationMsOld: "TAB",
      notationMs: "Tab",
      notationMacOS: "Tab",
      notationMacOSSimple: "\u21B9",
    }))
    .oneOf(["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"], k => ({
      id: k,
      codes: [k],
      keys: [k],
      name: k,
      symbol: CURSOR_KEY_SYMBOLS[k],
      notationMsOld: msOldStyled(k),
      notationMs: k,
      notationMacOS: k,
      notationMacOSSimple: CURSOR_KEY_SYMBOLS[k],
    }))
    .eq("Backspace", k => ({
      id: k,
      codes: [k],
      keys: [k],
      name: k,
      symbol: "\u232B",
      notationMsOld: msOldStyled(k),
      notationMs: k,
      notationMacOS: "Delete",
      notationMacOSSimple: "\u232B",
    }))
    .oneOf(FUNCTION_KEYS, k => ({
      id: k,
      codes: [k],
      keys: [k],
      name: k,
      symbol: k,
      notationMsOld: k,
      notationMs: k,
      notationMacOS: k,
      notationMacOSSimple: k,
    }))
    .oneOf(ALPHABET_KEYS, k => ({
      id: k,
      codes: [`Key${k}`],
      keys: [k.toLowerCase(), k],
      name: k,
      symbol: k,
      notationMsOld: k,
      notationMs: k,
      notationMacOS: k,
      notationMacOSSimple: k,
    }))
    .oneOf(DIGIT_KEYS, k => ({
      id: k,
      codes: [`Digit${k}`],
      keys: [k, DIGIT_KEY_TOPS[parseInt(k)]!],
      name: k,
      symbol: k,
      notationMsOld: k,
      notationMs: k,
      notationMacOS: k,
      notationMacOSSimple: k,
    }))
    .oneOf(PUNCTUATION_KEYS, (k, i) => ({
      id: k,
      codes: [PUNCTUATION_NAMES[i]!],
      keys: [k, PUNCTUATION_TOPS[i]!],
      name: k,
      symbol: k,
      notationMsOld: k,
      notationMs: k,
      notationMacOS: k,
      notationMacOSSimple: k,
    }))
    .otherwise(k => ({
      id: k,
      codes: [k],
      keys: [k],
      name: k,
      symbol: k,
      notationMsOld: k,
      notationMs: k,
      notationMacOS: k,
      notationMacOSSimple: k,
    }))
    .take();
}

function keyBaseOf(key: string): string {
  const iP = PUNCTUATION_TOPS.indexOf(key);
  if (iP !== -1) {
    return PUNCTUATION_KEYS[iP]!;
  }
  const iS = DIGIT_KEY_TOPS.indexOf(key);
  if (iS !== -1) {
    return `${iS}`;
  }
  return key.length === 1 ? key.toUpperCase() : key;
}

export const decodeHotkey = function decodeHotkey<T extends Element = Element>(data: EventKeyInfo<T>): IHotkey[] {
  const key = keyBaseOf(data.key);
  if (["Ctrl", "Alt", "Meta", "Shift"].includes(key)) {
    return [];
  }
  const seq = [
    firstExisted([data.ctrlKey ? "Ctrl" : data.altKey ? "Alt" : data.metaKey && "Meta"]),
    data.shiftKey && "Shift",
    key,
  ].filter(Boolean) as KeySequenceArray;
  return seq.map(describeHotkey);
};

const kbdMapping = {
  "ms classic": "notationMsOld",
  "ms": "notationMs",
  "mac": "notationMacOS",
  "simple": "notationMacOS",
} as const;

export const formatHotkey = function formatHotkey(hotkey: IHotkey[], style: KBDStyle): string {
  const kbd = style === "auto" && detectOS() === "macos" ? "mac" : style as Exclude<KBDStyle, "auto">;
  return hotkey.map(k => k[kbdMapping[kbd]]).join("");
};
