import Vue from 'vue';
import store from '../store';
import router from '../router';


const baseURL= 'http://114.116.240.155:8080';

const auth = {
    prefix: '/microblog-auth',
    enums: {
        validationType: {
            USER_REGISTRATION_VALIDATE_EMAIL: 0,
            USER_REGISTRATION_VALIDATE_PHONE: 1,
            UPDATE_USER_PHONE: 2,
            UPDATE_USER_EMAIL: 3,
            FIND_PASSWORD_BY_EMAIL: 4,
            FIND_PASSWORD_BY_PHONE: 5
        },
        userSex: {
            MALE: 0, //男
            FEMALE: 1  //女
        }
    },

    login(data) {
        const params=new URLSearchParams();
        params.append('username', data.username);
        params.append('password', data.password);
        params.append('grant_type', 'password');
        return Vue.prototype.$axios.post(this.prefix + '/oauth/token', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            auth: {
                username: 'web',
                password: 'secret'
            }
        });
    },

    logout(){
        store.commit('setToken', null);
        store.commit('setUserId', null);
        store.commit('setUser', null);
        window.localStorage.clear();
        router.push('/login');
    },

    signup(data){
      return Vue.prototype.$axios.post(this.prefix+'/users', data);
    },

    sendValidationCode(data){
        const params = new URLSearchParams();
        if(data.email) params.append('email', data.email);
        if(data.phone) params.append('phone', data.phone);
        params.append('validationType', data.validationType.toString());
        return Vue.prototype.$axios.post(this.prefix + '/validation-codes' + `?${params}`);
    },
    sendValidationCodeToUserPhoneForUpdate(){
        return Vue.prototype.$axios.post(this.prefix + '/user/phone/validation-code');
    },
    sendValidationCodeToUserEmailForUpdate(){
        return Vue.prototype.$axios.post(this.prefix + '/user/email/validation-code');
    },
    updateUserPhone(data){
        return Vue.prototype.$axios.put(this.prefix + '/user/phone', data);
    },
    updateUserEmail(data){
        return Vue.prototype.$axios.put(this.prefix + '/user/email', data);
    },

    findPassword(data){
        return Vue.prototype.$axios.put(this.prefix + '/passwords', data);
    },

    getCurrentUser(){
        return Vue.prototype.$axios.get(this.prefix + '/user');
    },

    getUser(data){
        return Vue.prototype.$axios.get(this.prefix + `/users/${data.userId}`);
    },

    updateUser(data){
        return Vue.prototype.$axios.patch(this.prefix + '/user', data);
    }
};

const comment = {
    prefix: 'microblog-comment',

    addComment(data){
        return Vue.prototype.$axios.post(this.prefix + '/comments', data)
    },
    deleteComment(data){
        return Vue.prototype.$axios.delete(this.prefix + `/comments/${data.commId}`)
    },
    listComment(data){
        const param=new URLSearchParams();
        param.append('mblogId', data.mblogId);
        if(data.commIdParent)
            param.append('commIdParent', data.commIdParent);
        param.append('offset', data.offset);
        param.append('limit', data.limit);
        return Vue.prototype.$axios.get(this.prefix + `/comments?${param}`)
    },
    countComment(data){
        const param = new URLSearchParams();
        param.append('mblogId', data.mblogId);
        if(data.commId)
            param.append('commId', data.commId);
        if(data.commIdShouldNull)
            param.append('commIdShouldNull', data.commIdShouldNull);
        return Vue.prototype.$axios.get(this.prefix + `/comment-counts?${param}`)
    },

    deleteAgreeComment(data){
        return Vue.prototype.$axios.delete(this.prefix + `/agreements/${data.agreeId}`)
    },
    addAgreeComment(data){
        return Vue.prototype.$axios.post(this.prefix + '/agreements', data.commId, {
            headers:{
                "Content-Type" : "application/json"
            }
        })
    },
    listAgreeComment(data){
        const param = new URLSearchParams();
        param.append('userId', data.userId);
        param.append('commId', data.commId);
        param.append('offset', data.offset);
        param.append('limit', data.limit);
        return Vue.prototype.$axios.get(this.prefix + `/agreements?${param}`)
    },
    countAgree(data){
        return Vue.prototype.$axios.get(this.prefix + `/agree-counts/${data.commId}`)
    }
};

const mblog = {
    prefix: '/microblog-mblog',
    enums: {
        microblogType: {
            TEXT: 0,
            PICTURE: 1,
            VIDEO: 2,
            FORWARD: 3
        },
        timelineType: {
            MICROBLOG_FOLLOW: 0,
            MICROBLOG_ME: 1
        }
    },

    addMicroblog(data){
        return Vue.prototype.$axios.post(this.prefix + '/microblogs', data);
    },
    listMicroblog(data){
        const param = new URLSearchParams();
        param.append('timelineType', data.timelineType);
        param.append('userId', data.userId);
        param.append('offset', data.offset);
        param.append('limit', data.limit);
        return Vue.prototype.$axios.get(this.prefix + '/microblogs' + `?${param}`);
    },
    updateMicroblog(data){
        return Vue.prototype.$axios.patch(this.prefix + `/microblogs/${data.mblogId}`, {mblogText: data.mblogText});
    },
    deleteMicroblog(data){
        return Vue.prototype.$axios.delete(this.prefix + `/microblogs/${data.mblogId}`);
    },
    countMicroblog(data){
        return Vue.prototype.$axios.get(this.prefix + `/microblog-counts/${data.userId}`);
    },
    getForwardCount(data){
        return Vue.prototype.$axios.get(this.prefix + `/forward-counts/${data.mblogId}`);
    },

    getCollect(data){
        return Vue.prototype.$axios.get(this.prefix + `/collections/${data.mblogId}`);
    },
    deleteCollect(data){
        return Vue.prototype.$axios.delete(this.prefix + `/collections/${data.collectId}`);
    },
    addCollect(data){
        return Vue.prototype.$axios.post(this.prefix + '/collections', data.mblogId, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },

    listAgree(data){
        const param = new URLSearchParams();
        param.append('userId', data.userId);
        param.append('mblogId', data.mblogId);
        param.append('offset', data.offset);
        param.append('limit', data.limit);
        return Vue.prototype.$axios.get(this.prefix + '/agreements' + `?${param}`);
    },
    countAgree(data){
        return Vue.prototype.$axios.get(this.prefix + `/agree-counts/${data.mblogId}`);
    },
    insertAgree(data){
        return Vue.prototype.$axios.post(this.prefix + '/agreements', data.mblogId, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },
    deleteAgree(data){
        return Vue.prototype.$axios.delete(this.prefix + `/agreements/${data.agreeId}`);
    }
};

const relation = {
    prefix: '/microblog-relation',

    countRelation(data){
        let param = new URLSearchParams();
        if(data.userIdSubscriber) param.append('userIdSubscriber', data.userIdSubscriber);
        if(data.userIdPublisher) param.append('userIdPublisher', data.userIdPublisher);
        return Vue.prototype.$axios.get(this.prefix + '/relation-counts'+`?${param}`);
    }
};

const resource = {
    prefix: '/microblog-resource',
    enums:{
        resourceUsage: {
            MICROBLOG: 0,
            COMMENT: 1,
            HEAD_PICTURE: 2,
            MESSAGE: 3,
            VERIFICATION: 4
        }
    },

    getUploadUrl(){
        return baseURL + '/zuul' + this.prefix + '/upload';
    },

    upload(data){
        const form = new FormData();
        form.append("resUsage", data.resUsage);
        form.append("file", data.file);  //this.$refs.input.files[0]
        return Vue.prototype.$axios.post(this.getUploadUrl(), form, {
            headers: {"Content-Type":"multipart/form-data"}
        });
    },
    getResUrl(data){
        return Vue.prototype.$axios.get(this.prefix + `/resources/${data.resId}/url`)
    }
};

export default{
    baseURL,
    auth, comment, mblog, relation, resource
};