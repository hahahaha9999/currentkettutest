import { storage } from "@vendetta";
import { findByProps } from "@vendetta/metro";
import { before } from "@vendetta/patcher";
import Settings from "./Settings";

const unpatches: (() => void)[] = [];

// Discord's user store / avatar decoration hook differs by version;
// this patches the function that resolves decoration URLs for a user.
const UserStore = findByProps("getCurrentUser", "getUser");
const AvatarDecorationModule = findByProps("getAvatarDecorationURL");

export const onLoad = () => {
    if (!AvatarDecorationModule) return;

    unpatches.push(
        before("getAvatarDecorationURL", AvatarDecorationModule, (args) => {
            const [{ user }] = args;
            const me = UserStore.getCurrentUser();

            // Only ever override for yourself, only ever local render
            if (storage.customDecoUrl && user?.id === me?.id) {
                return [{ ...args[0], forceReturn: storage.customDecoUrl }];
            }
        })
    );
};

export const onUnload = () => {
    unpatches.forEach((u) => u());
};

export const settings = Settings;
