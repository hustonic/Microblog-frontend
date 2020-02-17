import {
    Login, Signup, Forget, ForgetEmail, ForgetPhone,
    Microblog, MicroblogHome, MicroblogAll, MicroblogUserPage, MicroblogUserSetting, MicroblogChangePassword, MicroblogRelation, MicroblogVerification,
    Admin, AdminVerification
} from '../views';
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
                }else if(path==='/all'){
                    activeIndex='2'
                } else if(path==='/user-page'){
                    activeIndex='3'
                }else if(path==='/relation'){
                    activeIndex='4'
                }else if(path==='/user-setting'){
                    activeIndex='5-1'
                }else if(path==='/verification'){
                    activeIndex='5-2'
                }else if(path==='/admin'){
                    activeIndex='5-3'
                }else if(path==='/change-password'){
                    activeIndex='5-4'
                }
                return {activeIndex}
            }, children: [
                {path: '', component: MicroblogHome},
                {path: 'home', component: MicroblogHome},
                {path: 'all', component: MicroblogAll},
                {path: 'user-page', component: MicroblogUserPage},
                {path: 'user-page/:userId', component: MicroblogUserPage, props: (route)=>({userId: parseInt(route.params.userId)})},
                {path: 'relation', component: MicroblogRelation, props:(route)=>({
                        follow: route.query.follow,
                        fans: route.query.fans
                    })},
                {path: 'relation/:userId', component: MicroblogRelation, props: (route)=>({
                        userId: parseInt(route.params.userId),
                        follow: route.query.follow,
                        fans: route.query.fans
                    })},
                {path: 'user-setting', component: MicroblogUserSetting},
                {path: 'verification', component: MicroblogVerification},
                {path: 'admin', component: Admin, children: [
                        {path: '', component: AdminVerification},
                        {path: 'verification', component: AdminVerification}
                    ]},
                {path: 'change-password', component: MicroblogChangePassword}
            ]
        }
    ]
});