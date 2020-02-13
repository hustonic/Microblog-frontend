<template>
    <div>
        <el-card class="signup-card">
            <h1 class="header">用户注册</h1>
            <el-tabs v-model="activeName">
                <el-tab-pane name="first">
                    <span slot="label"><i class="el-icon-message"/> 邮箱注册</span>
                    <EmailForm/>
                </el-tab-pane>
                <el-tab-pane name="second">
                    <span slot="label"><i class="el-icon-mobile-phone"/> 手机注册</span>
                    <PhoneForm/>
                </el-tab-pane>
            </el-tabs>
            已有账号？
            <el-button type="text" size="small" @click="login">立即登录！</el-button>
        </el-card>
    </div>
</template>

<script>
    import EmailForm from "./EmailForm";
    import PhoneForm from "./PhoneForm";

    export default {
        name: "Signup",
        data() {
            return {
                activeName: 'first'
            };
        },
        methods:{
            login(){
                this.$router.push('login');
            }
        },
        components:{
            EmailForm, PhoneForm
        }
    }
</script>

<style scoped>
    .signup-card{
        width: 500px;
        margin-top: 50px;
        margin-left: auto;
        margin-right: auto;
        padding: 25px;
    }
    .header{
        width: fit-content;
        margin-left: auto;
        margin-right: auto;
    }
</style>