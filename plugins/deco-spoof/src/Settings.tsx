import { Forms } from "@vendetta/ui/components";
import { storage } from "@vendetta";
import { React } from "@vendetta/metro/common";

const { FormSection, FormInput } = Forms;

export default () => {
    const [msgId, setMsgId] = React.useState(storage.targetMessageId ?? "");
    const [chanId, setChanId] = React.useState(storage.targetChannelId ?? "");
    const [name, setName] = React.useState(storage.spoofedName ?? "");
    const [content, setContent] = React.useState(storage.spoofedContent ?? "");
    const [avatar, setAvatar] = React.useState(storage.spoofedAvatar ?? "");
    const [deco, setDeco] = React.useState(storage.spoofedDecoration ?? "");

    return (
        <FormSection title="Local Message Modifier">
            <FormInput
                title="Target Message ID"
                value={msgId}
                placeholder="Target Message ID"
                onChange={(v: string) => {
                    setMsgId(v);
                    storage.targetMessageId = v || undefined;
                }}
            />
            <FormInput
                title="Channel ID"
                value={chanId}
                placeholder="DM or Channel ID"
                onChange={(v: string) => {
                    setChanId(v);
                    storage.targetChannelId = v || undefined;
                }}
            />
            <FormInput
                title="Spoofed Display Name"
                value={name}
                placeholder="New Name"
                onChange={(v: string) => {
                    setName(v);
                    storage.spoofedName = v || undefined;
                }}
            />
            <FormInput
                title="Spoofed Text Content"
                value={content}
                placeholder="New Content"
                onChange={(v: string) => {
                    setContent(v);
                    storage.spoofedContent = v || undefined;
                }}
            />
            <FormInput
                title="Avatar URL"
                value={avatar}
                placeholder="Direct Image Link"
                onChange={(v: string) => {
                    setAvatar(v);
                    storage.spoofedAvatar = v || undefined;
                }}
            />
            <FormInput
                title="Avatar Decoration URL"
                value={deco}
                placeholder="Direct APNG or PNG Decoration URL"
                onChange={(v: string) => {
                    setDeco(v);
                    storage.spoofedDecoration = v || undefined;
                }}
            />
        </FormSection>
    );
};
