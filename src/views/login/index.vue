<template>
    <div>
        <el-card class="login-pane">
            <h1 class="login-header">登录Microblog</h1>
            <el-form ref="form" :model="form" :rules="formRules">
                <el-form-item prop="username">
                    <el-input v-model="form.username" prefix-icon="fa fa-user" placeholder="邮箱/手机号" clearable/>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" v-model="form.password" prefix-icon="fa fa-lock" placeholder="请输入密码"
                              clearable/>
                </el-form-item>
                <el-form-item>
                    <el-button type="text" size="small" @click="forgetPassword" class="forget-password">忘记密码
                    </el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitForm('form')" class="button-login">登录</el-button>
                </el-form-item>
                <el-form-item>
                    还没有微博？
                    <el-button type="text" size="small" @click="signup">立即注册!</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script>
    export default {
        name: "Login",
        data() {
            const validateUsername=(rule, value, callback)=>{
                if(!value){
                    return callback(new Error('请输入用户名'));
                }else{
                    return callback();
                }
            };
            const validatePassword=(rule, value, callback)=>{
                if(!value){
                    return callback(new Error('请输入密码'));
                }else{
                    return callback();
                }
            };
            return {
                form: {
                    username: '',
                    password: ''
                },
                formRules: {
                    username:[
                        {validator: validateUsername, trigger: 'blur'}
                    ],
                    password:[
                        {validator: validatePassword, trigger: 'blur'}
                    ]
                }
            }
        },
        methods: {
            submitForm(formName){
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.login();
                    } else {
                        return false;
                    }
                });
            },
            login() {
                this.$api.auth.login(this.form)
                    .then((response) => {
                        this.$store.commit('setToken', response.data.access_token);
                        this.$message.success({message: '登录成功', showClose: true});
                        this.$router.push('/');
                    })
                    .catch((error) => {
                        if (error.response.status === 400) {
                            this.$message.error({message: '用户名或密码错误', showClose: true});
                        }
                    });
            },
            forgetPassword(){
                this.$router.push('forget');
            },
            signup(){
                this.$router.push('signup');
            }
        }
    }
</script>

<style scoped>
    .login-pane{
        width: 400px;
        padding-left: 50px;
        padding-right: 50px;
        padding-top: 20px;
        margin-left: auto;
        margin-right: auto;
        margin-top: 100px;
    }
    .login-header{
        margin-left: auto;
        margin-right: auto;
        width: fit-content;
    }
    .forget-password{
        float: right;
    }
    .button-login{
        width: 360px;
    }
</style>