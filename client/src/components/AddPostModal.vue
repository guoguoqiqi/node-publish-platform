<template>
	<div>
		<a-modal
			v-model="updateVisible"
			title="新建图文"
			okText="发表"
			cancelText="取消"
			destroyOnClose
			:width="1000"
			:maskClosable="false"
			:ok-button-props="{ props: { disabled: false } }"
			:cancel-button-props="{ props: { disabled: false } }"
			@ok="handleOk"
			@cancel="handleCancel"
		>
			<a-spin :spinning="spinning">
				<a-form :form="form" :wrapper-col="{ span: 24 }" @submit="handleSubmit">
					<a-form-item label="标题">
						<a-input
							v-decorator="['title', { rules: [{ required: true, message: '请输入标题' }] }]"
							v-model="title"
							:maxLength="50"
						/>
					</a-form-item>
					<a-form-item label="内容">
						<a-textarea
							v-decorator="['content', { rules: [{ required: true, message: '请输入内容' }] }]"
							v-model="content"
							:autosize="{ minRows: 6, maxRows: 15 }"
							:maxLength="1000"
						/>
					</a-form-item>
					<a-form-item label="图片">
						<a-upload
							list-type="picture-card"
							:file-list="fileList"
							:before-upload="beforeUpload"
							@preview="handlePreview"
							@change="handleChange"
						>
							<div v-if="fileList.length < 8">
								<a-icon type="plus" />
								<div class="ant-upload-text">上传</div>
							</div>
						</a-upload>
						<a-modal :visible="previewVisible" :footer="null" @cancel="previewVisible = false">
							<img alt="example" style="width: 100%" :src="previewImage" />
						</a-modal>
					</a-form-item> </a-form
			></a-spin>
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

function upload(http, fileData) {
	return new Promise((resolve, reject) => {
		http({ fileData })
			.then(res => {
				resolve(res.data.url)
			})
			.catch(err => {
				reject(err)
			})
	})
}
import * as nsfwjs from 'nsfwjs'
import { state } from '@/store'
import { message } from 'ant-design-vue'
import { uploadImage, submitPost } from '../http/api'
export default {
	props: ['visible'],
	data() {
		return {
			form: this.$form.createForm(this, { name: 'rule' }),
			previewVisible: false,
			spinning: false,
			previewImage: '',
			title: '',
			content: '',
			fileList: [],
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
			if (!this.title) {
				message.warning('请输入标题')
				return false
			}

			if (!this.content) {
				message.warning('请输入内容')
				return false
			}
			const base64Arr = []
			const uploadArr = []
			const imageNormalArr = []

			this.fileList.forEach(file => {
				base64Arr.push(getBase64(file.originFileObj))
			})

			this.spinning = true
			Promise.all(base64Arr)
				.then(res => {
					res.forEach(data => {
						imageNormalArr.push(this.checkImage(data))
					})

					Promise.all(imageNormalArr)
						.then(checkres => {
							console.log(checkres, '图片检测结果')
							res.forEach(data => {
								uploadArr.push(upload(uploadImage, data))
							})

							Promise.all(uploadArr).then(uploadRes => {
								submitPost({
									blog_title: this.title,
									blog_content: this.content,
									photos: JSON.stringify(uploadRes),
									user_id: this.userInfo.id,
									video: '',
								})
									.then(submitRes => {
										if (submitRes.code === 200) {
											this.$message.success('发表成功')
											this.handleCancel()
										} else {
											this.$message.error(submitRes.message)
										}
									})
									.finally(() => (this.spinning = false))
							})
						})
						.catch(() => {
							message.warning('您上传的图片可能含有不雅信息，请重新上传')
							this.spinning = false
						})
				})
				.catch(() => (this.spinning = false))
		},
		handleCancel() {
			this.fileList = []
			this.$emit('close')
		},
		async handlePreview(file) {
			if (!file.url && !file.preview) {
				file.preview = await getBase64(file.originFileObj)
			}
			this.previewImage = file.url || file.preview
			this.previewVisible = true
		},
		handleChange({ file, fileList }) {
			if (!['image/jpeg', 'image/png'].includes(file.type)) {
				this.$message.error('仅支持图片类型文件')
				return false
			}
			this.fileList = fileList
		},
		beforeUpload() {
			return false
		},
		checkImage(base64Data) {
			return new Promise((resolve, reject) => {
				const img = new Image()
				img.crossOrigin = 'anonymous'
				img.src = base64Data
				img.onload = async function () {
					const model = await nsfwjs.load()
					const predictions = await model.classify(img)
					// 检测图片是否涉黄
					if (predictions && predictions.length) {
						for (const indicator of predictions) {
							if (
								['Porn', 'Hentai', 'Sexy'].includes(indicator.className) &&
								indicator.probability >= 0.5
							) {
								reject(false)
							}
						}
					}
					resolve(true)
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
.ant-upload-select-picture-card i {
	font-size: 32px;
	color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
	margin-top: 8px;
	color: #666;
}
</style>
