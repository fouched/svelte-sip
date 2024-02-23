import { writable } from 'svelte/store'

const statusStore = writable(
	{
		registered: false,
		statusText: 'Log in to start'
	}
)

export default {
	subscribe: statusStore.subscribe,
	showMessage: function (message, registered = true) {
		statusStore.set({ registered: registered, statusText: message })
	}
}
