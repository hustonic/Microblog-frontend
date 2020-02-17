<template>
    <div style="width: 920px; margin: auto;">
        <!-- 用户信息 -->
        <el-card><user-info :user="user" :custom-verification="verification"/></el-card>

        <div style="width: 300px; float: left;margin: 15px 0">
            <!-- 关注数、粉丝数、微博数 -->
            <el-card>
                <el-link :underline="false" class="fans-button" @click="toFollow">{{followCount}}<br/>关注</el-link>
                <el-divider direction="vertical" class="fans-divider"/>

                <el-link :underline="false" class="fans-button" @click="toFans">{{fansCount}}<br/>粉丝</el-link>
                <el-divider direction="vertical" class="fans-divider"/>

                <el-link :underline="false" class="fans-button">{{microblogCount}}<br/>微博</el-link>
            </el-card>

            <!-- 查看详细信息 -->
            <el-card style="margin: 15px 0">
                <div v-if="verification">
                    <div class="user-info"><verification-sign :custom-verification="verification" complex/></div>
                    <div class="user-info">{{verification.verDesc}}</div>
                    <div class="user-info">认证时间：{{verification.verTime | formatDate}}</div>
                    <el-divider/>
                </div>
                <div class="user-info">简介：{{user.userIntro}}</div>
                <div class="user-info">性别：{{user.userSex | userSex}}</div>
                <div class="user-info">年龄：{{user.userBirthday | birthdayToAge}}</div>
                <div class="user-info">生日：{{user.userBirthday | formatBirthday}}</div>
                <div class="user-info">注册时间：{{user.userCreTime | formatDate}}</div>
            </el-card>
        </div>

        <!-- 微博列表 -->
        <div style="width: 600px; float: right">
            <div v-infinite-scroll="getMBlogList" :infinite-scroll-disabled="disabled">
                <el-card v-for="mblog in mBlogList" :key="mblog.mblogId" body-style="padding: 0;" style="margin: 15px 0">
                    <microblog-card :mblog="mblog" :custom-user="user" :on-delete="onMblogDelete"/>
                </el-card>
            </div>
            <div class="center-text">
                <p v-if="loading">加载中...</p>
                <p v-if="noMore">没有更多了</p>
                <el-button v-if="!loading&&!noMore" type="text" @click="getMBlogList">查看更多...</el-button>
            </div>
        </div>
    </div>
</template>

<script>
    import MicroblogCard from "@/components/MicroblogCard";
    import UserInfo from "@/components/UserInfo";
    import VerificationSign from "@/components/VerificationSign";

    export default {
        name: "UserPage",
        components:{VerificationSign, UserInfo, MicroblogCard},
        props:{
            userId:{
                type: Number
            }
        },
        data(){
            return {
                user: {  //当前页面展示的用户（不一定是当前登陆用户）
                    userId: 0,
                    userName: '',
                    userNameSetTime: '',
                    userNameUpdateTimes: '',
                    userEmail: '',
                    userPhone: '',
                    userSex: '',
                    userBirthday: '',
                    userIntro: '',
                    resId: '',
                    resUrl: '',
                    userCreTime: ''
                },

                followCount: 0,
                fansCount: 0,
                microblogCount: 0,
                verification: null,

                mBlogList:[],
                offset: 0,
                limit: 2,
                loading: false,
                noMore: false
            }
        },
        computed:{
            disabled () {
                return this.loading || this.noMore;
            }
        },
        methods: {
            onMblogDelete(mblog){
                let index=this.mBlogList.indexOf(mblog);
                if(index>=0){
                    this.mBlogList.splice(index,1);
                }
            },

            toFollow(){
                let path=`/relation/${this.user.userId}?follow=`;
                let current=this.$route.fullPath;
                if(path!==current)
                    this.$router.push(path)
            },
            toFans(){
                let path=`/relation/${this.user.userId}?fans=`;
                let current=this.$route.fullPath;
                if(path!==current)
                    this.$router.push(path)
            },
            getMBlogList(){
                this.loading=true;
                let userId = this.userId;
                if(!userId){
                    userId = this.$store.state.userId;
                }
                if (!userId) {
                    this.$api.auth.getCurrentUser()
                    .then((response) => {
                        userId = response.data.data.userId;
                        this.getMBlogListByUserId(userId);
                    })
                    .catch(()=>{
                        this.loading=false;
                    })
                }else{
                    this.getMBlogListByUserId(userId);
                }
            },
            getMBlogListByUserId(userId){
                this.$api.mblog.listMicroblog({
                    timelineType: this.$api.mblog.enums.timelineType.MICROBLOG_ME,
                    userId: userId,
                    offset: this.offset,
                    limit: this.limit
                }).then((response)=>{
                    let length = response.data.data.length;
                    if(length!==0){
                        this.mBlogList.push(...response.data.data);  //扩展运算符（...），将一个数组转为用逗号分隔的参数列表。
                        //this.mBlogList.push.apply(this.mBlogList, response.data.data);  //也可以写成这样
                        this.offset+=length;
                    }
                    if(length===0 || length<this.limit){
                        this.noMore = true;
                    }
                }).catch(()=>{
                    this.noMore=true;
                }).finally(()=>{
                    this.loading=false;
                })
            },
            getUser(){
                let res;
                if(this.userId){
                    res = this.$api.auth.getUser({userId: this.userId})
                }else{
                    res = this.$api.auth.getCurrentUser()
                }
                res.then((response) => {
                    this.user = response.data.data;
                })
            },
            getFollowCount(){
                let userId = this.userId? this.userId : this.$store.state.user.userId;
                this.$api.relation.countRelation({userIdSubscriber: userId}).then((response)=>{
                    this.followCount=response.data.data;
                })
            },
            getFansCount(){
                let userId = this.userId? this.userId : this.$store.state.user.userId;
                this.$api.relation.countRelation({userIdPublisher: userId}).then((response)=>{
                    this.fansCount=response.data.data;
                })
            },
            getMicroblogCount(){
                let userId = this.userId? this.userId : this.$store.state.user.userId;
                this.$api.mblog.countMicroblog({userId: userId}).then((response)=>{
                    this.microblogCount=response.data.data;
                })
            },
            getVerification() {
                let userId = this.userId? this.userId : this.$store.state.user.userId;
                if(userId){
                    this.$api.verification.getVerification({userId: userId}).then((response) => {
                        this.verification = response.data.data;
                    })
                }
            },
            fetchData(){
                this.mBlogList=[];
                this.offset=0;
                this.getUser();
                this.getFollowCount();
                this.getFansCount();
                this.getMicroblogCount();
                this.getVerification();
                this.getMBlogList();
            }
        },
        created(){
            this.fetchData();
        },
        watch:{
            '$route': 'fetchData'
        }
    }
</script>

<style scoped>
    .center-text{
        width: fit-content;
        margin: 0 auto;
    }
    .user-info{
        margin: 10px 0;
    }
    .fans-divider{
        height: 2em;
    }
    .fans-button{
        width: 28.943%;
    }
</style>