<template>
    <div class="adremovecontainer">
        <div class="addremove">
            <div v-if="! canEdit">
                {{ currentValue }}
            </div>

            <template v-else>
                <button
                    class="teambutton remove"
                    :class="{disabled: !removeIsEnabled}"
                    :disabled="!removeIsEnabled"
                    @click.prevent="remove"
                >{{ labelRemove }}</button>
                <div class="currentvalue">{{ currentValue }}</div>
                <button
                    class="teambutton add"
                    :class="{disabled: !addIsEnabled}"
                    :disabled="!addIsEnabled"
                    @click.prevent="add"
                >{{ labelAdd }}</button>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import { Prop, Component, Vue, toNative, Emit } from 'vue-facing-decorator'

@Component
class AddRemoveComponent extends Vue {
    @Prop({
        type: String,
        required: true,
    })
    public currentValue!: string;

    @Prop({
        type: Boolean,
        required: true,
    })
    public canEdit!: boolean;

    @Prop({
        type: Boolean,
        required: true,
    })
    public canRemoveImmediately!: boolean;

    @Prop({
        type: Boolean,
        required: true,
    })
    public canAdd!: boolean;

    @Prop({
        type: Boolean,
        required: true,
    })
    public canRemove!: boolean;

    @Prop({
        type: String,
        required: true,
    })
    public labelAdd!: string;

    @Prop({
        type: String,
        required: true,
    })
    public labelRemove!: string;

    @Emit('add')
    public triggerAdd() {}

    @Emit('remove-immediately')
    public triggerRemoveImmediately() {}

    @Emit('remove-with-confirm')
    public triggerRemoveWithConfirm() {}

    public get addIsEnabled(): boolean {
        return this.canAdd;
    }

    public get removeIsEnabled(): boolean {
        return this.canRemove;
    }

    public add() {
        if (this.addIsEnabled) {
            this.triggerAdd();
        }
    }

    public remove() {
        if (this.removeIsEnabled) {
            if (this.canRemoveImmediately) {
                this.triggerRemoveImmediately();
            } else {
                this.triggerRemoveWithConfirm();
            }
        }
    }
}

export default toNative(AddRemoveComponent);
</script>