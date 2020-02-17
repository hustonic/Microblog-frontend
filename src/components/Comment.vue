<template>
    <div style="font-size: small">
        <el-row>
            <el-col v-if="showAvatar" :span="showAvatar?2:0">
                <div style="cursor: pointer; width: fit-content" @click="toUserPage">
                    <el-avatar v-if="user.resUrl" :src="user.resUrl" size="medium" shape="square" fit="fill"/>
                    <el-avatar v-else icon="el-icon-user-solid" size="medium" shape="square"/>
                </div>
            </el-col>
            <el-col :span="showAvatar?22:24">
                <div style="padding: 0 0 3px">
                    <span style="cursor: pointer; float: left;" @click="toUserPage">{{user.userName}}</span>
                    <verification-sign style="float: left; margin-left: 5px" v-if="user&&user.userId" :user-id="user.userId"/>：
                    <collapsible-text :text="comment.commText"/>
                    <el-button v-if="comment.resId" type="text" @click="showPic" style="margin-left: 5px; padding: 0">
                        <i class="el-icon-picture-outline"/> 评论配图
                    </el-button>
                </div>
                <!-- 查看图片 -->
                <el-dialog :visible.sync="dialogVisible" :modal-append-to-body="false" fullscreen>
                    <img width="100%" :src="resUrl" alt="">
                </el-dialog>

                <div>
                    <time-text :time="comment.commCreTime"/>
                    <div style="float: right">
                        <el-popover placement="top" width="160" v-model="deleteVisible" v-if="comment.userId===$store.state.userId">
                            <el-button slot="reference" type="text" size="mini" class="text-button">删除</el-button>
                            <p>确定删除这条评论吗？</p>
                            <div style="text-align: right; margin: 0">
                                <el-button size="mini" type="text" @click="deleteVisible = false">取消</el-button>
                                <el-button type="primary" size="mini" @click="deleteComment">确定</el-button>
                            </div>
                        </el-popover>
                        <el-button type="text" size="mini" class="text-button" @click="handleShowSendComment">回复</el-button>
                        <el-button type="text" size="mini" class="text-button" @click="handleAgree">
                            <i v-if="!agree" class="fa fa-thumbs-o-up"/>
                            <i v-else class="fa fa-thumbs-up orange"/>
                            <span v-if="agreeCount<=0"> 赞</span>
                            <span v-else> {{agreeCount}}</span>
                        </el-button>
                    </div>
                </div>

                <send-comment v-if="showSendComment" style="padding: 10px; margin: 10px 0; background-color: white"
                              :comm-text="`回复@${user.userName}：`" :mblog-id="comment.mblogId" :comm-id-parent="comment.commId"
                              :on-publish-success="handlePubSuccess"/>

                <!-- 子评论/回复 列表 -->
                <div v-if="subCommentCount>0" class="sub-comment-list" v-loading="loading">
                    <el-button type="text" style="padding: 0" @click="getSubComments">共{{subCommentCount}}条回复</el-button>
                    <divider v-if="subComments.length>0" margin="5px 0"/>
                    <div v-for="comment in subComments" :key="comment.commId">
                        <comment :comment="comment" style="margin: 5px 0" :show-avatar="false"
                                 :on-publish-success="handlePubSuccess" :on-delete="handleDelete"/>
                        <divider margin="5px 0"/>
                    </div>
                    <el-button v-if="subComments.length>0" type="text" style="padding: 0" @click="subComments=[]">收起回复</el-button>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import CollapsibleText from "@/components/CollapsibleText";
    import TimeText from "@/components/TimeText";
    import Divider from "@/components/Divider";
    import SendComment from "@/components/SendComment";
    import VerificationSign from "@/components/VerificationSign";

    export default {
        name: "Comment",
        components: {VerificationSign, SendComment, Divider, TimeText, CollapsibleText},
        props:{
            comment: {
                type: Object,
                required: true,
                default(){
                    return {
                        "commId": 0,
                        "commText": "评论",
                        "resId": 0,
                        "mblogId": 0,
                        "commIdParent": null,
                        "commCreTime": "2020-01-1T00:00:00.000+0000",
                        "userId": 0
                    }
                }
            },
            showAvatar: {
                type: Boolean,
                default(){
                    return true
                }
            },
            onPublishSuccess:{  //把comment传递到评论列表
                type: Function, //(comment)
                default(){
                    return ()=>{}
                }
            },
            onDelete:{
                type:Function,
                default(){
                    return ()=>{}
                }
            }
        },
        data(){
            return {
                user: {
                    "userId": 0,
                    "userName": "",
                    "userSex": null,
                    "userBirthday": null,
                    "userIntro": '',
                    "resUrl": '',
                    "userCreTime": "1970-01-01T00:00:00.000+0000"
                },
                dialogVisible:false,
                resUrl: null,
                agree: null,
                agreeCount: 0,
                subCommentCount: 0,
                subComments: [],
                loading: false,
                offset: 0,
                limit: 10,

                showSendComment: false,
                deleteVisible:false
            }
        },
        methods: {
            toUserPage(){
                let path=`/user-page/${this.comment.userId}`;
                let currentPath=this.$route.path;
                if(path!==currentPath){
                    this.$router.push(path);
                }
            },handleAgree(){  //点赞和取消点赞
                if(this.agree){  //取消点赞
                    this.$api.comment.deleteAgreeComment({agreeId: this.agree.agreeId})
                        .then(()=>{
                            this.agree=null;
                            this.agreeCount--;
                        })
                }else{  //点赞
                    this.$api.comment.addAgreeComment({commId: this.comment.commId})
                        .then((response)=>{
                            this.agree = response.data.data;
                            this.agreeCount++;
                        })
                }
            },
            handleShowSendComment(){
                this.showSendComment=!this.showSendComment;
            },
            handlePubSuccess(comment){
                if(this.comment.commId===comment.commIdParent){
                    this.subCommentCount++;
                    //新评论添加到头部
                    this.subComments=[comment].concat(this.subComments);

                }
                if(this.showSendComment){
                    this.handleShowSendComment();
                }
                this.onPublishSuccess(comment);
            },
            handleDelete(comment){
                let index= this.subComments.indexOf(comment);
                if(index>=0) {
                    this.subComments.splice(index, 1);
                    this.subCommentCount--;
                }
                this.onDelete(comment);
            },
            showPic(){
                if(!this.resUrl){
                    this.$api.resource.getResUrl({resId: this.comment.resId})
                    .then((response)=>{
                        this.resUrl=response.data.data;
                    })
                }
                this.dialogVisible=true;
            },
            deleteComment(){
                this.deleteVisible = false;
                this.$api.comment.deleteComment({commId: this.comment.commId})
                .then(()=>{
                    this.$message.success('删除成功');
                    this.onDelete(this.comment);
                })
                .catch((error)=>{
                    if(error.response.status===400) {
                        this.$message.fail('删除失败：' + error)
                    }
                })
            },
            getSubComments(){
                this.loading=true;
                this.$api.comment.listComment({
                    mblogId: this.comment.mblogId,
                    commIdParent: this.comment.commId,
                    offset: this.offset,
                    limit: this.limit
                })
                .then((response)=>{
                    this.subComments = response.data.data
                })
                .finally(()=>{
                    this.loading=false;
                })
            },
            getUser(){
                this.$api.auth.getUser({
                    userId: this.comment.userId
                })
                .then((response)=>{
                    this.user=response.data.data
                })
            },
            getAgree(){
                this.$api.comment.listAgreeComment({
                    userId: this.$store.state.userId,
                    commId: this.comment.commId,
                    offset: 0,
                    limit: 1
                })
                .then((response)=>{
                    this.agree=response.data.data[0]
                })
            },
            getAgreeCount(){
                this.$api.comment.countAgree({commId: this.comment.commId})
                    .then((response)=>{
                        this.agreeCount=response.data.data
                    })
            },
            getSubCommentCount(){
                this.$api.comment.countComment({
                    mblogId: this.comment.mblogId,
                    commId: this.comment.commId
                })
                .then((response)=>{
                    this.subCommentCount=response.data.data
                })
            },
            fetchData(){
                this.getUser();
                this.getAgree();
                this.getAgreeCount();
                if(!this.comment.commIdParent)
                    this.getSubCommentCount()
            }
        },
        created(){
            this.fetchData()
        }
    }
</script>

<style scoped>
    .text-button{
        color: #606266;
        width: fit-content;
        padding: 0 0 0 10px;
    }
    .orange{
        color: orange;
    }
    .sub-comment-list{
        background-color: #eaeaec;
        padding: 10px;
        margin-top: 10px
    }

    .el-avatar >>> img{
        width: 100%;
        height: 100%;
    }
</style>