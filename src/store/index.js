import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);  //创建store实例前必须先执行此语句

export default new Vuex.Store({
    state:{
        token: window.localStorage.getItem('token'),
        userId: window.localStorage.getItem('userId'),
        user: JSON.parse(window.localStorage.getItem('user'))
    },
    mutations:{
        setToken(state, token){
            state.token = token;
            window.localStorage.setItem('token', token);
        },
        setUserId(state, userId){
            state.userId = userId;
            window.localStorage.setItem('userId', userId);
        },
        setUser(state, user){
            state.user=user;
            let userStr=JSON.stringify(user);
            window.localStorage.setItem('user', userStr);
        }
    }
});