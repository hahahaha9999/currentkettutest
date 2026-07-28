import { patcher, storage } from "@vendetta";
import { metro } from "@vendetta";
import { FluxDispatcher } from "@vendetta/metro/common";
import Settings from "./Settings";

storage.targetMessageId ??= "";
storage.targetChannelId ??= "";
storage.spoofedName ??= "";
storage.spoofedContent ??= "";
storage.spoofedAvatar ??= "";

let patches = [];

function applySpoof(msg: any) {
    if (!msg || msg.id !== storage.targetMessageId) return msg;

    // Clone the message object so React Native detects a reference change and forces a re-render
    const spoofedMsg = Object.create(Object.getPrototypeOf(msg), Object.getOwnPropertyDescriptors(msg));

    if (storage.spoofedContent) {
        spoofedMsg.content = storage.spoofedContent;
    }

    if (spoofedMsg.author) {
        spoofedMsg.author = { ...spoofedMsg.author };
        if (storage.spoofedName) {
            spoofedMsg.author.username = storage.spoofedName;
            spoofedMsg.author.globalName = storage.spoofedName;
        }
        if (storage.spoofedAvatar) {
            spoofedMsg.author.avatar = storage.spoofedAvatar;
        }
    }

    return spoofedMsg;
}

export default {
    onLoad: () => {
        // Intercept row rendering for live updates
        const RowManager = metro.findByProps("prototype", "generate");
        if (RowManager?.prototype) {
            patches.push(patcher.after("generate", RowManager.prototype, (args, ret) => {
                if (ret?.message && ret.message.id === storage.targetMessageId) {
                    ret.message = applySpoof(ret.message);
                }
            }));
        }

        // Intercept dispatches
        if (FluxDispatcher) {
            patches.push(patcher.before("dispatch", FluxDispatcher, (args) => {
                const [payload] = args;
                if (!payload) return;

                if ((payload.type === "LOAD_MESSAGES_SUCCESS" || payload.type === "LOCAL_MESSAGE_CREATE") && Array.isArray(payload.messages)) {
                    payload.messages = payload.messages.map((msg: any) => {
                        return msg?.id === storage.targetMessageId ? applySpoof(msg) : msg;
                    });
                }
            }));
        }
    },
    onUnload: () => patches.forEach(p => typeof p === "function" && p()),
    settings: Settings
};
