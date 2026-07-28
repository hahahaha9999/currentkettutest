import { Forms } from "@vendetta/ui/components";
import { storage } from "@vendetta";
import { React } from "@vendetta/metro/common";

const { FormSection, FormInput, FormText } = Forms;

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
                }}
            />
        </FormSection>
    );
};
