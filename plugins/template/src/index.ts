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
    if (!msg) return;
    
    if (storage.spoofedContent) {
        msg.content = storage.spoofedContent;
    }
    if (msg.author) {
        if (storage.spoofedName) msg.author.username = storage.spoofedName;
        if (storage.spoofedAvatar) msg.author.avatar = storage.spoofedAvatar;
    }
}

export default {
    onLoad: () => {
        // Intercept initial message loads
        if (FluxDispatcher) {
            patches.push(patcher.before("dispatch", FluxDispatcher, (args) => {
                const [payload] = args;
                if (!payload) return;

                if ((payload.type === "LOAD_MESSAGES_SUCCESS" || payload.type === "LOCAL_MESSAGE_CREATE") && Array.isArray(payload.messages)) {
                    payload.messages.forEach((msg: any) => {
                        if (storage.targetMessageId && msg?.id === storage.targetMessageId) {
                            applySpoof(msg);
                        }
                    });
                }
            }));
        }

        // Intercept row rendering
        const RowManager = metro.findByProps("prototype", "generate");
        if (RowManager?.prototype) {
            patches.push(patcher.after("generate", RowManager.prototype, (args, ret) => {
                const msg = ret?.message;
                if (storage.targetMessageId && msg?.id === storage.targetMessageId) {
                    applySpoof(msg);
                }
            }));
        }
    },
    onUnload: () => patches.forEach(p => typeof p === "function" && p()),
    settings: Settings
};
