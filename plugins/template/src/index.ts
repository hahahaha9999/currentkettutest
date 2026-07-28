import { patcher, storage } from "@vendetta";
import { metro } from "@vendetta";
import { FluxDispatcher } from "@vendetta/metro/common";
import Settings from "./Settings";

storage.targetMessageId ??= "";
storage.spoofedName ??= "";
storage.spoofedContent ??= "";
storage.spoofedAvatar ??= "";

let patches = [];

function applySpoof(msg: any) {
    if (!msg || msg.id !== storage.targetMessageId) return;

    // Define direct property getters so Discord reads the spoofed values on EVERY render pass
    if (storage.spoofedContent) {
        Object.defineProperty(msg, "content", {
            get: () => storage.spoofedContent,
            configurable: true,
            enumerable: true
        });
    }

    if (msg.author) {
        if (storage.spoofedName) {
            Object.defineProperty(msg.author, "username", {
                get: () => storage.spoofedName,
                configurable: true,
                enumerable: true
            });
            Object.defineProperty(msg.author, "globalName", {
                get: () => storage.spoofedName,
                configurable: true,
                enumerable: true
            });
        }
    }
}

export default {
    onLoad: () => {
        // Patch Flux dispatches
        if (FluxDispatcher) {
            patches.push(patcher.before("dispatch", FluxDispatcher, (args) => {
                const [payload] = args;
                if (!payload) return;

                if ((payload.type === "LOAD_MESSAGES_SUCCESS" || payload.type === "LOCAL_MESSAGE_CREATE") && Array.isArray(payload.messages)) {
                    payload.messages.forEach(applySpoof);
                } else if (payload.type === "MESSAGE_CREATE" && payload.message) {
                    applySpoof(payload.message);
                }
            }));
        }

        // Patch RowManager rendering so it forces the getter onto the row payload live
        const RowManager = metro.findByProps("prototype", "generate");
        if (RowManager?.prototype) {
            patches.push(patcher.after("generate", RowManager.prototype, (args, ret) => {
                const msg = ret?.message;
                if (msg) applySpoof(msg);
            }));
        }
    },
    onUnload: () => patches.forEach(p => typeof p === "function" && p()),
    settings: Settings
};
