import { patcher, storage } from "@vendetta";
import { metro } from "@vendetta";
import { FluxDispatcher } from "@vendetta/metro/common";
import Settings from "./Settings";

storage.targetMessageId ??= "1520914436460904678";
storage.spoofedText ??= "hey";
storage.spoofedDisplayName ??= "hucifer";
storage.spoofedAvatar ??= "https://cdn.discordapp.com/avatars/520647668511408153/f6f90c0e0e905ae354454b5f2042bd93.png";
storage.spoofedDecoAsset ??= "a_2b4b5a191f89c65d042f15e854129822";
storage.spoofedDecoSku ??= "1432550258147328050";

let patches = [];

function applyMobileSpoof(messageObj: any) {
    if (!messageObj) return;

    // 1. Spoof Message Content
    Object.defineProperty(messageObj, "content", {
        get: () => storage.spoofedText,
        set: () => {},
        configurable: true
    });

    if (messageObj.author) {
        // 2. Spoof Display Names
        Object.defineProperty(messageObj.author, "username", { get: () => storage.spoofedDisplayName, configurable: true });
        Object.defineProperty(messageObj.author, "globalName", { get: () => storage.spoofedDisplayName, configurable: true });
        Object.defineProperty(messageObj.author, "nick", { get: () => storage.spoofedDisplayName, configurable: true });

        // 3. Spoof Avatar Decoration (Asset & SKU ID)
        if (storage.spoofedDecoAsset && storage.spoofedDecoSku) {
            const decoObj = {
                asset: storage.spoofedDecoAsset,
                skuId: storage.spoofedDecoSku,
                sku_id: storage.spoofedDecoSku
            };

            Object.defineProperty(messageObj.author, "avatarDecoration", { get: () => decoObj, configurable: true });
            Object.defineProperty(messageObj.author, "avatarDecorationData", { get: () => decoObj, configurable: true });
            messageObj.author.avatarDecorationData = decoObj;
            messageObj.author.avatarDecoration = decoObj;
        }

        // 4. Force Avatar override
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
        // Intercept Flux dispatches (handles online/active gateway events)
        if (FluxDispatcher) {
            patches.push(patcher.before("dispatch", FluxDispatcher, (args) => {
                const [payload] = args;
                if (payload) {
                    if ((payload.type === "LOAD_MESSAGES_SUCCESS" || payload.type === "LOCAL_MESSAGE_CREATE" || payload.type === "MESSAGE_CREATE") && payload.messages) {
                        const target = payload.messages.find((m: any) => m?.id === storage.targetMessageId);
                        if (target) applyMobileSpoof(target);
                    }
                    if (payload.type === "MESSAGE_UPDATE" && payload.message?.id === storage.targetMessageId) {
                        applyMobileSpoof(payload.message);
                    }
                }
            }));
        }
        
        // Intercept RowManager (renders the row on screen continuously)
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
