import Vue from 'vue'

export const state = Vue.observable({
	token: '',
	userInfo: null,
})

export function commit(key, value) {
	state[key] = value
}
