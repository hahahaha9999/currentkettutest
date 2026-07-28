import { patcher, storage } from "@vendetta";
import { metro } from "@vendetta";
import Settings from "./Settings";

storage.spoofedDecoration ??= "";

let patches: any[] = [];

export default {
    onLoad: () => {
        // Patch user profile/messages to force your custom decoration
        const UserStore = metro.findByProps("getCurrentUser");
        if (UserStore) {
            patches.push(patcher.after("getCurrentUser", UserStore, () => {
                if (storage.spoofedDecoration) {
                    return {
                        avatarDecorationData: {
                            asset: storage.spoofedDecoration,
                            skuId: "000000000000000000"
                        }
                    };
                }
            }));
        }
    },
    onUnload: () => patches.forEach(p => typeof p === "function" && p()),
    settings: Settings
};
