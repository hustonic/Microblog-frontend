<template>
    <div>
        <el-input ref="input" type="textarea" :autosize="{ minRows: 1, maxRows: 10}" v-model="comment.commText" resize="none"/>
        <!-- 表情选择框 -->
        <expression-selector :show-expression.sync="showExpression" :text.sync="comment.commText" :input-dom="inputDom"/>
        <!-- 图片选择框 -->
        <el-popover placement="bottom-start" width="310" trigger="manual" v-model="showPic" style="margin-right: 10px">
            <el-button slot="reference" type="text" @click="handleShowPic">
                <i class="el-icon-picture-outline fa-lg" style="color: mediumseagreen"/> 图片</el-button>
            <!-- 关闭按钮 -->
            <close-button :on-click="handleShowPic"/>
            <!-- 上传 -->
            <el-upload ref="pic-upload" :action="uploadUrl" :headers="uploadHeaders" :data="{'resUsage':this.resUsage}"
                       accept="image/jpeg, image/png, image/bmp, image/gif" list-type="picture-card" :limit="maxPicNum"
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
        <!-- 评论按钮 -->
        <el-button type="primary" size="small" @click="sendComment" style="float: right; margin-top: 5px">评论</el-button>
    </div>
</template>

<script>
    import ExpressionSelector from "@/components/ExpressionSelector";
    import CloseButton from "@/components/CloseButton";

    export default {
        name: "SendComment",
        components: {CloseButton, ExpressionSelector},
        props:{
            commText:{
                type:String,
                default(){
                    return ''
                }
            },
            mblogId: {
                type:Number,
                default(){
                    return null
                }
            },
            commIdParent: {
                type:Number,
                default(){
                    return null
                }
            },
            onPublishSuccess:{
                type:Function, //(comment)
                default(){return ()=>{}}
            }
        },
        data(){
            return {
                comment: {
                    commText: this.commText,
                    resId: null,
                    mblogId: this.mblogId,
                    commIdParent: this.commIdParent
                },
                inputDom: {},
                resUsage: this.$api.resource.enums.resourceUsage.COMMENT,
                showExpression:false,

                showPic: false,
                maxPicNum: 1,
                dialogImageUrl: '',
                dialogVisible: false
            }
        },
        methods:{
            handleShowPic() {
                if (this.showPic) {
                    this.comment.resId = null;
                    this.$refs['pic-upload'].clearFiles();
                }
                this.showPic = !this.showPic;
            },
            onPicPreview(file) {
                this.dialogImageUrl = file.url;
                this.dialogVisible = true;
            },
            onFileRemove(){
                this.comment.resId = null;
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
            onUploadSuccess(response){
                this.comment.resId=response.data.resId
            },
            sendComment(){
                if(!this.comment.commText||!this.comment.commText.trim()||this.comment.commText.trim()===this.commText){
                    this.$message.warning('请输入评论内容');
                    return
                }
                this.$api.comment.addComment(this.comment)
                .then((response)=>{
                    this.$message.success('评论成功');
                    //还原数据、表情框、图片框
                    this.comment.commText=this.commText;
                    this.comment.resId=null;
                    this.comment.mblogId=this.mblogId;
                    this.comment.commIdParent=this.commIdParent;

                    this.showExpression=false;
                    if(this.showPic){
                        this.handleShowPic();
                    }

                    this.onPublishSuccess(response.data.data);
                }).catch((error)=>{
                    if(error.response.status===400)
                        this.$message.fail('评论失败，'+error.response.data.message)
                })
            }
        },
        computed: {
            uploadUrl() {
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
                return this.comment.resId?1:0;
            },
            restPicNum(){
                return this.maxPicNum - this.picNum;
            }
        },
        mounted() {
            this.inputDom = this.$refs['input'].getInput();
        }
    }
</script>

<style scoped>

</style>