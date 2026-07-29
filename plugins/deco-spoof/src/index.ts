import { storage } from "@vendetta";
import { findByProps } from "@vendetta/metro";
import { before } from "@vendetta/patcher";
import Settings from "./Settings";

const unpatches: (() => void)[] = [];

export const onLoad = () => {
    // Scan all loaded modules for anything decoration-related
    const candidates: string[] = [];

    // @ts-ignore - metro internal cache, only for debugging
    const cache = window.modules ?? {};
    for (const id in cache) {
        try {
            const mod = cache[id]?.exports;
            if (!mod) continue;
            for (const key of Object.keys(mod)) {
                if (/decoration/i.test(key)) {
                    candidates.push(`module ${id} -> ${key}`);
                }
            }
        } catch {}
    }

    console.log("[DecoDebug] candidate decoration-related exports:", candidates);

    // Try a few likely names and patch whichever exist, logging every call
    const guesses = [
        "getAvatarDecorationURL",
        "getAvatarDecorationSource",
        "getDecorationURL",
        "useAvatarDecoration",
        "AvatarDecoration",
    ];

    for (const name of guesses) {
        const mod = findByProps(name);
        if (mod && typeof mod[name] === "function") {
            unpatches.push(
                before(name, mod, (args) => {
                    console.log(`[DecoDebug] ${name} called with:`, JSON.stringify(args));
                })
            );
            console.log(`[DecoDebug] patched ${name}`);
        }
    }
};

export const onUnload = () => {
    unpatches.forEach((u) => u());
};

export const settings = Settings;
