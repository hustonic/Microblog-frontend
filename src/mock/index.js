import Mock from 'mockjs'
import api from '@/api'


const baseUrl = api.baseURL;
const auth='/microblog-auth';

function mock(rurl, rtype, template) {
    return Mock.mock(baseUrl+rurl, rtype, template);
}

mock(auth+'/user', 'get', {
    success: true,
    data: {
        'userId': 10028,
        'userName': 'Huston',
        'userNameSetTime': '2020-01-04 03:18:39',
        'userNameUpdateTimes': 0,
        'userEmail': '111***@qq.com',
        'userPhone': '',
        'userSex': 0,
        'userBirthday': '',
        'userIntro': '简介',
        'resId': '',
        'resUrl': '',
        'userCreTime': '2020-01-04 03:18:39'
    },
    message: ''
});