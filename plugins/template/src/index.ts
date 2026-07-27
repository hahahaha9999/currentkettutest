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

    // 1. Message Content
    if (storage.spoofedText !== undefined) {
        messageObj.content = storage.spoofedText;
    }

    if (messageObj.author) {
        // 2. Display Names
        if (storage.spoofedDisplayName) {
            messageObj.author.username = storage.spoofedDisplayName;
            messageObj.author.globalName = storage.spoofedDisplayName;
            messageObj.author.nick = storage.spoofedDisplayName;
        }

        // 3. Avatar Decoration
        if (storage.spoofedDecoAsset && storage.spoofedDecoSku) {
            const decoObj = {
                asset: storage.spoofedDecoAsset,
                skuId: storage.spoofedDecoSku,
                sku_id: storage.spoofedDecoSku
            };
            messageObj.author.avatarDecoration = decoObj;
            messageObj.author.avatarDecorationData = decoObj;
        }

        // 4. Avatar URL
        if (storage.spoofedAvatar) {
            messageObj.author.avatar = "spoofed_hash";
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
        // Safely check Dispatcher payloads
        if (FluxDispatcher) {
            patches.push(patcher.before("dispatch", FluxDispatcher, (args) => {
                const [payload] = args;
                if (!payload) return;

                if (payload.type === "LOAD_MESSAGES_SUCCESS" && Array.isArray(payload.messages)) {
                    const target = payload.messages.find((m: any) => m?.id === storage.targetMessageId);
                    if (target) applyMobileSpoof(target);
                }

                if ((payload.type === "LOCAL_MESSAGE_CREATE" || payload.type === "MESSAGE_CREATE") && payload.message?.id === storage.targetMessageId) {
                    applyMobileSpoof(payload.message);
                }
            }));
        }
        
        // RowManager handles the live chat rendering on screen
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
