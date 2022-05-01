<template>
	<div>
		<a-modal
			v-model="updateVisible"
			title="用户注册"
			destroyOnClose
			:width="600"
			:footer="null"
			:maskClosable="false"
			@cancel="handleCancel"
		>
			<a-form
				:form="form"
				:label-col="{ span: 5 }"
				:wrapper-col="{ span: 17 }"
				@submit="handleSubmit"
			>
				<a-form-item label="用户名">
					<a-input
						v-decorator="['username', { rules: [{ required: true, message: '用户名不能为空' }] }]"
						placeholder="请输入用户名或昵称"
						allowClear
					/>
				</a-form-item>
				<a-form-item label="密码">
					<a-input
						v-decorator="['password', { rules: [{ required: true, message: '密码不能为空' }] }]"
						placeholder="请输入密码"
						allowClear
					/>
				</a-form-item>
				<a-form-item :wrapper-col="{ span: 12, offset: 5 }">
					<a-button type="primary" html-type="submit"> 注册 </a-button>
				</a-form-item>
			</a-form>
		</a-modal>
	</div>
</template>
<script>
import { userRegister } from '@/http/api'
import { message } from 'ant-design-vue'

// import { uploadImage, submitPost } from '../http/api'
export default {
	props: ['visible'],
	data() {
		return {
			formLayout: 'horizontal',
			form: this.$form.createForm(this, { name: 'register' }),
		}
	},
	computed: {
		updateVisible: function () {
			return this.visible
		},
	},

	methods: {
		handleCancel() {
			this.$emit('close')
		},
		handleSubmit(e) {
			e.preventDefault()
			this.form.validateFields((err, values) => {
				if (!err) {
					console.log('Received values of form: ', values)

					userRegister({
						username: values.username,
						password: values.password,
					}).then(res => {
						console.log(res)
						if (res.data.code === 200) {
							message.success(res.data.message)
							this.$emit('close')
						} else {
							message.error(res.data.message)
						}
					})
				}
			})
		},
	},
}
</script>
