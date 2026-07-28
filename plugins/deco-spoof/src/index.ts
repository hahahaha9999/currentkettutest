import { patcher, storage } from "@vendetta";
import { metro } from "@vendetta";
import { FluxDispatcher } from "@vendetta/metro/common";
import Settings from "./Settings";

storage.decoTargetUserId ??= "";
storage.decoTargetMessageId ??= "";
storage.decoAsset ??= "";
storage.decoSku ??= "";

let patches = [];

function getDecoObj() {
    if (!storage.decoAsset || !storage.decoSku) return null;
    return {
        asset: storage.decoAsset,
        skuId: storage.decoSku,
        sku_id: storage.decoSku
    };
}

function patchAuthor(authorObj: any) {
    if (!authorObj) return;
    const decoData = getDecoObj();
    if (!decoData) return;

    try {
        Object.defineProperty(authorObj, "avatarDecoration", { get: () => decoData, configurable: true });
        Object.defineProperty(authorObj, "avatarDecorationData", { get: () => decoData, configurable: true });
        Object.defineProperty(authorObj, "avatar_decoration_data", { get: () => decoData, configurable: true });
    } catch (e) {}
}

export default {
    onLoad: () => {
        const UserStore = metro.findByProps("getCurrentUser", "getUser");
        if (UserStore) {
            patches.push(patcher.after("getUser", UserStore, (args, user) => {
                if (!user) return;
                const targetId = storage.decoTargetUserId || UserStore.getCurrentUser()?.id;
                if (user.id === targetId) {
                    patchAuthor(user);
                }
            }));
        }

        if (FluxDispatcher) {
            patches.push(patcher.before("dispatch", FluxDispatcher, (args) => {
                const [payload] = args;
                if (!payload) return;

                if ((payload.type === "LOAD_MESSAGES_SUCCESS" || payload.type === "LOCAL_MESSAGE_CREATE") && Array.isArray(payload.messages)) {
                    payload.messages.forEach((msg: any) => {
                        if (
                            (storage.decoTargetMessageId && msg?.id === storage.decoTargetMessageId) ||
                            (storage.decoTargetUserId && msg?.author?.id === storage.decoTargetUserId)
                        ) {
                            patchAuthor(msg.author);
                        }
                    });
                }
            }));
        }
    },
    onUnload: () => patches.forEach(p => typeof p === "function" && p()),
    settings: Settings
};
