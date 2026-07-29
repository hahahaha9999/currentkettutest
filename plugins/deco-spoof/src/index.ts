import { storage } from "@vendetta";
import { findByStoreName } from "@vendetta/metro";
import { FluxDispatcher } from "@vendetta/metro/common";
import Settings from "./Settings";

const UserStore = findByStoreName("UserStore");

function applyLocalDecoration() {
    const user = UserStore.getCurrentUser();
    if (!user) return;

    if (storage.customDecoUrl) {
        // "asset" here is just our own local URL, not a real Discord SKU/asset id
        user.avatarDecoration = { asset: storage.customDecoUrl, skuId: "local-custom" };
    } else {
        user.avatarDecoration = null;
    }
    user.avatarDecorationData = user.avatarDecoration;

    // Only touches your own client's rendering of your own user object
    FluxDispatcher.dispatch({ type: "CURRENT_USER_UPDATE", user });
}

export const onLoad = () => {
    applyLocalDecoration();
};

export const onUnload = () => {
    const user = UserStore.getCurrentUser();
    if (user) {
        user.avatarDecoration = null;
        user.avatarDecorationData = null;
        FluxDispatcher.dispatch({ type: "CURRENT_USER_UPDATE", user });
    }
};

export const settings = Settings;
