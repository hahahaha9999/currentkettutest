// src/index.ts
import { Forms } from "@vendetta/ui/components";
import { storage } from "@vendetta";
import { React, FluxDispatcher } from "@vendetta/metro/common";

const { FormSection, FormInput } = Forms;

// Small helper so we don't dispatch too fast while typing
function debounce<T extends (...args: any[]) => void>(fn: T, ms = 60) {
  let t: number | undefined;
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    // @ts-ignore - React Native timers return number
    t = setTimeout(() => fn(...args), ms) as unknown as number;
  };
}

// Discord expects a minimal "message" model with channel_id and edited_timestamp.
// Without channel_id, many clients short‑circuit the update.
function triggerMessageUpdate() {
  const id = storage.targetMessageId as string | undefined;
  const content = (storage.spoofedContent as string | undefined) || undefined;
  const channelId =
    (storage.targetChannelId as string | undefined) ||
    // fallback for 1:1 DMs: remember the last opened channel if you saved it elsewhere
    undefined;

  if (!id) return;

  // 1) Message mutation for the row
  FluxDispatcher.dispatch({
    type: "MESSAGE_UPDATE",
    message: {
      id,
      channel_id: channelId, // strongly improves hit rate for live DMs
      content,
      edited_timestamp: new Date().toISOString(),
    },
  });

  // 2) Nudge MessageStore caches that key on channel_id
  if (channelId) {
    FluxDispatcher.dispatch({
      type: "CHANNEL_SELECT",
      channelId,
    });
  }

  // 3) Force a shallow UI invalidation tick. Many mobile builds listen for PRESENCE_UPDATES or TYPING_START to re-read row props.
  // Use a no-op presence payload for the self user (safe and cheap).
  const selfId = storage.selfUserId as string | undefined;
  if (selfId) {
    FluxDispatcher.dispatch({
      type: "PRESENCE_UPDATES",
      updates: [
        {
          user: { id: selfId },
          status: "online",
          clientStatus: { mobile: "online" },
          activities: [],
        },
      ],
    });
  }
}

const triggerUpdate = debounce(triggerMessageUpdate, 80);

export default function Settings() {
  const [msgId, setMsgId] = React.useState<string>(storage.targetMessageId ?? "");
  const [chanId, setChanId] = React.useState<string>(storage.targetChannelId ?? "");
  const [name, setName] = React.useState<string>(storage.spoofedName ?? "");
  const [content, setContent] = React.useState<string>(storage.spoofedContent ?? "");
  const [avatar, setAvatar] = React.useState<string>(storage.spoofedAvatar ?? "");
  const [selfId, setSelfId] = React.useState<string>(storage.selfUserId ?? "");

  return (
    <FormSection title="Local Message Modifier">
      <FormInput
        title="Target Message ID"
        value={msgId}
        placeholder="e.g. 1234567890123456789"
        onChange={(v: string) => {
          setMsgId(v);
          storage.targetMessageId = v || undefined;
          triggerUpdate();
        }}
      />
      <FormInput
        title="Channel ID (recommended)"
        value={chanId}
        placeholder="DM/Channel ID containing the message"
        onChange={(v: string) => {
          setChanId(v);
          storage.targetChannelId = v || undefined;
          triggerUpdate();
        }}
      />
      <FormInput
        title="Spoofed Display Name"
        value={name}
        placeholder="New Name (local only)"
        onChange={(v: string) => {
          setName(v);
          storage.spoofedName = v || undefined;
          triggerUpdate();
        }}
      />
      <FormInput
        title="Spoofed Text Content"
        value={content}
        placeholder="Local text override"
        onChange={(v: string) => {
          setContent(v);
          storage.spoofedContent = v || undefined;
          triggerUpdate();
        }}
      />
      <FormInput
        title="Avatar URL"
        value={avatar}
        placeholder="https://…/image.png"
        onChange={(v: string) => {
          setAvatar(v);
          storage.spoofedAvatar = v || undefined;
          triggerUpdate();
        }}
      />
      <FormInput
        title="Your User ID (for live nudge)"
        value={selfId}
        placeholder="Used to send a harmless presence tick"
        onChange={(v: string) => {
          setSelfId(v);
          storage.selfUserId = v || undefined;
          triggerUpdate();
        }}
      />
    </FormSection>
  );
}
