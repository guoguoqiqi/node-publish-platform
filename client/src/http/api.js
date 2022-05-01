import { post, get } from './index'

// 上传文件
export const uploadImage = data => {
	return post('/upload_image', data)
}

// 发表图文
export const submitPost = params => {
	return get('/add_blog', params)
}

// 获取图文列表
export const getAllPosts = params => {
	return get('/get_all_blogs', params)
}

// 评论图文
export const commentPost = params => {
	return get('/comment_blog', params)
}

// 登录接口
export const userLogin = params => {
	return get('/login', params)
}

// 注册接口
export const userRegister = data => {
	return post('/reg', data)
}

// 上传头像
export const uploadAvator = params => {
	return post('/upload_avator', params)
}

// 查询头像
export const getAvator = params => {
	return get('/get_avator', params)
}
