<template>
    <div  style="width: 600px; margin: auto;">
        <div v-infinite-scroll="getMBlogList" :infinite-scroll-disabled="disabled">
            <el-card v-for="mblog in mBlogList" :key="mblog.mblogId" body-style="padding: 0" class="microblog-card">
                <microblog-card :mblog="mblog"/>
            </el-card>
        </div>
        <div class="center-text">
            <p v-if="loading">加载中...</p>
            <p v-if="noMore">没有更多了</p>
        </div>
    </div>
</template>

<script>
    import MicroblogCard from "@/components/MicroblogCard";

    export default {
        name: "Square",
        components:{MicroblogCard},
        data(){
            return {
                mBlogList:[],
                offset: 0,
                limit: 2,
                loading: false,
                noMore: false
            }
        },
        computed: {
            disabled () {
                return this.loading || this.noMore;
            }
        },
        methods:{
            getMBlogList(){
                this.loading=true;
                let userId = this.$store.state.userId;
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
                    timelineType: this.$api.mblog.enums.timelineType.MICROBLOG_ALL,
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
            fetchData(){

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
    .microblog-card{
        margin-top: 15px;
        margin-bottom: 15px;
    }
    .center-text{
        width: fit-content;
        margin: 0 auto;
    }
</style>