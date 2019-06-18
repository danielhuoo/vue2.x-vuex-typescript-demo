<template>
    <div>
        <div>男孩</div>
        <div>手上有{{currentFlower}}朵花</div>
        <div>
            <el-button @click="sendFlower({sendNumber:1})">送花</el-button>
            <el-button @click="buyFlower({buyNumber:1})">买花</el-button>
        </div>
        <div>勇气值:{{braveScore}}</div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { State, Action, Mutation, namespace } from "vuex-class";
import { BoyState } from "../store/module/module-types";
@Component
export default class boyComponent extends Vue {
    @State("boy") boyState!: BoyState;
    @Action("sendFlower", { namespace: "boy" })
    sendFlower: any;
    @Action("buyFlower", { namespace: "boy" })
    buyFlower: any;

    get currentFlower(): number {
        return this.boyState.currentFlower;
    }

    get braveScore(): number {
        return this.boyState.braveScore;
    }
}
</script>
<style>
</style>