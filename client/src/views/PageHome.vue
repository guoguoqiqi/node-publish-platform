<template>
	<div class="page-container">
		<a-layout>
			<a-layout-header>
				<InlineLogin v-if="!token" @showRegister="handleShowRegisterMoal" />
				<div class="header-user" v-else>
					<img
						class="user-avator"
						:src="
							urlPrefix +
							(userInfo.avator
								? '/images/' + userInfo.id + userInfo.username + '.png'
								: '/images/1.png')
						"
						alt=""
						@click="handleAvatorClick"
					/>
					<span class="user-name">{{ userInfo.username }}</span>
					<a-button type="link" @click="handleLoginOut"> 退出登录 </a-button>
				</div>
			</a-layout-header>
			<a-layout-content>
				<div class="content-body">
					<div v-for="post in postList" :key="post.blog_id">
						<div class="post-item">
							<div class="post-l">
								<el-image class="avator" :src="urlPrefix + post.avatorurl" fit="cover"></el-image>
							</div>
							<div class="post-r">
								<div class="title">
									<span>{{ post.blog_title }}</span>
								</div>
								<div class="content">{{ post.blog_content }}</div>
								<div class="date">{{ post.createdate }}</div>
								<div class="photos">
									<el-image
										v-for="(photo, index) in post.photos"
										:key="index"
										:src="urlPrefix + photo"
										:preview-src-list="previewSrcList"
										fit="cover"
										@click="previewImageClick(post.photos, index)"
									></el-image>
								</div>
								<div class="comment-input">
									<a-input
										v-model="post.commentValue"
										@focus="handleCommentFocus(post)"
										placeholder="评论"
										allowClear
									/>
									<a-button
										type="primary"
										:disabled="!post.isEditComment"
										@click="submitComment(post)"
									>
										发送
									</a-button>
								</div>
								<div class="comment-list">
									<div
										class="comment-item"
										v-for="comment in post.comments"
										:key="comment.comment_id"
									>
										<span class="comment-user">{{ comment.username }}：</span>
										<span class="comment-value">{{ comment.content }} </span>
										<p>
											<span style="margin-left: 10px; font-size: 11px">{{
												comment.createdate
											}}</span>
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</a-layout-content>
		</a-layout>
		<el-backtop target=".ant-layout-content"> </el-backtop>
		<a-icon class="add-post" type="form" @click="handleOpenAddModel" />
		<a-icon class="upload-avator" type="user" @click="handleAvatorClick" />
		<AddPostModal :visible.sync="addPostVisible" @close="handleCloseModal" />
		<UserRegister :visible.sync="registerVisible" @close="closeRegisterModal" />
		<UploadAvator :visible.sync="uploadAvatorVisible" @close="closeAvatorModal" />
	</div>
</template>
<script>
const urlPrefix =
	process.env.NODE_ENV === 'development' ? 'http://localhost:4001' : 'http://106.55.228.251:4001'
import { getAllPosts, commentPost } from '../http/api'
import InlineLogin from '../components/InlineLogin.vue'
import AddPostModal from '../components/AddPostModal.vue'
import UserRegister from '../components/UserRegister.vue'
import UploadAvator from '../components/UploadAvator.vue'
import { message } from 'ant-design-vue'
import { commit, state } from '@/store'
export default {
	name: 'PageHome',
	components: {
		InlineLogin,
		AddPostModal,
		UserRegister,
		UploadAvator,
	},
	data() {
		return {
			addPostVisible: false,
			registerVisible: false,
			uploadAvatorVisible: false,
			postList: [],
			pageIndex: 1,
			urlPrefix,
			previewSrcList: [],
		}
	},
	computed: {
		token: () => state.token,
		userInfo: () => state.userInfo,
	},
	created() {
		this.getPostList()
	},
	methods: {
		handleOpenAddModel() {
			if (this.token && this.userInfo) {
				this.addPostVisible = true
			} else {
				message.warning('请先登录')
			}
		},
		handleCloseModal() {
			this.addPostVisible = false
			this.getPostList()
		},
		closeRegisterModal() {
			this.registerVisible = false
		},
		closeAvatorModal() {
			this.uploadAvatorVisible = false
			this.getPostList()
		},
		handleShowRegisterMoal() {
			this.registerVisible = true
		},
		handleAvatorClick() {
			if (this.token && this.userInfo) {
				this.uploadAvatorVisible = true
			} else {
				message.warning('请先登录')
			}
		},
		async getPostList() {
			let result = await getAllPosts({ page: this.pageIndex })

			if (result.code === 200) {
				this.postList = result.data.result.map(post => ({
					...post,
					isEditComment: false,
					commentValue: '',
					avatorurl: post.avatorurl ? post.avatorurl : '/images/1.png',
				}))
			} else {
				this.$message.error('服务异常')
			}

			console.log(result, 'result')
		},
		previewImageClick(list, index) {
			this.previewSrcList = list.map(url => urlPrefix + url)
			console.log(index)
		},
		handleCommentFocus(post) {
			this.postList.forEach(item => {
				item.isEditComment = false
			})

			post.isEditComment = true
		},
		async submitComment(post) {
			if (!this.token || !this.userInfo) {
				message.warning('请先登录')
				return false
			}

			if (!post.commentValue) {
				message.warning('评论内容为空')
				return false
			}

			let result = await commentPost({
				blog_id: post.blog_id,
				user_id: this.userInfo.id,
				content: post.commentValue,
			})

			if (result.code === 200) {
				message.success('评论成功')
				this.getPostList()
			} else {
				message.error('服务异常')
			}
		},
		handleLoginOut() {
			this.$confirm({
				title: '确认操作',
				content: '退出登录后将无法发表图文，是否要退出登录?',
				okText: '确认',
				cancelText: '取消',
				onOk() {
					localStorage.clear()
					commit('token', '')
					commit('userInfo', null)
				},
				onCancel() {},
			})
		},
	},
}
</script>

<style>
.page-container {
	width: 100vw;
	height: 100vh;
	overflow: hidden;
}

.add-post {
	position: fixed;
	right: 50px;
	top: 80px;
	font-size: 30px;
	color: #40a9ff;
	cursor: pointer;
}

.upload-avator {
	position: fixed;
	right: 50px;
	top: 150px;
	font-size: 30px;
	color: #40a9ff;
	cursor: pointer;
}

.ant-layout {
	width: 100%;
	height: 100%;
}

.ant-layout-header {
	padding: 0 15px;
	display: flex;
	align-items: center;
	justify-content: flex-end;
}

.header-user {
	display: flex;
	padding-right: 20px;
	justify-content: flex-end;
	align-items: center;
}

.header-user .user-avator {
	width: 30px;
	height: 30px;
	display: inline-block;
	border-radius: 30px;
	cursor: pointer;
}

.header-user .user-name {
	color: #fff;
	margin: 0 10px;
}

.header-user .ant-btn {
	font-size: 12px;
}

.ant-layout-content {
	flex: 1;
	overflow: auto;
}

.content-body {
	width: 1000px;
	padding: 10px;
	margin: 0 auto;
	min-height: 100%;
	background-color: #fff;
	border: 1px solid #eee;
}

.post-item {
	padding: 5px;
	display: flex;
	justify-content: space-between;
}

.post-item .post-l {
	width: 50px;
}

.post-l .avator {
	width: 50px;
	height: 50px;
	display: inline-block;
}

.post-item .post-r {
	flex: 1;
	padding-left: 10px;
}

.post-r .title {
	height: 50px;
	line-height: 50px;
	font-weight: bold;
	font-size: 16px;
}

.post-r .date {
	font-size: 13px;
	font-weight: lighter;
	color: #a4a0a0;
	margin: 10px 0;
}

.post-r .photos .el-image {
	width: 120px;
	height: 120px;
	margin: 5px 5px 0 0;
}

.post-r .comment-input {
	margin: 5px 0;
	display: flex;
	justify-content: space-between;
}

.comment-input .ant-btn {
	margin-left: 20px;
}

.post-r .comment-list {
	padding: 5px 0;
}

.comment-list .comment-item {
	margin: 5px 0;
	font-size: 12px;
	color: gray;
	padding-left: 5px;
}
.comment-item .comment-user {
	margin-left: 10px;
}
.comment-item .comment-value {
}
</style>
