import { storage } from "@vendetta";
import { findByName, findByStoreName } from "@vendetta/metro";
import { before } from "@vendetta/patcher";
import { React } from "@vendetta/metro/common";
import Settings from "./Settings";

const unpatches: (() => void)[] = [];
const UserStore = findByStoreName("UserStore");

// The component that renders the big avatar on the profile popout/screen.
// Name may need adjusting once we confirm via testing.
const HeaderAvatar = findByName("HeaderAvatar");

export const onLoad = () => {
    if (!HeaderAvatar) return;

    unpatches.push(
        before("default", HeaderAvatar, (args) => {
            const [props] = args;
            const me = UserStore.getCurrentUser();

            // Only overlay on your own avatar, only ever local render
            if (storage.customDecoUrl && props?.user?.id === me?.id) {
                props.__localDecoOverlay = storage.customDecoUrl;
            }
        })
    );
};

export const onUnload = () => {
    unpatches.forEach((u) => u());
};

export const settings = Settings;
