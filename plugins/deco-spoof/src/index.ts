import { storage } from "@vendetta";
import { findByProps } from "@vendetta/metro";
import { before } from "@vendetta/patcher";
import Settings from "./Settings";

const unpatches: (() => void)[] = [];

function log(line: string) {
    const existing = storage.debugLog ?? "";
    storage.debugLog = (existing + "\n" + line).slice(-4000); // keep last ~4000 chars
}

export const onLoad = () => {
    storage.debugLog = ""; // reset each load

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
    log("CANDIDATES:\n" + candidates.join("\n"));

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
                    log(`CALLED ${name}: ${JSON.stringify(args)}`);
                })
            );
            log(`patched ${name}`);
        }
    }
};

export const onUnload = () => {
    unpatches.forEach((u) => u());
};

export const settings = Settings;
