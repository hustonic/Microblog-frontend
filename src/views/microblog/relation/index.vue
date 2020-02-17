<template>
    <div style="width: 920px; margin: auto;">
        <el-card><user-info :user="user"/></el-card>

        <div style="margin: 15px 0">
            <el-card style="width: 300px; float: left" body-style="margin: 0; padding: 0">
                <div :class="['tab-pane',{'selected':this.userIdSubscriber!=null}]" @click="selectFollowTab">
                    关注 {{followCount}}
                </div>
                <div :class="['tab-pane',{'selected':this.userIdPublisher!=null}]" @click="selectFansTab">
                    粉丝 {{fansCount}}
                </div>
            </el-card>

            <el-card style="width: 600px; float: right">
                {{title}}
                <el-divider/>
                <div v-for="relation in relations" :key="relation.relaId" style="background-color: whitesmoke; padding: 20px">
                    <div v-if="relation.user">
                        <user-info v-if="relation.relaId" :user="relation.user" :custom-relation="relation"/>
                        <user-info v-else :user="relation.user"/>
                    </div>
                </div>

                <el-pagination @current-change="handleCurrentChange" :current-page.sync="currentPage" :page-size="limit" :pager-count="7"
                               layout="prev, pager, next, jumper" :total="total" hide-on-single-page/>
            </el-card>
        </div>
    </div>
</template>

<script>
    import UserInfo from "@/components/UserInfo";
    export default {
        name: "Relation",
        components: {UserInfo},
        props:{
            userId: {
                type: Number
            },
            follow: {
                type: Boolean
            },
            fans: {
                type: Boolean
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
                followCount: 0,
                fansCount: 0,

                userIdSubscriber: this.userId ? this.userId : this.$store.state.userId,
                userIdPublisher: null,
                relations:[],  //包含relation和user
                currentPage: 1,
                limit: 10
            }
        },
        computed:{
            offset(){
                return (this.currentPage-1) * this.limit;
            },
            total(){
                if(this.userIdSubscriber!=null) return this.followCount;
                else if(this.userIdPublisher!=null) return this.fansCount;
                else return 0;
            },
            title(){
                if(this.userIdSubscriber!=null) return '关注';
                else if(this.userIdPublisher!=null) return '粉丝';
                else return '';
            }
        },
        methods:{
            handleCurrentChange(){
                this.getRelations();
            },
            selectFollowTab() {
                this.userIdSubscriber = this.userId ? this.userId : this.$store.state.userId;
                this.userIdPublisher = null;
                this.currentPage = 1;
                this.getRelations();
            },
            selectFansTab() {
                this.userIdSubscriber = null;
                this.userIdPublisher = this.userId ? this.userId : this.$store.state.userId;
                this.currentPage = 1;
                this.getRelations();
            },
            getRelations(){
                let userIdSubscriber= this.userIdSubscriber;
                let userIdPublisher= this.userIdPublisher;
                this.$api.relation.listRelation({
                    userIdSubscriber,
                    userIdPublisher,
                    offset: this.offset,
                    limit: this.limit
                })
                .then((response)=>{
                    let relations=response.data.data;
                    let task=[];
                    for (let index in relations) {
                        let userId;
                        if(userIdSubscriber) {
                            if(userIdSubscriber!==this.$store.state.userId){
                                relations[index].relaId=null;  //不对<UserInfo/>自定义relation
                            }
                            userId=relations[index].userIdPub;
                        }
                        else if(userIdPublisher) {
                            relations[index].relaId=null;  //不对<UserInfo/>自定义relation
                            userId=relations[index].userIdSub;
                        }
                        task.push(
                            this.$api.auth.getUser({
                                userId
                            })
                            .then((response) => {
                                relations[index].user = response.data.data;
                            })
                        );
                    }
                    Promise.all(task).then(()=>{
                        this.relations=relations;
                    })
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
                let userId = this.userId? this.userId : this.$store.state.userId;
                this.$api.relation.countRelation({userIdSubscriber: userId}).then((response)=>{
                    this.followCount=response.data.data;
                })
            },
            getFansCount(){
                let userId = this.userId? this.userId : this.$store.state.userId;
                this.$api.relation.countRelation({userIdPublisher: userId}).then((response)=>{
                    this.fansCount=response.data.data;
                })
            },
            fetchData(){
                this.getUser();
                this.getFollowCount();
                this.getFansCount();
                if(this.follow){
                    this.selectFollowTab();
                }else if(this.fans){
                    this.selectFansTab();
                }else{
                    this.selectFollowTab();
                }
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
    .tab-pane{
        padding: 1em;
    }
    .tab-pane:hover, .selected{
        cursor: pointer;
        background-color: whitesmoke;
        color: dodgerblue;
    }
</style>