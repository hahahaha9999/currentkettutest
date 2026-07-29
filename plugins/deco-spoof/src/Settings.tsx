import { Forms } from "@vendetta/ui/components";
import { storage } from "@vendetta";
import { findByStoreName } from "@vendetta/metro";
import { FluxDispatcher, React } from "@vendetta/metro/common";

const { FormSection, FormInput, FormText } = Forms;
const UserStore = findByStoreName("UserStore");

function apply(url: string) {
    const user = UserStore.getCurrentUser();
    if (!user) return;
    user.avatarDecoration = url ? { asset: url, skuId: "local-custom" } : null;
    user.avatarDecorationData = user.avatarDecoration;
    FluxDispatcher.dispatch({ type: "CURRENT_USER_UPDATE", user });
}

export default () => {
    const [url, setUrl] = React.useState(storage.customDecoUrl ?? "");

    return (
        <FormSection title="Custom Decoration (Local Only)">
            <FormText>
                Paste a direct image link (PNG with transparency works best).
                This only changes what YOU see in YOUR client — it is never sent to Discord
                and nobody else will see it.
            </FormText>
            <FormInput
                title="Decoration Image URL"
                value={url}
                placeholder="https://example.com/my-deco.png"
                onChange={(v: string) => {
                    setUrl(v);
                    storage.customDecoUrl = v;
                    apply(v);
                }}
            />
        </FormSection>
    );
};
