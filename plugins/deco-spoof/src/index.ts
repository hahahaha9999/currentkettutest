import { patcher, storage } from "@vendetta";
import { metro } from "@vendetta";
import { FluxDispatcher } from "@vendetta/metro/common";
import Settings from "./Settings";

storage.targetUserId ??= "";
storage.targetMessageId ??= "";
storage.decoAsset ??= "";
storage.decoSku ??= "";

let patches = [];

function applyDecoration(authorObj: any) {
    if (!authorObj || !storage.decoAsset || !storage.decoSku) return;

    const decoData = {
        asset: storage.decoAsset,
        skuId: storage.decoSku,
        sku_id: storage.decoSku
    };

    Object.defineProperty(authorObj, "avatarDecoration", { get: () => decoData, configurable: true });
    Object.defineProperty(authorObj, "avatarDecorationData", { get: () => decoData, configurable: true });
    Object.defineProperty(authorObj, "avatar_decoration_data", { get: () => decoData, configurable: true });
}

export default {
    onLoad: () => {
        if (FluxDispatcher) {
            patches.push(patcher.before("dispatch", FluxDispatcher, (args) => {
                const [payload] = args;
                if (!payload) return;

                if ((payload.type === "LOAD_MESSAGES_SUCCESS" || payload.type === "LOCAL_MESSAGE_CREATE") && Array.isArray(payload.messages)) {
                    payload.messages.forEach((msg: any) => {
                        if (
                            (storage.targetMessageId && msg?.id === storage.targetMessageId) ||
                            (storage.targetUserId && msg?.author?.id === storage.targetUserId)
                        ) {
                            applyDecoration(msg.author);
                        }
                    });
                }
            }));
        }

        const RowManager = metro.findByProps("prototype", "generate");
        if (RowManager?.prototype) {
            patches.push(patcher.after("generate", RowManager.prototype, (args, ret) => {
                const msg = ret?.message;
                if (!msg?.author) return;

                if (
                    (storage.targetMessageId && msg.id === storage.targetMessageId) ||
                    (storage.targetUserId && msg.author.id === storage.targetUserId)
                ) {
                    applyDecoration(msg.author);
                }
            }));
        }
    },
    onUnload: () => patches.forEach(p => typeof p === "function" && p()),
    settings: Settings
};
