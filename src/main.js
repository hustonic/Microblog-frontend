import Vue from 'vue'
import VueRouter from 'vue-router'    //处理页面跳转和路由映射
import ElementUI from 'element-ui'    //引入element-ui
import Axios from "axios"
import App from '@/App.vue'
import router from '@/router'    //导入vue-router配置
import store from '@/store'     //导入vuex集中式存储管理配置
import api from '@/api'
import utils from '@/utils'
import '@/filters'
// import '@/mock'
import 'element-ui/lib/theme-chalk/index.css'    //引入element-ui样式文件
import '@/assets/css/font-awesome.min.css'

Vue.config.productionTip = false;

//把模块从根组件注入到每个子组件
Vue.use(ElementUI);
Vue.use(VueRouter);

//配置Axios
Vue.prototype.$axios = Axios.create({
    timeout: 60000,
    baseURL: api.baseURL
});

//Axios请求拦截器
Vue.prototype.$axios.interceptors.request.use((config) => {
    let token = utils.getToken();
    if (token) {
        config.headers[utils.tokenHeaderName] = utils.tokenType + token;
    }
    return config;
}, (error)=>{
    if(process.env.NODE_ENV !== 'production')
        console.log(error.response);
    return Promise.reject(error);
});

//Axios响应拦截器
Vue.prototype.$axios.interceptors.response.use((response)=>{
    return response;
}, (error)=>{
    if(process.env.NODE_ENV !== 'production')
        console.log(error.response);

    const status=error.response.status;
    if(status === 401){
        api.auth.logout();
    }
    return Promise.reject(error);
});

Vue.prototype.$api=api;
Vue.prototype.$utils=utils;

new Vue({
    el: '#app',
    render: h => h(App),
    router,
    store
});

