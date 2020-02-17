<template>
    <div>
        <!-- 上传图片 -->
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
    </div>
</template>

<script>
    export default {
        name: "PictureUpload",
        props:{
            resUsage: {
                type: Number,
                required: true
            },
            maxPicNum: {
                type: Number,
                default(){
                    return 9;
                }
            }
        },
        data(){
            return{
                dialogImageUrl: '',
                dialogVisible: false,
                resIds: []
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
                return this.resIds.length;
            },
            restPicNum(){
                return this.maxPicNum - this.picNum;
            }
        },
        methods:{
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
            onUploadSuccess(response){
                this.resIds.push(response.data.resId);
            },
            onFileRemove(file){
                let index=-1;
                if(file.response){
                    index = this.resIds.indexOf(file.response.data.resId);
                }
                if(index>=0)
                    this.resIds.splice(index, 1); //删除数组元素
            },
            getResIds(){
                return this.resIds;
            },
            clearFiles(){
                this.resIds=[];
                this.$refs['pic-upload'].clearFiles();
            }
        }
    }
</script>

<style scoped>

</style>