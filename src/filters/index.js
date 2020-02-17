import Vue from 'vue'
import dayjs from "dayjs"
import api from "@/api"


const datePattern='YYYY-MM-DDTHH:mm:ss.SSSZZ';

//把后端传来的时间字符串转化成友好的时间格式
Vue.filter('formatDate', function(time){
    if(!time)
        return '';
    let date = dayjs(time, datePattern);
    let current = dayjs();
    let diffMinute = current.diff(date, 'minute');
    if(diffMinute < 60){
        return diffMinute+'分钟前'
    }else if(current.date()===date.date()&&current.month()===date.month()&&current.year()===date.year()){
        return '今天 ' + date.format('HH:mm');
    }else{
        return date.format('YYYY-MM-DD HH:mm');
    }
});

Vue.filter('birthdayToAge', function(birthday){
    let date = dayjs(birthday, datePattern);
    let current = dayjs();
    let diffYear = current.diff(date, 'year');
    if(diffYear>=0){
        return diffYear+'岁';
    }else{
        return '';
    }
});

Vue.filter('formatBirthday', function(birthday){
    if(!birthday)
        return '';
    let date = dayjs(birthday, datePattern);
    return date.format('YYYY-MM-DD');
});

Vue.filter('userSex', function(sex){
    const userSexEnum=api.auth.enums.userSex;
    let sexStr='';
    switch (sex) {
        case userSexEnum.MALE:
            sexStr='男';
            break;
        case userSexEnum.FEMALE:
            sexStr='女';
            break;
        default:
            sexStr='';
    }
    return sexStr;
});

Vue.filter('verTypeText',function(value){
    let verificationType = api.verification.enums.verificationType;
    switch (value) {
        case verificationType.PERSON:
            return '身份认证';
        case verificationType.INTEREST:
            return '兴趣认证';
        case verificationType.ORGANIZATION:
            return '组织认证';
        default:
            return '';
    }
});

Vue.filter('verStateText',function(value){
    let verificationState = api.verification.enums.verificationState;
    switch (value) {
        case verificationState.VERIFYING:
            return '待审核';
        case verificationState.FAILED:
            return '认证失败';
        case verificationState.CONFIRMING:
            return '审核通过，待用户确认';
        case verificationState.FINISHED:
            return '认证成功';
        default:
            return '';
    }
});