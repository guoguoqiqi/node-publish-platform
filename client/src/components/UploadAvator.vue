<template>
	<div>
		<a-modal
			v-model="updateVisible"
			title="上传头像"
			destroyOnClose
			:width="600"
			:maskClosable="false"
			okText="上传"
			cancelText="取消"
			@ok="handleOk"
			@cancel="handleCancel"
		>
			<a-spin :spinning="spinning">
				<a-upload
					name="avatar"
					list-type="picture-card"
					class="avatar-uploader"
					:show-upload-list="false"
					:before-upload="beforeUpload"
					@change="handleChange"
				>
					<el-image class="avator" v-if="imageUrl" :src="imageUrl" fit="cover"></el-image>
					<div v-else>
						<a-icon :type="loading ? 'loading' : 'plus'" />
						<div class="ant-upload-text">Upload</div>
					</div>
				</a-upload></a-spin
			>
		</a-modal>
	</div>
</template>
<script>
function getBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.readAsDataURL(file)
		reader.onload = () => resolve(reader.result)
		reader.onerror = error => reject(error)
	})
}
import * as nsfwjs from 'nsfwjs'
import { commit, state } from '@/store'
import { message } from 'ant-design-vue'
import { uploadAvator } from '../http/api'
export default {
	props: ['visible'],
	data() {
		return {
			loading: false,
			imageUrl: '',
			avatorFileData: '',
			spinning: false,
		}
	},
	computed: {
		updateVisible: function () {
			return this.visible
		},
		userInfo: () => state.userInfo,
	},

	methods: {
		async handleOk() {
			if (!this.avatorFileData) {
				message.warning('请上传图片')
				return false
			}
			this.spinning = true
			const imageNormal = await this.checkImage()
			if (!imageNormal) {
				message.warning('您上传的图片可能含有不雅信息，请重新上传')
				this.spinning = false
				return false
			}
			let result = await uploadAvator({
				user_id: this.userInfo.id,
				username: this.userInfo.username,
				avatorFile: this.avatorFileData,
			})

			if (result.data.code === 200) {
				message.success('上传成功')
				let newUserInfo = {
					...this.userInfo,
					avator: result.data.url,
				}
				commit('userInfo', newUserInfo)
				localStorage.setItem('USER_INFO', JSON.stringify(newUserInfo))
				this.handleCancel()
			} else {
				message.error(result.data.message)
			}
			this.spinning = false
		},
		handleCancel() {
			this.avatorFileData = ''
			this.imageUrl = ''
			this.$emit('close')
		},
		handleChange({ file }) {
			if (!['image/jpeg', 'image/png'].includes(file.type)) {
				this.$message.error('仅支持图片类型文件')
				return false
			}

			this.loading = true
			getBase64(file)
				.then(res => {
					this.imageUrl = res
					this.loading = false
					this.avatorFileData = res
				})
				.catch(() => {
					this.loading = false
				})
		},
		beforeUpload() {
			return false
		},
		checkImage() {
			return new Promise((resolve, reject) => {
				const img = new Image()
				img.crossOrigin = 'anonymous'
				img.src = this.imageUrl

				img.onload = async function () {
					const model = await nsfwjs.load()

					const predictions = await model.classify(img)
					console.log('Predictions: ', predictions)
					let normal = true

					// 检测图片是否涉黄
					if (predictions && predictions.length) {
						for (const indicator of predictions) {
							if (
								['Porn', 'Hentai', 'Sexy'].includes(indicator.className) &&
								indicator.probability >= 0.5
							) {
								normal = false
							}
						}
					}

					resolve(normal)
				}

				img.onerror = function () {
					reject(false)
				}
			})
		},
	},
}
</script>
<style>
.avatar-uploader > .ant-upload {
	width: 128px;
	height: 128px;
}
.ant-upload-select-picture-card i {
	font-size: 32px;
	color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
	margin-top: 8px;
	color: #666;
}

.avator {
	width: 200px;
	height: 200px;
}
</style>
