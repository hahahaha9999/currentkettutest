import { patcher, storage } from "@vendetta";
import { metro } from "@vendetta";
import Settings from "./Settings";

storage.spoofedDecoration ??= "";

let patches: any[] = [];

export default {
    onLoad: () => {
        const UserStore = metro.findByProps("getCurrentUser");
        if (UserStore) {
            patches.push(patcher.after("getCurrentUser", UserStore, (_, ret) => {
                if (ret && storage.spoofedDecoration) {
                    ret.avatarDecorationData = {
                        asset: storage.spoofedDecoration,
                        sku_id: "000000000000000000"
                    };
                }
                return ret;
            }));
        }
    },
    onUnload: () => patches.forEach(p => typeof p === "function" && p()),
    settings: Settings
};
