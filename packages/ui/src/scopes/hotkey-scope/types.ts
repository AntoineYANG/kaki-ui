import type { AriaAttributes, DOMAttributes, FC, HTMLAttributes, KeyboardEvent, ReactNode, RefObject } from "react";


/** @see https://www.w3.org/TR/uievents-key/#named-key-attribute-values */
export namespace HotkeyName {

  /**
   * For Mac keyboard, Alt -> Option and Meta -> Command.
   */
  export type Modifier1 = "Ctrl" | "Alt" | "Meta";

  export type Modifier2 = "Shift";

  export type Whitespace = "Enter" | "Tab" | " ";
  // We don't support "End", "Home", "PageDown" and "PageUp" because you'd better not override their behaviors.
  export type Navigation = `Arrow${"Down"|"Up"|"Left"|"Right"}`/* | "End" | "Home" | `Page${"Down"|"Up"}`*/;
  // We don't support "Delete" and "Insert" because there's no corresponding keys on Mac keyboards.
  export type Editing = "Backspace"/* | "Delete" | "Insert"*/;
  export type UI = "Escape";
  export type GeneralPurposeFunction = `F${1|2|3|4|5|6|7|8|9|10|11|12}`;
  export type Alphabet = (
    | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M"
    | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z"
  );
  export type Digits = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
  export type Punctuations = "`" | "-" | "=" | "[" | "]" | "\\" | ";" | "'" | "," | "." | "/";

  export type Named = (
    | Whitespace
    | Navigation
    | Editing
    // We don't support "Escape" here because the React event loop could not capture it
    // | UI
    | GeneralPurposeFunction
    | Alphabet
    | Digits
    | Punctuations
  );

  export type Any = Modifier1 | Modifier2 | Named;

}

export interface IHotkey {
  id: string;
  codes: string[];
  keys: string[];
  name: string;
  symbol: string;
  /** Old Microsoft notation */
  notationMsOld: string;
  /** Current Microsoft notation */
  notationMs: string;
  /** Classic Mac OS and macOS notation, used in prose */
  notationMacOS: string;
  /** Classic Mac OS and macOS notation, used in menus and Sticky Keys */
  notationMacOSSimple: string;
}

export type EventKeyConfig<T extends Element = Element> = Pick<
  KeyboardEvent<T>,
  "ctrlKey" | "altKey" | "metaKey" | "shiftKey"
> & {
  codes: Array<KeyboardEvent<T>["code"]>;
  keys: Array<KeyboardEvent<T>["key"]>;
};

export type EventKeyInfo<T extends Element = Element> = Pick<
  KeyboardEvent<T>,
  "ctrlKey" | "altKey" | "metaKey" | "shiftKey" | "code" | "key"
>;

export type KeySequenceSingle = HotkeyName.Named;
export type KeySequenceArray = (
  | [                                            HotkeyName.Named]
  | [                      HotkeyName.Modifier2, HotkeyName.Named]
  | [HotkeyName.Modifier1,                       HotkeyName.Named]
  | [HotkeyName.Modifier1, HotkeyName.Modifier2, HotkeyName.Named]
);
export type KeySequenceString = (
  | KeySequenceSingle
  | `${HotkeyName.Modifier2}+${HotkeyName.Named}`
  | `${HotkeyName.Modifier1}+${HotkeyName.Named}`
  | `${HotkeyName.Modifier1}+${HotkeyName.Modifier2}+${HotkeyName.Named}`
);
export type KeySequence = KeySequenceArray | KeySequenceString;

export interface HotkeyScopeProps {
  /**
   * @default false
   */
  blockPropagation?: boolean;
  /**
   * @default "auto"
   */
  kbd?: KBDStyle;
  children?: ReactNode;
}

export interface HotkeyEntryHandler {
  preventDefault?: () => void;
  focus: () => Promise<void>;
}

export interface HotkeyEntry<T extends HTMLElement> {
  readonly id: string;
  readonly ref: RefObject<T | null>;
  readonly hotkey: readonly IHotkey[];
  readonly action: (e: HotkeyEntryHandler) => void;
}

export type KBDStyle = "ms classic" | "ms" | "mac" | "simple" | "auto";

export type UseHotkeyOption = KeySequence | {
  oneOf: KeySequence[];
};

export interface UseHotkeyResult<T extends HTMLElement> {
  labels: string[];
  attrs: DOMAttributes<T> & AriaAttributes;
  invoke: () => void;
  readonly KBD: FC<HTMLAttributes<HTMLElement>>;
}
