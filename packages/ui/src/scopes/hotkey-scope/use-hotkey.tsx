"use client";

import { memo, useCallback, useContext, useEffect, useId, useMemo, useRef } from "react";
import type { HTMLAttributes } from "react";

import { HotkeyScopeContext } from "./scope";
import { normalizeHotkeySequence, describeHotkey, parseHotkeySequence, formatHotkey } from "./normalize";
import type { HotkeyEntry, HotkeyEntryHandler, UseHotkeyOption, UseHotkeyResult } from "./types";


/**
 * Registers shortcuts against the nearest `<HotkeyScope>`.
 */
export function useHotkey<T extends HTMLElement = HTMLElement>(
  hotkey: UseHotkeyOption,
  action: (e: HotkeyEntryHandler) => void,
): UseHotkeyResult<T> {
  const cid = useId();

  const keyshortcuts = useMemo(() => {
    if (typeof hotkey === "object" && "oneOf" in hotkey) {
      return hotkey.oneOf;
    }
    return [hotkey];
  }, [hotkey]);

  const scope = useContext(HotkeyScopeContext);

  const { kbd } = scope;
  const scopeRef = useRef(scope);
  scopeRef.current = scope;

  const shortcuts = useMemo(() => keyshortcuts.map(k => ({
    id: normalizeHotkeySequence(k),
    hk: parseHotkeySequence(k).map(describeHotkey),
  })), [keyshortcuts]);

  const actionRef = useRef(action);
  actionRef.current = action;

  const ref = useRef<T>(null);

  useEffect(() => {
    const registered: HotkeyEntry<T>[] = [];

    for (const { id, hk } of shortcuts) {
      const registration: HotkeyEntry<T> = {
        id,
        ref,
        hotkey: hk,
        action: e => actionRef.current(e),
      };
      if (scopeRef.current.register(cid, registration)) {
        registered.push(registration);
      }
    }

    return () => {
      for (const { id } of registered) {
        scopeRef.current.unregister(id);
      }
    };
  }, [cid, shortcuts, ref]);

  const invoke = useCallback(() => {
    actionRef.current({
      focus() {
        return new Promise(() => {
          setTimeout(() => {
            const el = ref.current;
            if (el) {
              (el as any).focus();
            }
          }, 0);
        });
      },
    });
  }, [ref]);

  return useMemo(() => {
    const formatted = shortcuts.map(s => formatHotkey(s.hk, kbd));
    const KBD = memo<HTMLAttributes<HTMLElement>>(function KBD ({ ...props }) {
      return (
        <kbd {...props}>{formatted}</kbd>
      );
    });
    return {
      labels: formatted,
      attrs: {
        ref,
        "aria-keyshortcuts": formatted.join(" "),
      },
      invoke,
      KBD,
    };
  }, [shortcuts, kbd, ref]);
}
