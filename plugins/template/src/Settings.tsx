import { Forms } from "@vendetta/ui/components";
import { storage } from "@vendetta";
import { React } from "@vendetta/metro/common";

const { FormSection, FormInput, FormButton } = Forms;

export default () => {
    const [targetId, setTargetId] = React.useState(storage.targetMessageId ?? "");
    const [displayName, setDisplayName] = React.useState(storage.spoofedDisplayName ?? "");
    const [text, setText] = React.useState(storage.spoofedText ?? "");
    const [decoAsset, setDecoAsset] = React.useState(storage.spoofedDecoAsset ?? "");
    const [decoSku, setDecoSku] = React.useState(storage.spoofedDecoSku ?? "");

    const handleClear = () => {
        storage.targetMessageId = "";
        storage.spoofedDisplayName = "";
        storage.spoofedText = "";
        storage.spoofedAvatar = "";
        storage.spoofedDecoAsset = "";
        storage.spoofedDecoSku = "";

        setTargetId("");
        setDisplayName("");
        setText("");
        setDecoAsset("");
        setDecoSku("");
    };

    return (
        <FormSection title="Spoof Settings">
            <FormInput
                value={targetId}
                placeholder="Target Message ID"
                onChange={(v: string) => { setTargetId(v); storage.targetMessageId = v; }}
            />
            <FormInput
                value={displayName}
                placeholder="Spoofed Display Name"
                onChange={(v: string) => { setDisplayName(v); storage.spoofedDisplayName = v; }}
            />
            <FormInput
                value={text}
                placeholder="Spoofed Text Content"
                onChange={(v: string) => { setText(v); storage.spoofedText = v; }}
            />
            <FormInput
                value={decoAsset}
                placeholder="Avatar Decoration Asset ID"
                onChange={(v: string) => { setDecoAsset(v); storage.spoofedDecoAsset = v; }}
            />
            <FormInput
                value={decoSku}
                placeholder="Avatar Decoration SKU ID"
                onChange={(v: string) => { setDecoSku(v); storage.spoofedDecoSku = v; }}
            />
            <FormButton
                text="Clear All Settings"
                color="red"
                onPress={handleClear}
            />
        </FormSection>
    );
};
