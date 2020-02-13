import {Login, Signup, Forget, ForgetEmail, ForgetPhone, Microblog, MicroblogHome, MicroblogUserPage, MicroblogUserSetting,
        ChangePassword} from '../views';
import VueRouter from 'vue-router';

export default new VueRouter({
    mode: 'history',
    routes: [
        {path:'/_empty'},
        {path: '/login', component: Login},
        {path: '/signup', component: Signup},
        {
            path: '/forget', component: Forget, children: [
                {path: '', component: ForgetEmail},
                {path: 'email', component: ForgetEmail},
                {path: 'phone', component: ForgetPhone}
            ]
        },
        {
            path: '/', component: Microblog, props: (route)=>{
                let path=route.path;
                let activeIndex='0';
                if(path==='/home'||path==='/'){
                    activeIndex='1'
                } else if(path==='/user-page'){
                    activeIndex='2'
                }else if(path==='/user-setting'){
                    activeIndex='3-1'
                }
                return {activeIndex}
            }, children: [
                {path: '', component: MicroblogHome},
                {path: 'home', component: MicroblogHome},
                {path: 'user-page', component: MicroblogUserPage},
                {path: 'user-page/:userId', component: MicroblogUserPage, props: (route)=>({userId: parseInt(route.params.userId)})},
                {path: 'user-setting', component: MicroblogUserSetting},
                {path: 'change-password', component: ChangePassword}
            ]
        }
    ]
});