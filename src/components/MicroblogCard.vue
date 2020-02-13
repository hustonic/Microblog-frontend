<template>
    <div :class="{'bg-purple-light': bgPurpleLight}">
        <el-dropdown v-if="enableDropdown" trigger="click" @command="handleCommand" style="z-index: 10; margin: 5px 10px 0 10px; float: right;">
            <span class="el-dropdown-link">
                <i class="el-icon-arrow-down el-icon--right"/>
            </span>
            <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if="mblog.userId===$store.state.userId" command="deleteMblog">删除</el-dropdown-item>
                <el-dropdown-item v-if="mblog.userId===$store.state.userId" command="showEditDialog">编辑微博</el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>

        <el-dialog :visible.sync="editDialogVisible" title="编辑微博" width="60%" @opened="getMblogInput" @close="onCloseEditDialog">
            <template>
                <el-input ref="mblog-input" type="textarea" :autosize="{ minRows: 4, maxRows: 20}" v-model="editText" resize="none"/>
                <div style="margin: 15px"/>
                <expression-selector :show-expression.sync="showEditExpression" :text.sync="editText" :input-dom="mblogInput"/>
                <el-button type="primary" @click="editMblog" style="float: right">修改</el-button>
            </template>
        </el-dialog>

        <el-row :style="bodyStyle">
            <el-col v-if="showAvatar" :span="3">
                <div style="cursor: pointer; width: fit-content" @click="toUserPage">
                    <el-avatar v-if="user.resUrl" :src="user.resUrl" :size="50" fit="fill"/>
                    <el-avatar v-else icon="el-icon-user-solid" :size="50"/>
                </div>
            </el-col>

            <el-col :span="21" :offset="!this.showAvatar?3:0">
                <el-row>
                    <span style="font-weight: bold; cursor: pointer" @click="toUserPage">{{user.userName}}</span>
                </el-row>
                <el-row>
                    <time-text :time="mblog.mblogPubTime"/>
                </el-row>

                <el-row style="margin-top: 10px; margin-bottom: 10px">
                    <collapsible-text :text="mblog.mblogText"/>
                </el-row>
                <!-- 图片 -->
                <el-row v-if="mblog.mblogType === mblogType.PICTURE">
                    <!-- TODO 图片预览选择下一张后，下次预览无法还原到当前图片 -->
                    <el-col :span="18">
                        <el-image v-for="(resUrl, index) in mblog.resUrls" :key="index"
                                  style="width: 110px; height: 110px; margin-right: 5px" :src="resUrl" fit="cover"
                                  :preview-src-list="mblog.resUrls" lazy/>
                    </el-col>
                </el-row>
                <!-- 视频 -->
                <el-row v-else-if="mblog.mblogType === mblogType.VIDEO">
                    <video width="100%" height="280" controls>
                        <source :src="mblog.resUrls[0]" type="video/mp4"/>
                        抱歉，您的浏览器不支持嵌入式视频。
                    </video>
                </el-row>
            </el-col>
        </el-row>

        <!-- 转发的微博 -->
        <el-row v-if="mblog.mblogType === mblogType.FORWARD">
            <microblog-card ref="forwardedMicroblogCard" :mblog="mblog.microblogForward" :show-avatar="false"
                            button-size="mini" button-type="text" button-position="right" bg-purple-light :enable-dropdown="false"/>
        </el-row>

        <!--    底部按钮    -->
        <el-row>
            <el-col>
                <el-button-group :class="['button-position-'+buttonPosition]">
                    <el-button @click="handleCollect" :size="buttonSize" :type="buttonType" :class="buttonClass">
                        <div v-if="!collect"><i class="fa fa-star-o"/><span> 收藏</span></div>
                        <div v-else><i class="fa fa-star orange"/><span> 已收藏</span></div>
                    </el-button>
                    <el-button icon="fa fa-share-square-o" @click="showForwardDialog" :size="buttonSize" :type="buttonType" :class="buttonClass" >
                        <span v-if="forwardCount<=0"> 转发</span>
                        <span v-else> {{forwardCount}}</span>
                    </el-button>
                    <el-button :size="buttonSize" :type="buttonType" icon="fa fa-commenting-o" :class="buttonClass"
                               @click="showCommentList=!showCommentList">
                        <span v-if="commentCount<=0"> 评论</span>
                        <span v-else> {{commentCount}}</span>
                    </el-button>
                    <el-button @click="handleAgree" :size="buttonSize" :type="buttonType" :class="buttonClass">
                        <i v-if="!agree" class="fa fa-thumbs-o-up"/>
                        <i v-else class="fa fa-thumbs-up orange"/>
                        <span v-if="agreeCount<=0"> 赞</span>
                        <span v-else> {{agreeCount}}</span>
                    </el-button>
                </el-button-group>
            </el-col>
        </el-row>

        <comment-list :show="showCommentList" :mblogId="mblog.mblogId" :comment-count.sync="commentCount"/>

        <!--    转发框    -->
        <el-dialog title="转发微博" :visible.sync="forwardDialogVisible" @opened="onForwardDialogOpened" top="10vh">
            <!-- 检查转发的微博是否是转发类型，如果是则转发其转发的微博，并把转发的微博文本附加在输入框后面 -->
            <send-microblog-card ref="send-microblog-card-forward" button-text="转发" place-holder="请输入转发理由" default-text="转发微博"
                                 :mblog-id-forward="mblogIdForward" :on-publish-success="onForwardSuccess">
                <template>
                    <el-collapse>
                        <el-collapse-item title="查看原微博">
                            <div v-if="mblog.mblogType!==mblogType.FORWARD">
                                <span>@{{user.userName}}: </span>
                                <collapsible-text :text="mblog.mblogText"/>
                            </div>
                            <div v-else>
                                <span>@{{forwardedUser.userName}}: </span>
                                <collapsible-text :text="mblog.microblogForward.mblogText"/>
                            </div>
                        </el-collapse-item>
                    </el-collapse>
                </template>
            </send-microblog-card>
        </el-dialog>
    </div>
</template>

<script>
    import SendMicroblogCard from "@/components/SendMicroblogCard";
    import CollapsibleText from "@/components/CollapsibleText";
    import CommentList from "@/components/CommentList";
    import TimeText from "@/components/TimeText";
    import ExpressionSelector from "@/components/ExpressionSelector";

    export default {
        name: "MicroblogCard",
        components: {ExpressionSelector, CommentList, SendMicroblogCard, CollapsibleText, TimeText},
        props: {
            mblog: {
                type: Object,
                required: true
            },
            customUser: {
                type: Object
            },
            showAvatar: {
                type: Boolean,
                default(){
                    return true;
                }
            },
            bodyStyle: {
                type: Object,
                default(){
                    return {
                        'padding-top': '20px',
                        'padding-left': '20px',
                        'padding-right': '20px'
                    }
                }
            },
            buttonSize: {  //'', 'medium', 'size', 'mini'
                type: String,
                default(){
                    return '';
                }
            },
            buttonType: {  //'', 'text'
                type: String,
                default(){
                    return ''
                }
            },
            buttonPosition: {  //'', 'left', 'right'
                type: String,
                default(){
                    return ''
                }
            },
            bgPurpleLight: {
                type: Boolean,
                default(){
                    return false
                }
            },
            enableDropdown:{
                type: Boolean,
                default(){
                    return true
                }
            },
            onDelete:{
                type: Function,  //(mblog)
                default(){
                    return ()=>{}
                }
            }
        },
        data() {
            return {
                buttonClass: [
                    this.buttonType ? 'button-type-' + this.buttonType : '',
                    {
                        'footer-button': true,
                        'bg-purple-light': this.bgPurpleLight
                    }
                ],
                user: {
                    userId: '',
                    userName: '',
                    userSex:'',
                    userBirthday:'',
                    userIntro:'',
                    resUrl:'',
                    userCreTime:''
                },
                forwardedUser:{
                    userName: ''
                },

                collect: null,
                forwardCount: 0,
                forwardDialogVisible: false,
                commentCount: 0,
                showCommentList: false,
                agree: null,
                agreeCount: 0,

                mblogType: this.$api.mblog.enums.microblogType,

                editDialogVisible: false,
                editText: '',
                showEditExpression: false,
                mblogInput: {}
            }
        },
        computed:{
            mblogIdForward(){
                if(this.mblog.mblogType === this.mblogType.FORWARD){
                    return this.mblog.mblogIdForward;
                }else{
                    return this.mblog.mblogId;
                }
            }
        },
        methods: {
            toUserPage(){
                let path=`/user-page/${this.mblog.userId}`;
                let currentPath=this.$route.path;
                if(path!==currentPath){
                    this.$router.push(path);
                }
            },
            handleCollect(){  //收藏和取消收藏
                if(this.collect){  //已收藏
                    this.$api.mblog.deleteCollect({collectId: this.collect.collectId})
                    .then(()=>{
                        this.collect=null;
                    })
                }else{  //未收藏
                    this.$api.mblog.addCollect({mblogId: this.mblog.mblogId})
                    .then(()=>{
                        this.getCollect();
                    })
                }
            },
            onForwardDialogOpened(){
                if(this.mblog.mblogType === this.mblogType.FORWARD) {
                    //从MicroblogCard子组件获取被转发的用户信息
                    this.forwardedUser = this.$refs.forwardedMicroblogCard.user;
                    //向转发输入框填充转发的文本
                    this.$refs['send-microblog-card-forward'].setInputText('//@'+this.user.userName+': '+this.mblog.mblogText);
                }
                //输入框获取焦点，并把光标置于最前面
                this.$refs['send-microblog-card-forward'].$refs['mblog-input'].focus();
                setTimeout(()=>{
                    this.$refs['send-microblog-card-forward'].$refs['mblog-input'].getInput().setSelectionRange(0,0);
                }, 10);
            },
            showForwardDialog(){
                this.forwardDialogVisible = true;
            },
            onForwardSuccess(){
                this.$message.success({message: '转发微博成功', showClose: true});
                if(this.mblog.mblogType === this.mblogType.FORWARD){
                    this.$refs['forwardedMicroblogCard'].forwardCount++;
                }else{
                    this.forwardCount++;
                }
                this.forwardDialogVisible = false;
            },
            handleAgree(){  //点赞和取消点赞
                if(this.agree){  //取消点赞
                    this.$api.mblog.deleteAgree({agreeId: this.agree.agreeId})
                        .then(()=>{
                            this.agree=null;
                            this.agreeCount--;
                        })
                }else{  //点赞
                    this.$api.mblog.insertAgree({mblogId: this.mblog.mblogId})
                        .then(()=>{
                            this.getAgree();
                            this.agreeCount++;
                        })
                }
            },
            handleCommand(command){
                eval('this.'+command)();  //通过方法名调用方法
            },
            deleteMblog(){
                this.$confirm('确定删除该微博吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$api.mblog.deleteMicroblog({mblogId: this.mblog.mblogId}).then(() => {
                        this.$message.success('删除微博成功');
                        this.onDelete(this.mblog);
                    });
                }).catch(()=>{

                })
            },
            showEditDialog(){
                this.editDialogVisible=true;
                this.editText = this.mblog.mblogText;
            },
            onCloseEditDialog(){
                this.showEditExpression=false;
            },
            editMblog(){
                if(!this.editText.trim()){
                    this.$message.warning({message: '请输入文本内容', showClose:true});
                    return;
                }
                if(this.editText===this.mblog.mblogText){
                    this.$message.success('修改微博成功');
                    this.editDialogVisible=false;
                    return;
                }

                this.$api.mblog.updateMicroblog({
                    mblogId: this.mblog.mblogId,
                    mblogText: this.editText
                })
                .then(()=>{
                    this.$message.success('修改微博成功');
                    this.editDialogVisible=false;
                    this.mblog.mblogText=this.editText;
                })
                .catch((error)=>{
                    if(error.response.status===400) {
                        this.$message.error('修改微博失败，' + error.response.data.message);
                    }
                })
            },
            getMblogInput(){
                this.mblogInput=this.$refs['mblog-input'].getInput();
            },

            getUser(){
                if(this.customUser){
                    this.user = this.customUser;
                }else{
                    this.$api.auth.getUser({userId:this.mblog.userId})
                    .then((response)=>{
                        this.user = response.data.data;
                    })
                }
            },
            getCollect(){
                this.$api.mblog.getCollect({mblogId: this.mblog.mblogId})
                .then((response)=>{
                    this.collect = response.data.data;
                })
            },
            getForwardCount(){
                this.$api.mblog.getForwardCount({mblogId: this.mblog.mblogId})
                .then((response)=>{
                    this.forwardCount=response.data.data;
                })
            },
            getCommentCount(){
                this.$api.comment.countComment({mblogId: this.mblog.mblogId})
                .then((response)=>{
                    this.commentCount = response.data.data;
                })
            },
            getAgree(){
                this.$api.mblog.listAgree({
                    userId: this.$store.state.userId,
                    mblogId: this.mblog.mblogId,
                    offset: 0,
                    limit: 1
                }).then((response)=>{
                    this.agree=response.data.data[0];
                });
            },
            getAgreeCount(){
                this.$api.mblog.countAgree({mblogId: this.mblog.mblogId})
                    .then((response) => {
                        this.agreeCount = response.data.data;
                    })
            },
            fetchData(){
                this.getUser();
                this.getCollect();
                this.getForwardCount();
                this.getCommentCount();
                this.getAgree();
                this.getAgreeCount();
            }
        },
        created() {
            this.fetchData();
        },
        watch:{
            '$route':'fetchData',
            customUser(newVal){
                this.user=newVal;
            }
        }
    }
</script>

<style scoped>
    .footer-button {
        width: 25.125%;
    }
    .orange{
        color: orange;
    }
    .divider{
        margin: 5px;
    }
    .bg-purple-light {
        background: #f2f2f5;
    }
    .button-type-text{
        color: #606266;
        padding: 10px;
        width: fit-content;
    }
    .button-position-{
        width: 100%;
    }
    .button-position-left{
        float: left;
    }
    .button-position-right{
        float: right;
    }
    .el-dropdown-link {
        cursor: pointer;
    }
    .el-icon-arrow-down {
        font-size: 18px;
        font-weight: bold;
    }
    .el-avatar >>> img{
        width: 100%;
        height: 100%;
    }
</style>