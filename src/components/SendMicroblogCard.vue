<template>
    <div>
        <slot>有什么新鲜事想告诉大家?</slot>

        <div style="margin: 15px"/>
        <el-input ref="mblog-input" type="textarea" :autosize="{ minRows: 4, maxRows: 20}" v-model="mblog.mblogText"
                  :placeholder="placeHolder" resize="none"/>
        <div style="margin: 15px"/>

        <div>
            <!-- 表情选择框 -->
            <expression-selector :show-expression.sync="showExpression" :text.sync="mblog.mblogText" :input-dom="mblogInput"/>
            <!-- 图片选择框 -->
            <el-popover v-if="showPicButton" placement="bottom" width="500" trigger="manual" v-model="showPic" style="margin-right: 10px">
                <el-button slot="reference" type="text" @click="handleShowPic">
                    <i class="el-icon-picture-outline fa-lg" style="color: mediumseagreen"/> 图片</el-button>
                <!-- 关闭按钮 -->
                <close-button :on-click="handleShowPic"/>
                <!-- 上传 -->
                <el-upload ref="pic-upload" :action="uploadUrl" :headers="uploadHeaders" :data="{'resUsage':this.resUsage}"
                           accept="image/jpeg, image/png, image/bmp, image/gif" list-type="picture-card" :limit="maxPicNum" multiple
                           :on-preview="onPicPreview" :on-remove="onFileRemove" :on-success="onUploadSuccess" :before-upload="beforePicUpload">
                    <i class="el-icon-plus"/>
                    <div slot="tip" class="el-upload__tip">只能上传jpg/png/bmp/gif图片，且不超过2MB</div>
                    <div slot="tip" class="el-upload__tip">共{{picNum}}张，还能上传{{restPicNum}}张</div>
                </el-upload>
                <!-- 图片预览 -->
                <el-dialog :visible.sync="dialogVisible" :modal-append-to-body="false" fullscreen>
                    <img width="100%" :src="dialogImageUrl" alt="">
                </el-dialog>
            </el-popover>
            <!-- 视频选择框 -->
            <el-popover v-if="showVideoButton" placement="bottom" width="300" trigger="manual" v-model="showVideo" style="margin-right: 10px">
                <el-button slot="reference" type="text" @click="handleShowVideo">
                    <i class="el-icon-video-camera fa-lg" style="color: dodgerblue"/> 视频</el-button>
                <!-- 关闭按钮 -->
                <close-button :on-click="handleShowVideo"/>
                <!-- 上传 -->
                <el-upload ref="video-upload" :action="uploadUrl" :headers="uploadHeaders" :data="{'resUsage':this.resUsage}"
                           accept="video/mp4" :limit="maxVideoNum"
                           :on-remove="onFileRemove" :on-success="onUploadSuccess" :before-upload="beforeVideoUpload">
                    <el-button type="primary">上传视频</el-button>
                    <div slot="tip" class="el-upload__tip">只能上传mp4文件，且不超过500MB</div>
                    <div slot="tip" class="el-upload__tip">共{{videoNum}}个视频，还能上传{{restVideoNum}}个视频</div>
                </el-upload>
            </el-popover>

            <el-button type="primary" @click="publish" style="float: right">{{buttonText}}</el-button>
        </div>
    </div>
</template>

<script>
    import CloseButton from "@/components/CloseButton";
    import ExpressionSelector from "@/components/ExpressionSelector";

    export default {
        name: "SendMicroblogCard",
        components:{
            ExpressionSelector,
            CloseButton
        },
        props:{
            placeHolder: {
                type: String,
                default(){
                    return '请输入内容';
                }
            },
            buttonText: {
                type: String,
                default() {
                    return '发布';
                }
            },
            showPicButton: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            showVideoButton: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            mblogIdForward: {
                type: Number
            },
            onPublishSuccess: {
                type: Function
            },
            onPublishError: {
                type: Function
            },
            beforePublish: {
                type: Function,
                default(){
                    return function(){};
                }
            },
            defaultText: {  //在用户没有输入微博文本时发布的默认文本
                type: String
            }
        },
        data(){
            return {
                mblog: {
                    mblogText: '',
                    mblogType: this.$api.mblog.enums.microblogType.TEXT,
                    resIds: []
                },
                mblogInput: {},
                resUsage: this.$api.resource.enums.resourceUsage.MICROBLOG,
                showExpression: false,

                showPic: false,
                maxPicNum: 9,
                dialogImageUrl: '',
                dialogVisible: false,

                showVideo: false,
                maxVideoNum: 1
            }
        },
        methods: {
            setInputText(text){
                this.mblog.mblogText=text;
            },
            getInputText(){
                return this.mblog.mblogText;
            },
            handleShowExpression(){
                this.showExpression=!this.showExpression;
            },

            handleShowPic() {
                if (this.showPic) {
                    if (this.mblog.resIds.length > 0) {
                        this.mblog.resIds = [];
                        this.$refs['pic-upload'].clearFiles();
                    }
                    this.showPic = !this.showPic;
                    this.mblog.mblogType = this.$api.mblog.enums.microblogType.TEXT;
                } else {
                    if(this.showVideo){
                        this.$confirm('确定放弃上传视频吗?', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                        }).then(() => {
                            this.mblog.resIds = [];
                            this.$refs['video-upload'].clearFiles();
                            this.showVideo = !this.showVideo;
                            this.showPic = !this.showPic;
                            this.mblog.mblogType = this.$api.mblog.enums.microblogType.PICTURE;
                        }).catch(( ) => {
                        });
                    }else{
                        this.showPic = !this.showPic;
                        this.mblog.mblogType = this.$api.mblog.enums.microblogType.PICTURE;
                    }
                }
            },
            onPicPreview(file) {
                this.dialogImageUrl = file.url;
                this.dialogVisible = true;
            },
            beforePicUpload(file){
                const validTypes = ['image/jpeg', 'image/png', 'image/bmp', 'image/gif'];
                const isValidType = validTypes.indexOf(file.type)>=0;
                const isLe2M = file.size <= (2<<20);

                if (!isValidType) {
                    this.$message.error('上传图片的格式只能是 jpg/png/bmp/gif !');
                }
                if (!isLe2M) {
                    this.$message.error('上传图片大小不能超过 2MB!');
                }
                return isValidType && isLe2M;
            },

            handleShowVideo(){
                if (this.showVideo) {
                    if (this.mblog.resIds.length > 0) {
                        this.mblog.resIds = [];
                        this.$refs['video-upload'].clearFiles();
                    }
                    this.showVideo = !this.showVideo;
                    this.mblog.mblogType = this.$api.mblog.enums.microblogType.TEXT;
                } else {
                    if(this.showPic){
                        this.$confirm('确定放弃上传图片吗?', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                        }).then(() => {
                            this.mblog.resIds = [];
                            this.$refs['pic-upload'].clearFiles();
                            this.showPic = !this.showPic;
                            this.showVideo = !this.showVideo;
                            this.mblog.mblogType = this.$api.mblog.enums.microblogType.VIDEO;
                        }).catch(( ) => {
                        });
                    }else{
                        this.showVideo = !this.showVideo;
                        this.mblog.mblogType = this.$api.mblog.enums.microblogType.VIDEO;
                    }
                }
            },
            beforeVideoUpload(file){
                const validTypes = ['video/mp4'];
                const isValidType = validTypes.indexOf(file.type)>=0;
                const isLe500M = file.size <= (500<<20);

                if (!isValidType) {
                    this.$message.error('上传视频的格式只能是 mp4 !');
                }
                if (!isLe500M) {
                    this.$message.error('上传视频大小不能超过 500MB !');
                }
                return isValidType && isLe500M;
            },

            onUploadSuccess(response){
                this.mblog.resIds.push(response.data.resId);
            },
            onFileRemove(file){
                let index=-1;
                if(file.response){
                    index = this.mblog.resIds.indexOf(file.response.data.resId);
                }
                if(index>=0)
                    this.mblog.resIds.splice(index, 1); //删除数组元素
            },

            publish(){
                this.beforePublish();
                if(!this.mblog.mblogText.trim() && !this.defaultText){
                    this.$message.warning({message: '请输入文本内容', showClose:true});
                    return;
                }
                if(this.mblogIdForward){
                    this.mblog.mblogIdForward = this.mblogIdForward;
                    this.mblog.mblogType = this.$api.mblog.enums.microblogType.FORWARD;
                }

                let mblog = {};
                for(let propName in this.mblog){
                    mblog[propName] = this.mblog[propName];
                }
                if(!this.mblog.mblogText.trim() && this.defaultText){
                    mblog.mblogText = this.defaultText;
                }

                this.$api.mblog.addMicroblog(mblog)
                .then(()=>{
                    //重置输入框、文件列表、弹出框
                    this.mblog.mblogText='';
                    if(this.showExpression){
                        this.handleShowExpression();
                    }
                    if(this.showPic){
                        this.handleShowPic();
                    }
                    if(this.showVideo){
                        this.handleShowVideo();
                    }

                    if(this.onPublishSuccess){
                        this.onPublishSuccess();
                    }else{
                        this.$message.success({message: '发布微博成功', showClose: true});
                    }
                })
                .catch((error)=>{
                    if(this.onPublishError){
                        this.onPublishError(error);
                    }else{
                        this.$message.error({message: error.response.data.message, showClose: true});
                    }
                })
            }
        },
        computed:{
            uploadUrl(){
                return this.$api.resource.getUploadUrl();
            },
            uploadHeaders() {
                let token = this.$utils.getToken();
                let header = {};
                if(token)
                    header[this.$utils.tokenHeaderName]=this.$utils.tokenType + token;
                return header;
            },
            picNum(){
                return this.mblog.resIds.length;
            },
            restPicNum(){
                return this.maxPicNum - this.picNum;
            },
            videoNum(){
                return this.mblog.resIds.length;
            },
            restVideoNum(){
                return this.maxVideoNum - this.videoNum;
            }
        },
        mounted(){
            this.mblogInput = this.$refs['mblog-input'].getInput();
        }
    }
</script>

<style scoped>

</style>