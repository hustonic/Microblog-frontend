<template>
    <div style="width: 920px; margin: auto;">
        <!-- 用户信息 -->
        <el-card>
            <div class="center" style="cursor: pointer" @click="avatarDialogVisible=true">
                <el-avatar v-if="user.resUrl" :src="user.resUrl" :size="100" fit="fill"/>
                <el-avatar v-else icon="el-icon-user-solid" :size="100"/>
            </div>
            <el-dialog :visible.sync="avatarDialogVisible" :modal-append-to-body="false" fullscreen>
                <img width="100%" :src="user.resUrl" alt="">
            </el-dialog>

            <div class="center">
                <span>{{user.userName}}</span>
                <div :class="sexBgClass"><i :class="sexIconClass"/></div>
            </div>
            <div class="center">{{user.userIntro}}</div>
        </el-card>

        <div  style="width: 300px; float: left; margin: 15px 0">
            <!-- 关注数、粉丝数、微博数 -->
            <el-card>
                <el-link :underline="false" class="fans-button">{{followCount}}<br/>关注</el-link>
                <el-divider direction="vertical" class="fans-divider"/>

                <el-link :underline="false" class="fans-button">{{fansCount}}<br/>粉丝</el-link>
                <el-divider direction="vertical" class="fans-divider"/>

                <el-link :underline="false" class="fans-button">{{microblogCount}}<br/>微博</el-link>
            </el-card>

            <!-- 查看详细信息 -->
            <el-card style="margin: 15px 0">
                <div class="user-info">性别：{{user.userSex | userSex}}</div>
                <div class="user-info">年龄：{{user.userBirthday | birthdayToAge}}</div>
                <div class="user-info">生日：{{user.userBirthday | formatBirthday}}</div>
                <div class="user-info">简介：{{user.userIntro}}</div>
                <div class="user-info">注册时间：{{user.userCreTime | formatDate}}</div>
            </el-card>
        </div>

        <!-- 微博列表 -->
        <div style="width: 600px; float: right">
            <div v-infinite-scroll="getMBlogList" :infinite-scroll-disabled="disabled">
                <el-card v-for="mblog in mBlogList" :key="mblog.mblogId" body-style="padding: 0" class="microblog-card">
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
    export default {
        name: "UserPage",
        components: {MicroblogCard},
        props:{
            userId:{
                type: Number
            }
        },
        data(){
            return {
                user: {  //当前页面展示的用户（不一定是当前登陆用户）
                    userId: '',
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
                avatarDialogVisible: false,

                followCount: 0,
                fansCount: 0,
                microblogCount: 0,

                mBlogList:[],
                offset: 0,
                limit: 2,
                loading: false,
                noMore: false
            }
        },
        computed:{
            sexIconClass(){
                let sex=null;
                if(this.user){
                    sex= this.user.userSex;
                }
                return [
                    'white',
                    {
                        'el-icon-male': sex === this.$api.auth.enums.userSex.MALE,
                        'el-icon-female': sex === this.$api.auth.enums.userSex.FEMALE
                    }
                ]
            },
            sexBgClass(){
                let sex=null;
                if(this.user){
                    sex= this.user.userSex;
                }
                return [
                    'sex',
                    {
                        'sex-male': sex === this.$api.auth.enums.userSex.MALE,
                        'sex-female': sex === this.$api.auth.enums.userSex.FEMALE
                    }
                ]
            },
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

                    this.getFollowCount();
                    this.getFansCount();
                    this.getMicroblogCount();
                })
            },
            getFollowCount(){
                this.$api.relation.countRelation({userIdSubscriber: this.user.userId}).then((response)=>{
                    this.followCount=response.data.data;
                })
            },
            getFansCount(){
                this.$api.relation.countRelation({userIdPublisher: this.user.userId}).then((response)=>{
                    this.fansCount=response.data.data;
                })
            },
            getMicroblogCount(){
                this.$api.mblog.countMicroblog({userId: this.user.userId}).then((response)=>{
                    this.microblogCount=response.data.data;
                })
            },
            fetchData(){
                this.mBlogList=[];
                this.offset=0;
                this.getUser();
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
    .center{
        width: fit-content;
        margin-left: auto;
        margin-right: auto;
    }
    .white{
        color: white;
    }
    .sex{
        width: 18px;
        height: 18px;
        margin: auto 5px;
        border-radius: 16px;
        float: right;
    }
    .sex-male{
        background-color: deepskyblue;
    }
    .sex-female{
        background-color: hotpink;
    }
    .microblog-card{
        margin-top: 15px;
        margin-bottom: 15px;
    }
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
    .el-avatar >>> img{
        width: 100%;
        height: 100%;
    }
</style>