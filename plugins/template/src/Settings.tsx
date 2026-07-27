import { Forms } from "@vendetta/ui/components";
import { storage } from "@vendetta";
import { React } from "@vendetta/metro/common";

const { FormSection, FormInput } = Forms;

export default () => {
    const [targetId, setTargetId] = React.useState(storage.targetMessageId ?? "");
    const [displayName, setDisplayName] = React.useState(storage.spoofedDisplayName ?? "");
    const [text, setText] = React.useState(storage.spoofedText ?? "");
    const [decoAsset, setDecoAsset] = React.useState(storage.spoofedDecoAsset ?? "");
    const [decoSku, setDecoSku] = React.useState(storage.spoofedDecoSku ?? "");

    return (
        <FormSection title="Spoof Settings">
            <FormInput
                title="Target Message ID"
                value={targetId}
                onChange={(v: string) => {
                    setTargetId(v);
                    storage.targetMessageId = v;
                }}
            />
            <FormInput
                title="Spoofed Display Name"
                value={displayName}
                onChange={(v: string) => {
                    setDisplayName(v);
                    storage.spoofedDisplayName = v;
                }}
            />
            <FormInput
                title="Spoofed Text Content"
                value={text}
                onChange={(v: string) => {
                    setText(v);
                    storage.spoofedText = v;
                }}
            />
            <FormInput
                title="Decoration Asset Hash"
                value={decoAsset}
                onChange={(v: string) => {
                    setDecoAsset(v);
                    storage.spoofedDecoAsset = v;
                }}
            />
            <FormInput
                title="Decoration SKU ID"
                value={decoSku}
                onChange={(v: string) => {
                    setDecoSku(v);
                    storage.spoofedDecoSku = v;
                }}
            />
        </FormSection>
    );
};
