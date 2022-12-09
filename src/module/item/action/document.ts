import { ItemPF2e } from "@item/base";
import { ActionItemData, ActionItemSource } from "./data";
import { OneToThree } from "@module/data";
import { UserPF2e } from "@module/user";
import { ActionCost, Frequency } from "@item/data/base";
import { ItemSummaryData } from "@item/data";

class ActionItemPF2e extends ItemPF2e {
    get actionCost(): ActionCost | null {
        const actionType = this.system.actionType.value || "passive";
        if (actionType === "passive") return null;

        return {
            type: actionType,
            value: this.system.actions.value,
        };
    }

    get frequency(): Frequency | null {
        return this.system.frequency ?? null;
    }

    override prepareBaseData(): void {
        super.prepareBaseData();

        // Initialize frequency uses if not set
        if (this.actor && this.system.frequency) {
            this.system.frequency.value ??= this.system.frequency.max;
        }
    }

    override async getChatData(
        this: Embedded<ActionItemPF2e>,
        htmlOptions: EnrichHTMLOptions = {}
    ): Promise<ItemSummaryData> {
        const systemData = this.system;
        const actionType = this.actionCost?.type ?? "passive";
        const properties = [CONFIG.PF2E.actionTypes[actionType]];
        const traits = this.traitChatData(CONFIG.PF2E.featTraits);
        return this.processChatData(htmlOptions, { ...systemData, properties, traits });
    }

    protected override async _preCreate(
        data: PreDocumentId<ActionItemSource>,
        options: DocumentModificationContext<this>,
        user: UserPF2e
    ): Promise<void> {
        // In case this was copied from an actor, clear any active frequency value
        if (!this.parent) {
            if (this._source.system.frequency) {
                this.updateSource({ "system.frequency.-=value": null });
            }
        }

        return super._preCreate(data, options, user);
    }

    protected override async _preUpdate(
        changed: DeepPartial<this["_source"]>,
        options: DocumentModificationContext<this>,
        user: UserPF2e
    ): Promise<void> {
        const actionCount = changed.system?.actions;
        if (actionCount) {
            actionCount.value = (Math.clamped(Number(actionCount.value), 0, 3) || null) as OneToThree | null;
        }
        await super._preUpdate(changed, options, user);
    }
}

interface ActionItemPF2e {
    readonly data: ActionItemData;
}

export { ActionItemPF2e };
