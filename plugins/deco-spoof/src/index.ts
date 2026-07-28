import { patcher, storage } from "@vendetta";
import { metro } from "@vendetta";
import { FluxDispatcher } from "@vendetta/metro/common";
import Settings from "./Settings";

storage.targetMessageId ??= "";
storage.targetChannelId ??= "";
storage.spoofedName ??= "";
storage.spoofedContent ??= "";
storage.spoofedAvatar ??= "";
storage.spoofedDecoration ??= ""; // Direct APNG / PNG image URL for decoration

let patches: any[] = [];

function safeSpoof(msg: any) {
    if (!msg || !storage.targetMessageId || msg.id !== storage.targetMessageId) return;

    try {
        if (storage.spoofedContent) {
            Object.defineProperty(msg, "content", {
                get: () => storage.spoofedContent,
                set: () => {},
                configurable: true,
                enumerable: true
            });
        }

        if (msg.author) {
            if (storage.spoofedName) {
                Object.defineProperty(msg.author, "username", {
                    get: () => storage.spoofedName,
                    set: () => {},
                    configurable: true,
                    enumerable: true
                });
                Object.defineProperty(msg.author, "globalName", {
                    get: () => storage.spoofedName,
                    set: () => {},
                    configurable: true,
                    enumerable: true
                });
            }

            if (storage.spoofedAvatar && typeof storage.spoofedAvatar === "string" && storage.spoofedAvatar.trim() !== "") {
                Object.defineProperty(msg.author, "avatar", {
                    get: () => storage.spoofedAvatar,
                    set: () => {},
                    configurable: true,
                    enumerable: true
                });
            }

            // Spoof avatar decoration locally without approval
            if (storage.spoofedDecoration && typeof storage.spoofedDecoration === "string" && storage.spoofedDecoration.trim() !== "") {
                Object.defineProperty(msg.author, "avatarDecorationData", {
                    get: () => ({
                        asset: storage.spoofedDecoration,
                        skuId: "000000000000000000"
                    }),
                    set: () => {},
                    configurable: true,
                    enumerable: true
                });
            }
        }
    } catch (e) {
        // Prevent property errors
    }
}

export default {
    onLoad: () => {
        const RowManager = metro.findByProps("prototype", "generate");
        if (RowManager?.prototype) {
            patches.push(patcher.after("generate", RowManager.prototype, (args, ret) => {
                if (ret?.message) {
                    safeSpoof(ret.message);
                }
            }));
        }

        if (FluxDispatcher) {
            patches.push(patcher.before("dispatch", FluxDispatcher, (args) => {
                const [payload] = args;
                if (!payload) return;

                if ((payload.type === "LOAD_MESSAGES_SUCCESS" || payload.type === "LOCAL_MESSAGE_CREATE") && Array.isArray(payload.messages)) {
                    payload.messages.forEach(safeSpoof);
                } else if (payload.type === "MESSAGE_CREATE" && payload.message) {
                    safeSpoof(payload.message);
                }
            }));
        }
    },
    onUnload: () => patches.forEach(p => typeof p === "function" && p()),
    settings: Settings
};
