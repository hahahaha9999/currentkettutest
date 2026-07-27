import { Forms } from "@vendetta/ui/components";
import { storage } from "@vendetta";
import { React } from "@vendetta/metro/common";

const { FormSection, FormInput } = Forms;

export default () => {
    const [targetId, setTargetId] = React.useState(storage.targetMessageId ?? "");
    const [displayName, setDisplayName] = React.useState(storage.spoofedDisplayName ?? "");
    const [text, setText] = React.useState(storage.spoofedText ?? "");
    const [avatar, setAvatar] = React.useState(storage.spoofedAvatar ?? "");
    const [decoAsset, setDecoAsset] = React.useState(storage.spoofedDecoAsset ?? "");
    const [decoSku, setDecoSku] = React.useState(storage.spoofedDecoSku ?? "");

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
                value={avatar}
                placeholder="Avatar Image URL"
                onChange={(v: string) => { setAvatar(v); storage.spoofedAvatar = v; }}
            />
            <FormInput
                value={decoAsset}
                placeholder="Decoration Asset Hash"
                onChange={(v: string) => { setDecoAsset(v); storage.spoofedDecoAsset = v; }}
            />
            <FormInput
                value={decoSku}
                placeholder="Decoration SKU ID"
                onChange={(v: string) => { setDecoSku(v); storage.spoofedDecoSku = v; }}
            />
        </FormSection>
    );
};
