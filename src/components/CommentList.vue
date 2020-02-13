<template>
    <div v-if="show" class="container"
         v-loading="loading" element-loading-spinner="el-icon-loading" element-loading-text="正在加载, 请稍后...">
        <el-row>
            <el-col :span="2">
                <el-avatar v-if="$store.state.user.resUrl" :src="$store.state.user.resUrl" size="medium" shape="square" fit="fill"/>
                <el-avatar v-else icon="el-icon-user-solid" size="medium" shape="square"/>
            </el-col>
            <el-col :span="22">
                <send-comment :mblog-id="mblogId" :on-publish-success="handlePublishSuccess"
                              style="padding: 10px; margin-bottom: 10px; background-color: white"/>
            </el-col>
        </el-row>

        <!--评论列表-->
        <divider v-if="comments.length>0" margin="5px 0"/>
        <div v-for="comment in comments" :key="comment.commId">
            <comment :comment="comment" :on-publish-success="handlePublishSuccess" :on-delete="handleDelete"/>
            <divider margin="5px 0"/>
        </div>
        <el-pagination :page-size="limit" :total="rootCommentCount" :current-page.sync="currentPage"
                       :pager-count="7" layout="prev, pager, next, jumper" hide-on-single-page
                       @current-change="getComments"
                       style="width: fit-content; margin-left: auto; margin-right: auto;"/>
    </div>
</template>

<script>
    import Comment from "@/components/Comment";
    import Divider from "@/components/Divider";
    import SendComment from "@/components/SendComment";

    export default {
        name: "CommentList",
        components: {SendComment, Divider, Comment},
        props: {
            show: {type: Boolean, required: true},
            mblogId: {type:Number, required: true},
            commentCount:{type:Number, default(){return 0}}
        },
        data(){
            return {
                loading: false,
                comments: [],
                rootCommentCount: 0,
                currentPage: 1,
                limit: 10
            }
        },
        computed:{
            offset(){
                return (this.currentPage-1) * this.limit;
            }
        },
        methods: {
            handlePublishSuccess(comment){
                if(!comment.commIdParent){
                    this.comments=[comment].concat(this.comments);
                    this.rootCommentCount++;
                }
                this.$emit('update:commentCount', this.commentCount+1);
            },
            handleDelete(comment){
                let index= this.comments.indexOf(comment);
                if(index>=0) {
                    this.comments.splice(index, 1);
                    this.rootCommentCount--;
                }
                this.$emit('update:commentCount', this.commentCount-1);
            },
            getComments(){
                this.loading = true;
                this.$api.comment.listComment({
                    mblogId: this.mblogId,
                    offset: this.offset,
                    limit: this.limit
                }).then((response)=>{
                    this.comments = response.data.data;
                }).finally(()=>{
                    this.loading=false;
                })
            },
            getRootCommentCount(){
                this.$api.comment.countComment({
                    mblogId: this.mblogId,
                    commIdShouldNull: true
                })
                .then((response)=>{
                    this.rootCommentCount=response.data.data;
                })
            },
            fetchData(){
                this.getComments();
                this.getRootCommentCount();
            }
        },
        watch:{
            show(newVal, oldVal){
                if(!oldVal && newVal){
                    this.fetchData()
                }
            }
        }
    }
</script>

<style scoped>
    .container{
        padding: 20px;
        background-color: #f2f2f5;
    }
    .el-avatar >>> img{
        width: 100%;
        height: 100%;
    }
</style>