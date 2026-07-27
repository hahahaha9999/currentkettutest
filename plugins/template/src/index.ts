import { patcher, storage } from "@vendetta";
import { metro } from "@vendetta";
import { FluxDispatcher } from "@vendetta/metro/common";
import Settings from "./Settings";

storage.targetMessageId ??= "1520914436460904678";
storage.spoofedText ??= "";
storage.spoofedDisplayName ??= ".𝚔𝚊𝚣𝚏𝚕𝚊";
storage.spoofedAvatar ??= "https://cdn.discordapp.com/avatars/758731615265357824/d58a1012427825b24816247844152b6a.png";

let patches = [];

function applyMobileSpoof(messageObj: any) {
    if (!messageObj) return;

    // 1. Spoof message text content
    Object.defineProperty(messageObj, "content", {
        get: () => storage.spoofedText,
        set: () => {},
        configurable: true
    });

    if (messageObj.author) {
        // 2. Spoof display names
        Object.defineProperty(messageObj.author, "username", { get: () => storage.spoofedDisplayName, configurable: true });
        Object.defineProperty(messageObj.author, "globalName", { get: () => storage.spoofedDisplayName, configurable: true });
        Object.defineProperty(messageObj.author, "nick", { get: () => storage.spoofedDisplayName, configurable: true });

        // 3. Force override avatar getters & methods
        if (storage.spoofedAvatar) {
            Object.defineProperty(messageObj.author, "avatar", { get: () => "spoofed_hash", configurable: true });
            messageObj.author.getAvatarURL = () => storage.spoofedAvatar;
            messageObj.author.avatarURL = storage.spoofedAvatar;
            if (typeof messageObj.author.getAvatarSource === "function") {
                messageObj.author.getAvatarSource = () => ({ uri: storage.spoofedAvatar });
            }
        }
    }
}

export default {
    onLoad: () => {
        // Patch UserStore directly to override avatar across all mobile UI components
        const UserStore = metro.findByProps("getUser", "getCurrentUser");
        if (UserStore) {
            patches.push(patcher.after("getUser", UserStore, (args, user) => {
                if (user && storage.spoofedAvatar) {
                    user.getAvatarURL = () => storage.spoofedAvatar;
                    user.getAvatarSource = () => ({ uri: storage.spoofedAvatar });
                }
            }));
        }

        // Patch FluxDispatcher for incoming message payloads
        if (FluxDispatcher) {
            patches.push(patcher.before("dispatch", FluxDispatcher, (args) => {
                const [payload] = args;
                if ((payload.type === "LOAD_MESSAGES_SUCCESS" || payload.type === "LOCAL_MESSAGE_CREATE" || payload.type === "MESSAGE_CREATE") && payload.messages) {
                    const target = payload.messages.find((m: any) => m?.id === storage.targetMessageId);
                    if (target) applyMobileSpoof(target);
                }
            }));
        }
        
        // Patch RowManager for live chat row generation
        const RowManager = metro.findByProps("prototype", "generate");
        if (RowManager?.prototype) {
            patches.push(patcher.after("generate", RowManager.prototype, (args, ret) => {
                if (ret?.message?.id === storage.targetMessageId) {
                    applyMobileSpoof(ret.message);
                }
            }));
        }
    },
    onUnload: () => patches.forEach(p => typeof p === "function" && p()),
    settings: Settings
};
