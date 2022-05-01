import { message } from 'ant-design-vue'
import axios from 'axios'
import qs from 'qs'

axios.defaults.baseURL =
	process.env.NODE_ENV === 'development' ? 'http://localhost:4001/' : 'http://106.55.228.251:4001/'

axios.interceptors.response.use(
	response => {
		if (response.status === 200) {
			return Promise.resolve(response)
		} else {
			return Promise.reject(response)
		}
	},
	error => {
		if (error.response.status) {
			message.error(error.response.message)
			return Promise.reject(error.response)
		}
	},
)

export function post(url, data) {
	return new Promise((resolve, reject) => {
		axios
			.post(url, qs.stringify(data))
			.then(res => {
				resolve(res)
			})
			.catch(err => {
				reject(err)
			})
	})
}

export function get(url, params) {
	return new Promise((resolve, reject) => {
		axios
			.get(url, {
				params: params,
			})
			.then(res => {
				resolve(res.data)
			})
			.catch(err => {
				reject(err.data)
			})
	})
}
