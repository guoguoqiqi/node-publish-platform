const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
	transpileDependencies: true,
	productionSourceMap: false,
	configureWebpack: {
		externals: {
			nsfwjs: 'nsfwjs',
		},
	},
})
