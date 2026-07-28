import { Forms } from "@vendetta/ui/components";
import { storage } from "@vendetta";
import { React, FluxDispatcher } from "@vendetta/metro/common";

const { FormSection, FormInput } = Forms;

function debounce<T extends (...args: any[]) => void>(fn: T, ms = 80) {
    let t: any;
    return (...args: Parameters<T>) => {
        if (t) clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
    };
}

function triggerMessageUpdate() {
    const id = storage.targetMessageId;
    const channelId = storage.targetChannelId;
    const content = storage.spoofedContent || undefined;

    if (!id) return;

    // 1. Dispatch update with channel_id so active chats process it live
    FluxDispatcher.dispatch({
        type: "MESSAGE_UPDATE",
        message: {
            id,
            channel_id: channelId || undefined,
            content,
            edited_timestamp: new Date().toISOString(),
        },
    });

    // 2. Force chat list cell invalidation
    if (channelId) {
        FluxDispatcher.dispatch({
            type: "MESSAGE_ACK",
            channelId,
            messageId: id
        });
    }
}

const triggerUpdate = debounce(triggerMessageUpdate, 80);

export default () => {
    const [msgId, setMsgId] = React.useState(storage.targetMessageId ?? "");
    const [chanId, setChanId] = React.useState(storage.targetChannelId ?? "");
    const [name, setName] = React.useState(storage.spoofedName ?? "");
    const [content, setContent] = React.useState(storage.spoofedContent ?? "");
    const [avatar, setAvatar] = React.useState(storage.spoofedAvatar ?? "");

    return (
        <FormSection title="Local Message Modifier">
            <FormInput
                title="Target Message ID"
                value={msgId}
                placeholder="Target Message ID"
                onChange={(v: string) => {
                    setMsgId(v);
                    storage.targetMessageId = v || undefined;
                    triggerUpdate();
                }}
            />
            <FormInput
                title="Channel ID (Required for live online updates)"
                value={chanId}
                placeholder="DM or Channel ID"
                onChange={(v: string) => {
                    setChanId(v);
                    storage.targetChannelId = v || undefined;
                    triggerUpdate();
                }}
            />
            <FormInput
                title="Spoofed Display Name"
                value={name}
                placeholder="New Name"
                onChange={(v: string) => {
                    setName(v);
                    storage.spoofedName = v || undefined;
                    triggerUpdate();
                }}
            />
            <FormInput
                title="Spoofed Text Content"
                value={content}
                placeholder="New Content"
                onChange={(v: string) => {
                    setContent(v);
                    storage.spoofedContent = v || undefined;
                    triggerUpdate();
                }}
            />
            <FormInput
                title="Avatar URL"
                value={avatar}
                placeholder="Direct Image Link"
                onChange={(v: string) => {
                    setAvatar(v);
                    storage.spoofedAvatar = v || undefined;
                    triggerUpdate();
                }}
            />
        </FormSection>
    );
};
