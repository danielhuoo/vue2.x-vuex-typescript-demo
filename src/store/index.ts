import Vue from 'vue'
import Vuex, { StoreOptions } from 'vuex'
import { boy } from './module/boy'
import { girl } from './module/girl'
import { RootState } from './root-types';
Vue.use(Vuex)
const store: StoreOptions<RootState> = {
	state: {
		flowersInStock: 10
	},
	modules: {
		boy,
		girl
	},
	mutations: {
		updateFlowersInStock(state, payload) {
			state.flowersInStock = state.flowersInStock + payload
		}
	},
	actions: {
		sellFlower({ commit, state }) {
			return new Promise((resolve, reject) => {
				if (state.flowersInStock > 0) {
					commit('updateFlowersInStock', -1)
					resolve()
				} else {
					reject()
				}
			})
		}
	}
}
export default new Vuex.Store<RootState>(store)