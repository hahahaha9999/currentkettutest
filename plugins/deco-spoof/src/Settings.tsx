import { Forms } from "@vendetta/ui/components";
import { storage } from "@vendetta";
import { React } from "@vendetta/metro/common";

const { FormSection, FormInput } = Forms;

export default () => {
    const [userId, setUserId] = React.useState(storage.decoTargetUserId ?? "");
    const [messageId, setMessageId] = React.useState(storage.decoTargetMessageId ?? "");
    const [asset, setAsset] = React.useState(storage.decoAsset ?? "");
    const [sku, setSku] = React.useState(storage.decoSku ?? "");

    return (
        <FormSection title="Decoration Spoof Settings">
            <FormInput
                title="Target User ID (Applies to all their messages)"
                value={userId}
                placeholder="Target User ID"
                onChange={(v: string) => { setUserId(v); storage.decoTargetUserId = v; }}
            />
            <FormInput
                title="Target Message ID (Optional)"
                value={messageId}
                placeholder="Target Message ID"
                onChange={(v: string) => { setMessageId(v); storage.decoTargetMessageId = v; }}
            />
            <FormInput
                title="Decoration Asset Hash"
                value={asset}
                placeholder="e.g. a_c7febbc41e0673e42f79a79078701660"
                onChange={(v: string) => { setAsset(v); storage.decoAsset = v; }}
            />
            <FormInput
                title="Decoration SKU ID"
                value={sku}
                placeholder="e.g. 1354894010602361124"
                onChange={(v: string) => { setSku(v); storage.decoSku = v; }}
            />
        </FormSection>
    );
};
