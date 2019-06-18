import { Message } from 'element-ui';
import { BoyState } from './module-types';
import { MutationTree, ActionTree, Module } from 'vuex';
import { RootState } from '../root-types';
const state: BoyState = {
    currentFlower: 50,
    braveScore: 0
}
const mutations: MutationTree<BoyState> = {
    updateCurrentFlower(state, payload) {
        state.currentFlower = state.currentFlower + payload
    },

    updateBraveScore(state, payload) {
        state.braveScore = state.braveScore + payload.score
    }
}
const actions: ActionTree<BoyState, RootState> = {
    sendFlower({ commit, state }, params) {
        if (!state.currentFlower) {
            Message({
                showClose: true,
                message: "没花可送了",
                type: "warning"
            });
        } else {
            commit('updateCurrentFlower', -params.sendNumber)
            commit('girl/updateCurrentFlower', params.sendNumber, { root: true })
        }

    },
    buyFlower({ commit, dispatch }, params) {
        setTimeout(() => {
            dispatch('sellFlower', null, { root: true }).then(() => {
                commit('updateCurrentFlower', params.buyNumber)
            }).catch(() => {
                Message({
                    showClose: true,
                    message: "库存不足",
                    type: "warning"
                });
            })
        }, 100)
    },
    beEncouraged({ commit }) {
        commit('updateBraveScore', { score: 10 })
    }
}
export const boy: Module<BoyState, RootState> = {
    namespaced: true,
    state,
    mutations,
    actions
}