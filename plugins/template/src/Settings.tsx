import { Forms } from "@vendetta/ui/components";
import { storage } from "@vendetta";
import { useProxy } from "@vendetta/storage";

const { FormSection, FormInput } = Forms;

export default () => {
    useProxy(storage);

    return (
        <FormSection title="Spoof Settings">
            <FormInput
                title="Target Message ID"
                value={storage.targetMessageId}
                onChange={(v: string) => (storage.targetMessageId = v)}
            />
            <FormInput
                title="Spoofed Display Name"
                value={storage.spoofedDisplayName}
                onChange={(v: string) => (storage.spoofedDisplayName = v)}
            />
            <FormInput
                title="Spoofed Text Content"
                value={storage.spoofedText}
                onChange={(v: string) => (storage.spoofedText = v)}
            />
            <FormInput
                title="Avatar URL"
                value={storage.spoofedAvatar}
                onChange={(v: string) => (storage.spoofedAvatar = v)}
            />
        </FormSection>
    );
};
