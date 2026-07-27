import { patcher, storage } from "@vendetta";
import { metro } from "@vendetta";
import { FluxDispatcher } from "@vendetta/metro/common";
import Settings from "./Settings";

storage.targetMessageId ??= "";
storage.spoofedText ??= "";
storage.spoofedDisplayName ??= "";
storage.spoofedAvatar ??= "https://cdn.discordapp.com/avatars/758731615265357824/d58a1012427825b24816247844152b6a.png";

let patches = [];

function applyMobileSpoof(messageObj: any) {
    if (!messageObj) return;
    Object.defineProperty(messageObj, "content", { get: () => storage.spoofedText, set: () => {}, configurable: true });
    if (messageObj.author) {
        Object.defineProperty(messageObj.author, "username", { get: () => storage.spoofedDisplayName, configurable: true });
        Object.defineProperty(messageObj.author, "globalName", { get: () => storage.spoofedDisplayName, configurable: true });
        Object.defineProperty(messageObj.author, "avatar", { get: () => "spoofed", configurable: true });
    }
}

export default {
    onLoad: () => {
        if (FluxDispatcher) {
            patches.push(patcher.before("dispatch", FluxDispatcher, (args) => {
                const [payload] = args;
                if ((payload.type === "LOAD_MESSAGES_SUCCESS" || payload.type === "LOCAL_MESSAGE_CREATE") && payload.messages) {
                    const target = payload.messages.find((m: any) => m?.id === storage.targetMessageId);
                    if (target) applyMobileSpoof(target);
                }
            }));
        }
        
        const RowManager = metro.findByProps("prototype", "generate");
        if (RowManager?.prototype) {
            patches.push(patcher.after("generate", RowManager.prototype, (args, ret) => {
                if (ret?.message?.id === storage.targetMessageId) applyMobileSpoof(ret.message);
            }));
        }
    },
    onUnload: () => patches.forEach(p => typeof p === "function" && p()),
    settings: Settings
};
