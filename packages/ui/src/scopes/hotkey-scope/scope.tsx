"use client";

import { createContext, memo, useCallback, useMemo, useState } from "react";
import type { FC, KeyboardEventHandler } from "react";

import { name as PKG_NAME } from "../../../package.json";
import type { HotkeyEntry, HotkeyScopeProps, KBDStyle } from "./types";
import { decodeHotkey } from "./normalize";


export interface HotkeyScopeContextValue {
  readonly kbd: KBDStyle;
  register<T extends HTMLElement>(cid: string, entry: HotkeyEntry<T>): boolean;
  unregister(hotkey: string): void;
}

export const HotkeyScopeContext = createContext<HotkeyScopeContextValue>({
  kbd: "auto",
  register() { return false },
  unregister() {},
});

const NAME = `${PKG_NAME}:HotkeyScope`;

export const HotkeyScope: FC = memo<HotkeyScopeProps>(function HotkeyScope ({
  blockPropagation = false,
  kbd = "auto",
  children,
}) {
  const [listeners, setListeners] = useState<Record<string, { cid: string; entry: HotkeyEntry<HTMLElement> }>>({});

  const register = useCallback(function register(cid: string, entry: HotkeyEntry<HTMLElement>) {
    let flag = false;
    setListeners(l => {
      const { id } = entry;
      if (id in l) {
        console.warn(`Trying to register a hotkey "${id}" which is already registered in this scope. Each hotkey must be unique within a scope.`);
        return l;
      }
      flag = true;
      return { ...l, [id]: { cid, entry } };
    });
    return flag;
  }, []);

  const unregister = useCallback(function unregister(hotkey: string) {
    setListeners(l => {
      const { [hotkey]: _, ...next } = l;
      return next;
    });
  }, []);

  const ctx = useMemo<HotkeyScopeContextValue>(() => ({
    kbd,
    register,
    unregister,
  }), [kbd, register, unregister]);

  const keyDownHandler = useCallback<KeyboardEventHandler<HTMLDivElement>>(function keyDownHandler(e) {
    if (blockPropagation) {
      e.stopPropagation();
    }
    const seq = decodeHotkey(e).map(e => e.id).join("+");
    if (seq.length > 0) {
      if (seq in listeners) {
        const { entry } = listeners[seq]!;
        entry.action({
          preventDefault() {
            e.preventDefault();
          },
          focus() {
            e.preventDefault();
            return new Promise(() => {
              setTimeout(() => {
                const el = entry.ref.current;
                if (el) {
                  (el as any).focus();
                }
              }, 0);
            });
          },
          // @ts-expect-error for debug
          __raw__: e,
        });
        e.stopPropagation();
        return;
      }
    }
  }, [listeners, blockPropagation]);

  return (
    <HotkeyScopeContext.Provider value={ctx}>
      <div
        data-label={NAME}
        style={{ display: "contents" }}
        onKeyDown={keyDownHandler}
      >
        {children}
      </div>
    </HotkeyScopeContext.Provider>
  );
});
