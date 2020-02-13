<template>
    <div class="content">
        <el-card>
            <div>
                我的信息
                <el-divider/>
            </div>
            <el-form ref="form" :model="user" label-position="right" label-width="80px" :rules="rules" style="margin: 0 auto;width: fit-content">
                <el-form-item label="头像">
                    <div style="cursor: pointer; width: fit-content" @click="avatarDialogVisible=true" v-loading="uploadingAvatar">
                        <el-avatar v-if="user.resUrl" :size="178" :src="user.resUrl" shape="square" fit="fill"/>
                        <el-avatar v-else :size="178" icon="el-icon-user-solid" shape="square"/>
                    </div>
                    <el-dialog :visible.sync="avatarDialogVisible" :modal-append-to-body="false" fullscreen>
                        <img width="100%" :src="user.resUrl" alt="">
                    </el-dialog>

                    <el-upload ref="pic-upload" :action="uploadUrl" :headers="uploadHeaders" :data="{'resUsage':this.resUsage}"
                               accept="image/jpeg, image/png, image/bmp, image/gif" :show-file-list="false"
                               :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload"
                               :on-progress="()=>{this.uploadingAvatar=true}" :on-change="()=>{this.uploadingAvatar=false}">
                        <el-button size="small" type="primary">上传头像</el-button>
                        <span slot="tip" class="el-upload__tip">只能上传jpg/png/bmp/gif文件，且不超过2MB</span>
                    </el-upload>
                </el-form-item>
                <el-form-item label="邮箱" v-if="user.userEmail">
                    <el-input v-model="user.userEmail" disabled class="input"/>
                    <el-button @click="emailDialogVisible=true" style="margin-left: 2em">修改</el-button>
                </el-form-item>
                <el-form-item label="手机号" v-if="user.userPhone">
                    <el-input v-model="user.userPhone" disabled class="input"/>
                    <el-button @click="phoneDialogVisible=true" style="margin-left: 2em">修改</el-button>
                </el-form-item>
                <el-form-item label="用户名" prop="userName">
                    <el-input v-model="user.userName" class="input"/>
                </el-form-item>
                <el-form-item label="性别">
                    <el-select v-model="user.userSex" placeholder="请选择性别">
                        <el-option v-for="sex in sexList" :key="sex.value" :label="sex.label" :value="sex.value"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="生日" prop="userBirthday">
                    <el-date-picker v-model="user.userBirthday" type="date" placeholder="选择日期"/>
                </el-form-item>
                <el-form-item label="简介">
                    <el-input v-model="user.userIntro" type="textarea" :autosize="{ minRows: 3, maxRows: 6}"
                              maxlength="70" resize="none" show-word-limit class="input"/>
                </el-form-item>
                <el-form-item>
                    <el-button style="margin: 0 1em" type="primary" @click="updateUser">保存更改</el-button>
                    <el-button style="margin: 0 1em" @click="cancel">取消</el-button>
                </el-form-item>
            </el-form>

            <el-dialog :visible.sync="emailDialogVisible">
                身份验证
                <el-divider/>
                <el-form ref="emailForm" :model="user" label-position="right" label-width="80px" :rules="emailRules">
                    <el-form-item label="邮箱">
                        <el-input v-model="user.userEmail" disabled/>
                    </el-form-item>
                    <el-form-item label="验证码" prop="oldEmailCode">
                        <el-input v-model="user.oldEmailCode" placeholder="请输入原邮箱的验证码">
                            <el-button @click="getOldEmailCode" slot="append" :disabled="validButton1Disabled">{{validButtonText1}}</el-button>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="新邮箱" prop="newEmail">
                        <el-input v-model="user.newEmail" placeholder="请输入新邮箱"/>
                    </el-form-item>
                    <el-form-item label="验证码" prop="newEmailCode">
                        <el-input v-model="user.newEmailCode" placeholder="请输入新邮箱的验证码">
                            <el-button @click="getNewEmailCode" slot="append" :disabled="validButton2Disabled">{{validButtonText2}}</el-button>
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="updateUserEmail">提交</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>

            <el-dialog :visible.sync="phoneDialogVisible">
                身份验证
                <el-divider/>
                <el-form ref="phoneForm" :model="user" label-position="right" label-width="80px" :rules="phoneRules">
                    <el-form-item label="手机号">
                        <el-input v-model="user.userPhone" disabled/>
                    </el-form-item>
                    <el-form-item label="验证码" prop="oldPhoneCode">
                        <el-input v-model="user.oldPhoneCode" placeholder="请输入原手机号的验证码">
                            <el-button @click="getOldPhoneCode" slot="append" :disabled="validButton1Disabled">{{validButtonText1}}</el-button>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="新手机号" prop="newPhone">
                        <el-input v-model="user.newPhone" placeholder="请输入新手机号"/>
                    </el-form-item>
                    <el-form-item label="验证码" prop="newPhoneCode">
                        <el-input v-model="user.newPhoneCode" placeholder="请输入新手机号的验证码">
                            <el-button @click="getNewPhoneCode" slot="append" :disabled="validButton2Disabled">{{validButtonText2}}</el-button>
                        </el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="updateUserPhone">提交</el-button>
                    </el-form-item>
                </el-form>
            </el-dialog>
        </el-card>
    </div>
</template>

<script>
    export default {
        name: "UserSetting",
        inject:['reload'],
        data(){
            const validateUserName = (rule, value, callback)=>{
                if(!value) return callback(new Error('请输入用户名'));
                if(!/^[\u4E00-\u9FA5\w-]{4,30}$/.test(value))
                    return callback(new Error('用户名为4～30位中英文、数字、_ 、-'));
                return callback();
            };
            const validateUserBirthday = (rule, value, callback)=>{
                if(!value) return callback();
                if(value>new Date()){
                    return callback(new Error('生日不能大于当前日期'));
                }
                return callback();
            };
            const validateUserEmail = (rule, value, callback)=>{
                if(!value) return callback(new Error('请输入邮箱'));
                if(!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value))
                    return callback(new Error('邮箱格式不正确'));
                return callback();
            };
            const validateUserPhone = (rule, value, callback)=>{
                if(!value) return callback(new Error('请输入手机号'));
                if(!/^1[3-9]\d{9}$/.test(value))
                    return callback(new Error('手机号格式不正确'));
                return callback();
            };
            const validateValidationCode = (rule, value, callback)=>{
                if(!value) return callback(new Error('请输入验证码'));
                if(!/^\d{6}$/.test(value))
                    return callback(new Error('验证码为6位数字'));
                return callback();
            };
            return {
                user: {
                    userId: '',
                    userName: '',
                    userEmail: '',
                    userPhone: '',
                    userSex: '',
                    userBirthday: '',
                    userIntro: '',
                    resId: '',
                    resUrl: '',
                    userCreTime: '',

                    oldPassword:'',
                    userPassword:'',
                    newResUrl: '',

                    oldPhoneCode: '',
                    newPhone:'',
                    newPhoneCode: '',

                    oldEmailCode:'',
                    newEmail:'',
                    newEmailCode:''
                },
                rules:{
                    userName:[
                        {validator:validateUserName, trigger:'blur'}
                    ],
                    userBirthday:[
                        {validator:validateUserBirthday, trigger:'blur'}
                    ]
                },
                phoneRules:{
                    newPhone:[
                        {validator: validateUserPhone, trigger:'blur'}
                    ],
                    oldPhoneCode:[
                        {validator:validateValidationCode, trigger:'blur'}
                    ],
                    newPhoneCode:[
                        {validator:validateValidationCode, trigger:'blur'}
                    ],
                },
                emailRules:{
                    newEmail:[
                        {validator: validateUserEmail, trigger:'blur'}
                    ],
                    oldEmailCode:[
                        {validator:validateValidationCode, trigger:'blur'}
                    ],
                    newEmailCode:[
                        {validator:validateValidationCode, trigger:'blur'}
                    ]
                },
                sexList: [
                    {
                        value: this.$api.auth.enums.userSex.MALE,
                        label: '男'
                    },
                    {
                        value: this.$api.auth.enums.userSex.FEMALE,
                        label: '女'
                    }
                ],
                resUsage: this.$api.resource.enums.resourceUsage.HEAD_PICTURE,
                avatarDialogVisible: false,
                uploadingAvatar: false,

                phoneDialogVisible: false,
                emailDialogVisible: false,
                validButton1Disabled: false,
                validButtonText1: '发送验证码',
                second1: 0,
                validButton2Disabled: false,
                validButtonText2: '发送验证码',
                second2: 0,
            }
        },
        computed:{
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
            userInStore(){
                return this.$store.state.user;
            }
        },
        methods:{
            getOldPhoneCode(){
                this.validButton1Disabled = true;
                this.$api.auth.sendValidationCodeToUserPhoneForUpdate().then(() => {
                    this.$message.success({message: '验证码发送成功，60秒内未收到请重新获取', showClose: true});
                    this.second1 = 60;
                    this.validButtonText1 = this.second1 + '秒后可再次获取';
                    let id = setInterval(() => {
                        if (--this.second1 <= 0) {
                            this.validButton1Disabled = false;
                            this.validButtonText1 = '发送验证码';
                            clearInterval(id);
                        } else {
                            this.validButtonText1 = this.second1 + '秒后可再次获取';
                        }
                    }, 1000);
                }).catch((error) => {
                    if (error.response.status === 400 || error.response.status === 422)
                        this.$message.error({message: error.response.data.message, showClose: true});
                    this.validButton1Disabled = false;
                });
            },
            getNewPhoneCode(){
                this.$refs['phoneForm'].validateField('newPhone', (error)=>{
                    if(error) {
                        return false;
                    }
                    this.validButton2Disabled=true;
                    this.$api.auth.sendValidationCode({
                        phone: this.user.newPhone,
                        validationType: this.$api.auth.enums.validationType.UPDATE_USER_PHONE
                    }).then(() => {
                        this.$message.success({message: '验证码发送成功，60秒内未收到请重新获取', showClose: true});
                        this.second2 = 60;
                        this.validButtonText2 = this.second2 + '秒后可再次获取';
                        let id = setInterval(() => {
                            if (--this.second2 <= 0) {
                                this.validButton2Disabled = false;
                                this.validButtonText2 = '发送验证码';
                                clearInterval(id);
                            } else {
                                this.validButtonText2 = this.second2 + '秒后可再次获取';
                            }
                        }, 1000);
                    }).catch((error) => {
                        if (error.response.status === 400 || error.response.status === 422)
                            this.$message.error({message: error.response.data.message, showClose: true});
                        this.validButton2Disabled = false;
                    });
                });
            },
            updateUserPhone(){
                this.$refs['phoneForm'].validate((valid)=>{
                    if(!valid) return false;
                    this.$api.auth.updateUserPhone({
                        oldPhoneCode: this.user.oldPhoneCode,
                        userPhone: this.user.newPhone,
                        newPhoneCode: this.user.newPhoneCode
                    })
                        .then(()=>{
                            this.$message.success('修改成功');
                            this.reload();
                        })
                        .catch((error)=>{
                            if(error.response.status===400||error.response.status===422)
                                this.$message.error({message:error.response.data.message, showClose:true});
                        })
                });
            },
            getOldEmailCode(){
                this.validButton1Disabled = true;
                this.$api.auth.sendValidationCodeToUserEmailForUpdate().then(() => {
                    this.$message.success({message: '验证码发送成功，60秒内未收到请重新获取', showClose: true});
                    this.second1 = 60;
                    this.validButtonText1 = this.second1 + '秒后可再次获取';
                    let id = setInterval(() => {
                        if (--this.second1 <= 0) {
                            this.validButton1Disabled = false;
                            this.validButtonText1 = '发送验证码';
                            clearInterval(id);
                        } else {
                            this.validButtonText1 = this.second1 + '秒后可再次获取';
                        }
                    }, 1000);
                }).catch((error) => {
                    if (error.response.status === 400 || error.response.status === 422)
                        this.$message.error({message: error.response.data.message, showClose: true});
                    this.validButton1Disabled = false;
                });
            },
            getNewEmailCode(){
                this.$refs['emailForm'].validateField('newEmail', (error)=>{
                    if(error) {
                        return false;
                    }
                    this.validButton2Disabled=true;
                    this.$api.auth.sendValidationCode({
                        email: this.user.newEmail,
                        validationType: this.$api.auth.enums.validationType.UPDATE_USER_EMAIL
                    }).then(() => {
                        this.$message.success({message: '验证码发送成功，60秒内未收到请重新获取', showClose: true});
                        this.second2 = 60;
                        this.validButtonText2 = this.second2 + '秒后可再次获取';
                        let id = setInterval(() => {
                            if (--this.second2 <= 0) {
                                this.validButton2Disabled = false;
                                this.validButtonText2 = '发送验证码';
                                clearInterval(id);
                            } else {
                                this.validButtonText2 = this.second2 + '秒后可再次获取';
                            }
                        }, 1000);
                    }).catch((error) => {
                        if (error.response.status === 400 || error.response.status === 422)
                            this.$message.error({message: error.response.data.message, showClose: true});
                        this.validButton2Disabled = false;
                    });
                });
            },
            updateUserEmail(){
                this.$refs['emailForm'].validate((valid)=>{
                    if(!valid) return false;
                    this.$api.auth.updateUserEmail({
                        oldEmailCode: this.user.oldEmailCode,
                        userEmail: this.user.newEmail,
                        newEmailCode: this.user.newEmailCode
                    })
                        .then(()=>{
                            this.$message.success('修改成功');
                            this.reload();
                        })
                        .catch((error)=>{
                            if(error.response.status===400||error.response.status===422)
                                this.$message.error({message:error.response.data.message, showClose:true});
                        })
                });
            },
            handleAvatarSuccess(response, file) {
                this.user.resId = response.data.resId;
                this.user.newResUrl = URL.createObjectURL(file.raw);
                this.user.resUrl = this.user.newResUrl;
            },
            beforeAvatarUpload(file) {
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
            updateUser(){
                let param = {
                    userName: this.user.userName,
                    userSex: this.user.userSex,
                    userBirthday: this.user.userBirthday,
                    userIntro: this.user.userIntro,
                    resId: this.user.resId,
                    oldPassword: this.user.oldPassword,
                    userPassword: this.user.userPassword
                };
                //如果和原来一样就设置为null
                let changeNum=0;
                for(let prop in param){
                    if(param[prop]===this.$store.state.user[prop]){
                        param[prop]=null;
                    }else{
                        changeNum++;
                    }
                }
                if(changeNum===0){
                    this.$message.success('修改成功');
                    return;
                }

                this.$api.auth.updateUser(param)
                .then(()=>{
                    this.$message.success('修改成功');
                    this.reload();
                })
                .catch((error)=>{
                    if(error.response.status===400||error.response.status===422) {
                        this.$message.error('修改失败，' + error.response.data.message);
                    }
                })
            },
            cancel(){
                this.user=JSON.parse(JSON.stringify(this.$store.state.user));
            },
            getUser(){
                this.user=JSON.parse(JSON.stringify(this.$store.state.user));
            },
            fetchData(){
                this.getUser();
            }
        },
        created(){
            this.fetchData();
        },
        watch:{
            '$route': 'fetchData',
            'userInStore': 'fetchData'
        }
    }
</script>

<style scoped>
    .content{
        width: 800px;
        margin: 0 auto;
    }
    .input{
        width: 32em;
    }

    .el-avatar >>> img{
        width: 100%;
        height: 100%;
    }
</style>