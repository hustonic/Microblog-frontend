<template>
    <el-form ref="form" :model="form" label-width="85px" label-suffix="：" :rules="formRules" label-position="right" class="form">
        <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入要找回密码的邮箱" clearable/>
        </el-form-item>
        <el-form-item label="验证码" prop="validationCode">
            <el-input v-model="form.validationCode" placeholder="请输入6位数字验证码" clearable>
                <el-button @click="getValidationCode" slot="append" :disabled="validButtonDisabled">{{validButtonText}}</el-button>
            </el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
            <el-input type="password" v-model="form.newPassword" placeholder="请输入新密码，6～16位字母、数字或符号" clearable/>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
            <el-input type="password" v-model="form.confirmPassword" placeholder="请再次输入相同的密码" clearable/>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="submit" class="btn-submit">提交</el-button>
        </el-form-item>
    </el-form>
</template>

<script>
    export default {
        name: "Email",
        data(){
            const checkEmail = (rule, value, callback)=>{
                if(!value) return callback(new Error('请输入邮箱'));
                if(!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value))
                    return callback(new Error('邮箱格式不正确'));
                return callback();
            };
            const checkValidationCode = (rule, value, callback)=>{
                if(!value) return callback(new Error('请输入验证码'));
                if(!/^\d{6}$/.test(value))
                    return callback(new Error('验证码为6位数字'));
                return callback();
            };
            const checkNewPassword = (rule, value, callback)=>{
                if(!value) return callback(new Error('请输入密码'));
                if(this.form.confirmPassword && value !== this.form.confirmPassword)
                    return callback(new Error('两次输入密码不一致'));
                if(!/^[^\u4E00-\u9FA5\n]{6,16}$/.test(value))
                    return callback(new Error('密码为6～16位字母、数字或符号'));
                return callback();
            };
            const checkConfirmPassword = (rule, value, callback)=>{
                if(!value) return callback(new Error('请再次输入密码'));
                if(value !== this.form.newPassword)
                    return callback(new Error('两次输入密码不一致'));
                return callback();
            };
            return {
                formRules:{
                    email: [{validator:checkEmail, trigger:'blur'}],
                    validationCode: [{validator:checkValidationCode, trigger: 'blur'}],
                    newPassword: [{validator:checkNewPassword, trigger: 'blur'}],
                    confirmPassword: [{validator:checkConfirmPassword, trigger: 'blur'}]
                },
                form:{
                    email: '',
                    validationCode: '',
                    newPassword: '',
                    confirmPassword: ''
                },
                validButtonDisabled: false,
                validButtonText: '发送验证码到邮箱',
                second: 0
            }
        },
        methods:{
            submit(){
                this.$refs['form'].validate((valid)=>{
                   if(!valid)
                       return false;
                    this.$api.auth.findPassword({
                       emailOrPhone: this.form.email,
                       validationCode: this.form.validationCode,
                       newPassword: this.form.newPassword,
                       validationType: this.$api.auth.enums.validationType.FIND_PASSWORD_BY_EMAIL
                   }).then(()=>{
                       this.$alert('修改密码成功','修改密码成功',{confirmButtonText:'确定'});
                       this.$refs['form'].resetFields();
                   }).catch((error)=>{
                       if(error.response.status===400||error.response.status===422)
                           this.$message.error({message:error.response.data.message, showClose:true});
                   });
                });
            },
            getValidationCode(){
                this.$refs['form'].validateField('email', (error)=>{
                    if(error) {
                        return false;
                    }
                    this.validButtonDisabled=true;
                    this.$api.auth.sendValidationCode({
                        email: this.form.email,
                        validationType: this.$api.auth.enums.validationType.FIND_PASSWORD_BY_EMAIL
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
    .form{
        margin: 50px;
    }
    .btn-submit{
        width: 60%;
    }
</style>