<template>
	<a-form layout="inline" :form="form" @submit="handleSubmit">
		<a-form-item :validate-status="userNameError() ? 'error' : ''" :help="userNameError() || ''">
			<a-input v-decorator="['userName']" placeholder="用户名">
				<a-icon slot="prefix" type="user" style="color: rgba(0, 0, 0, 0.25)" />
			</a-input>
		</a-form-item>
		<a-form-item :validate-status="passwordError() ? 'error' : ''" :help="passwordError() || ''">
			<a-input v-decorator="['password']" type="password" placeholder="密码">
				<a-icon slot="prefix" type="lock" style="color: rgba(0, 0, 0, 0.25)" />
			</a-input>
		</a-form-item>
		<a-form-item>
			<a-button type="primary" html-type="submit" :disabled="hasErrors(form.getFieldsError())">
				登录
			</a-button>
		</a-form-item>
		<a-form-item>
			<a-button type="primary" @click="handleRegisterClick"> 注册 </a-button>
		</a-form-item>
	</a-form>
</template>

<script>
import { getAvator, userLogin } from '@/http/api'
import { commit } from '@/store'
import { message } from 'ant-design-vue'

function hasErrors(fieldsError) {
	return Object.keys(fieldsError).some(field => fieldsError[field])
}
export default {
	data() {
		return {
			hasErrors,
			form: this.$form.createForm(this, { name: 'horizontal_login' }),
		}
	},
	mounted() {
		this.$nextTick(() => {
			// To disabled submit button at the beginning.
			this.form.validateFields()
		})
	},
	methods: {
		// Only show error after a field is touched.
		userNameError() {
			const { getFieldError, isFieldTouched } = this.form
			return isFieldTouched('userName') && getFieldError('userName')
		},
		// Only show error after a field is touched.
		passwordError() {
			const { getFieldError, isFieldTouched } = this.form
			return isFieldTouched('password') && getFieldError('password')
		},
		handleSubmit(e) {
			e.preventDefault()
			this.form.validateFields((err, values) => {
				if (!err) {
					console.log('Received values of form: ')

					userLogin({
						username: values.userName,
						password: values.password,
					}).then(async res => {
						console.log(res)
						if (res.code === 200) {
							let avator = ''
							let avatorRes = await getAvator({
								user_id: res.userInfo.id,
								username: res.userInfo.username,
							})

							if (avatorRes.code === 200) {
								avator = avatorRes.avatorFile
							}

							console.log(avator, '头像')
							res.userInfo.avator = avator
							localStorage.setItem('USER_INFO', JSON.stringify(res.userInfo))
							localStorage.setItem('TOKEN', res.token)

							commit('token', res.token)
							commit('userInfo', res.userInfo)

							message.success('登录成功')
						} else {
							message.error(res.message)
						}
					})
				}
			})
		},
		handleRegisterClick() {
			console.log('handleRegisterClick')
			this.$emit('showRegister')
		},
	},
}
</script>
