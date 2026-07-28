import { Forms } from "@vendetta/ui/components";
import { storage } from "@vendetta";
import { React } from "@vendetta/metro/common";

const { FormSection, FormInput } = Forms;

export default () => {
    const [deco, setDeco] = React.useState(storage.spoofedDecoration ?? "");

    return (
        <FormSection title="Custom Avatar Decoration">
            <FormInput
                title="Avatar Decoration URL"
                value={deco}
                placeholder="Paste direct PNG or APNG link here"
                onChange={(v: string) => {
                    setDeco(v);
                    storage.spoofedDecoration = v || undefined;
                }}
            />
        </FormSection>
    );
};
