<template>
    <!-- 用户信息 -->
    <div>
        <div class="center" style="cursor: pointer" @click="avatarDialogVisible=true">
            <el-avatar v-if="user.resUrl" :src="user.resUrl" :size="100" fit="fill"/>
            <el-avatar v-else icon="el-icon-user-solid" :size="100"/>
        </div>
        <el-dialog :visible.sync="avatarDialogVisible" :modal-append-to-body="false" fullscreen>
            <img width="100%" :src="user.resUrl" alt="">
        </el-dialog>

        <div class="center">
            <span style="font-weight: bold; cursor: pointer" @click="toUserPage">
                {{user.userName}}
                <span v-if="relation && relation.relaRemark">({{relation.relaRemark}})</span>
            </span>
            <verification-sign v-if="verification" :custom-verification="verification" style="float: right"/>
            <div v-if="user.userSex!==null" :class="sexBgClass"><i :class="sexIconClass"/></div>
        </div>

        <div v-if="verification" class="center">{{verification.verDesc}}</div>
        <div v-else class="center">{{user.userIntro}}</div>

        <div v-if="user.userId&&$store.state.userId!==user.userId" class="center">
            <div style="margin: 15px"/>
            <el-button v-if="!relation" type="primary" size="medium" @click="follow"><i class="el-icon-plus"/> 关注</el-button>
            <el-button v-else type="primary" size="medium" @click="cancelFollow"><i class="el-icon-minus"/> 取消关注</el-button>
            <span class="divider-vertical"/>
            <el-dropdown @command="handleCommand">
                <el-button type="primary" size="medium"><i class="fa fa-bars"/></el-button>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-if="relation" command="setRemark">设置备注</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
    </div>
</template>

<script>
    import VerificationSign from "@/components/VerificationSign";
    export default {
        name: "UserInfo",
        components: {VerificationSign},
        props:{
            user:{
                type: Object,
                required: true
            },
            customRelation:{
                type:Object
            },
            customVerification: {

            }
        },
        data(){
            return{
                avatarDialogVisible: false,
                relation: null,
                verification: null
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
            }
        },
        methods:{
            handleCommand(command){
                eval('this.'+command)();
            },
            setRemark(){
                this.$prompt('请输入备注', '设置备注', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputPattern: /^.{0,30}$/,
                    inputErrorMessage: '备注名为0-30个字符',
                    inputValue: this.relation.relaRemark
                }).then(({ value }) => {
                    this.$api.relation.updateRelation({
                        relaId: this.relation.relaId,
                        relaRemark: value?value:''
                    }).then(()=>{
                        this.$message.success('设置备注成功');
                        this.relation.relaRemark=value;
                    }).catch((error)=>{
                        if(error.response.status===400||error.response.status===422)
                            this.$message.fail('设置备注失败，'+error.response.data.message)
                    })
                }).catch(() => {

                });
            },
            toUserPage(){
                let path=`/user-page/${this.user.userId}`;
                let currentPath=this.$route.path;
                if(path!==currentPath){
                    this.$router.push(path);
                }
            },
            follow(){
                this.$api.relation.insertRelation({
                    userIdPub: this.user.userId
                }).then((response)=>{
                    this.$message.success('关注成功');
                    this.relation=response.data.data;
                }).catch((error)=>{
                    if(error.response.status===400||error.response.status===422)
                        this.$message.fail('关注失败，'+error.response.data.message)
                })
            },
            cancelFollow(){
                this.$api.relation.deleteRelation({
                    relaId: this.relation.relaId
                }).then(()=>{
                    this.$message.success('取消关注成功');
                    this.relation=null;
                }).catch((error)=>{
                    if(error.response.status===400||error.response.status===422)
                        this.$message.fail('取消关注失败，'+error.response.data.message)
                })
            },
            getRelation(){
                setTimeout(()=>{
                    if(this.user.userId){
                        if(!this.customRelation && this.$store.state.userId!==this.user.userId){
                            this.$api.relation.listRelation({
                                userIdSubscriber: this.$store.state.userId,
                                userIdPublisher: this.user.userId,
                                offset: 0,
                                limit: 1
                            }).then((response)=>{
                                this.relation=response.data.data[0];
                            })
                        }else{
                            this.relation=this.customRelation;
                        }
                    }else{
                        this.getRelation();
                    }
                }, 10);
            },
            getVerification(){
                if (this.customVerification) {
                    this.verification = this.customVerification;
                } else if (this.user.userId) {
                    this.$api.verification.getVerification({userId: this.user.userId}).then((response) => {
                        this.verification = response.data.data;
                    })
                }
            }
        },
        created(){
            this.getRelation();
            this.getVerification();
        },
        watch: {
            user() {
                this.getVerification();
            },
            customVerification(){
                this.getVerification();
            }
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
    .el-avatar >>> img{
        width: 100%;
        height: 100%;
    }
    .divider-vertical{
        margin: 5px;
    }
</style>