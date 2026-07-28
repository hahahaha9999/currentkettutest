import { Forms } from "@vendetta/ui/components";
import { storage } from "@vendetta";
import { React, FluxDispatcher } from "@vendetta/metro/common";

const { FormSection, FormInput } = Forms;

function triggerUpdate() {
    if (!storage.targetMessageId) return;
    
    // Forces Discord to re-render the row in realtime without leaving the DM
    FluxDispatcher.dispatch({
        type: "MESSAGE_UPDATE",
        message: {
            id: storage.targetMessageId,
            content: storage.spoofedContent || undefined
        }
    });
}

export default () => {
    const [msgId, setMsgId] = React.useState(storage.targetMessageId ?? "");
    const [name, setName] = React.useState(storage.spoofedName ?? "");
    const [content, setContent] = React.useState(storage.spoofedContent ?? "");
    const [avatar, setAvatar] = React.useState(storage.spoofedAvatar ?? "");

    return (
        <FormSection title="Spoof Settings">
            <FormInput
                title="Target Message ID"
                value={msgId}
                placeholder="Target Message ID"
                onChange={(v: string) => { 
                    setMsgId(v); 
                    storage.targetMessageId = v; 
                    triggerUpdate();
                }}
            />
            <FormInput
                title="Spoofed Display Name"
                value={name}
                placeholder="New Name"
                onChange={(v: string) => { 
                    setName(v); 
                    storage.spoofedName = v; 
                    triggerUpdate();
                }}
            />
            <FormInput
                title="Spoofed Text Content"
                value={content}
                placeholder="New Text"
                onChange={(v: string) => { 
                    setContent(v); 
                    storage.spoofedContent = v; 
                    triggerUpdate();
                }}
            />
            <FormInput
                title="Avatar URL"
                value={avatar}
                placeholder="Direct Image Link"
                onChange={(v: string) => { 
                    setAvatar(v); 
                    storage.spoofedAvatar = v; 
                    triggerUpdate();
                }}
            />
        </FormSection>
    );
};
