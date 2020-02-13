<template>
    <div>
        <el-form ref="form" :model="form" :rules="formRules" label-width="100px" label-position="right" label-suffix="：">
            <el-form-item label="邮箱" prop="userEmail">
                <el-input v-model="form.userEmail" placeholder="请输入邮箱" clearable/>
            </el-form-item>
            <el-form-item label="用户名" prop="userName">
                <el-input v-model="form.userName" placeholder="4～30位中英文、数字、_ 、-" clearable/>
            </el-form-item>
            <el-form-item label="设置密码" prop="userPassword">
                <el-input type="password" v-model="form.userPassword" placeholder="6～16位字母、数字或符号" clearable/>
            </el-form-item>
            <el-form-item label="确认密码" prop="userPasswordConfirm">
                <el-input type="password" v-model="form.userPasswordConfirm" placeholder="请再次输入相同的密码" clearable/>
            </el-form-item>
            <el-form-item label="验证码" prop="validationCode">
                <el-input v-model="form.validationCode" placeholder="请输入6位数字验证码" clearable>
                    <el-button @click="getValidationCode" slot="append" :disabled="validButtonDisabled">{{validButtonText}}</el-button>
                </el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm('form')" class="button-submit-form"
                           :disabled="submitButtonDisabled" v-loading="submitButtonDisabled">
                    立即注册
                </el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
    export default {
        name: "EmailForm",
        data(){
            const validateUserEmail = (rule, value, callback)=>{
                if(!value) return callback(new Error('请输入邮箱'));
                if(!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value))
                    return callback(new Error('邮箱格式不正确'));
                return callback();
            };
            const validateUserName = (rule, value, callback)=>{
                if(!value) return callback(new Error('请输入用户名'));
                if(!/^[\u4E00-\u9FA5\w-]{4,30}$/.test(value))
                    return callback(new Error('用户名为4～30位中英文、数字、_ 、-'));
                return callback();
            };
            const validateUserPassword = (rule, value, callback)=>{
                if(!value) return callback(new Error('请输入密码'));
                if(this.form.userPasswordConfirm && value !== this.form.userPasswordConfirm)
                    return callback(new Error('两次输入密码不一致'));
                if(!/^[^\u4E00-\u9FA5\n]{6,16}$/.test(value))
                    return callback(new Error('密码为6～16位字母、数字或符号'));
                return callback();
            };
            const validateUserPasswordConfirm = (rule, value, callback)=>{
                if(!value) return callback(new Error('请再次输入密码'));
                if(value !== this.form.userPassword)
                    return callback(new Error('两次输入密码不一致'));
                return callback();
            };
            const validateValidationCode = (rule, value, callback)=>{
                if(!value) return callback(new Error('请输入验证码'));
                if(!/^\d{6}$/.test(value))
                    return callback(new Error('验证码为6位数字'));
                return callback();
            };
            return {
                formRules:{
                    userEmail:[
                        {validator:validateUserEmail, trigger:'blur'}
                    ],
                    userName:[
                        {validator:validateUserName, trigger:'blur'}
                    ],
                    userPassword:[
                        {validator:validateUserPassword, trigger:'blur'}
                    ],
                    userPasswordConfirm:[
                        {validator:validateUserPasswordConfirm, trigger:'blur'}
                    ],
                    validationCode:[
                        {validator:validateValidationCode, trigger:'blur'}
                    ]
                },
                form:{
                    userEmail:'',
                    userName:'',
                    userPassword:'',
                    userPasswordConfirm:'',
                    validationCode:''
                },
                validButtonDisabled: false,
                validButtonText: '发送验证码到邮箱',
                second: 0,
                submitButtonDisabled: false
            }
        },
        methods:{
            submitForm(formName){
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.signup();
                    } else {
                        return false;
                    }
                });
            },
            signup(){
                this.submitButtonDisabled=true;
                this.$api.auth.signup(this.form)
                    .then(() => {
                        this.$alert('注册成功，现在可以使用此账号登录', '注册成功', {confirmButtonText: '确定'});
                        this.$refs['form'].resetFields();
                    })
                    .catch((error) => {
                        if (error.response.status === 400 || error.response.status === 422)
                            this.$message.error({message: error.response.data.message, showClose: true});
                    })
                    .finally(() => {
                        this.submitButtonDisabled = false;
                    });
            },
            getValidationCode(){
                //先验证表单的userEmail字段
                this.$refs['form'].validateField('userEmail', (error)=>{
                    if(error) {
                        return false;
                    }
                    this.validButtonDisabled=true;
                    this.$api.auth.sendValidationCode({
                        email: this.form.userEmail,
                        validationType: this.$api.auth.enums.validationType.USER_REGISTRATION_VALIDATE_EMAIL
                    }).then(() => {
                        this.$message.success({message: '验证码发送成功，60秒内未收到请重新获取', showClose: true});
                        this.second = 60;
                        this.validButtonText = this.second + '秒后可再次获取';
                        let id = setInterval(() => {
                            if (--this.second <= 0) {
                                this.validButtonDisabled = false;
                                this.validButtonText = '发送验证码到邮箱';
                                clearInterval(id);
                            } else {
                                this.validButtonText = this.second + '秒后可再次获取';
                            }
                        }, 1000);
                    }).catch((error) => {
                        if (error.response.status === 400 || error.response.status === 422)
                            this.$message.error({message: error.response.data.message, showClose: true});
                        this.validButtonDisabled = false;
                    });
                });
            }
        }
    }
</script>

<style scoped>
    .button-submit-form{
        width: 60%;
    }
</style>