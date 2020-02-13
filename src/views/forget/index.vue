<template>
    <el-card class="card" mode="horizontal">
        <h1 class="header">找回帐号密码</h1>
        <el-menu :default-active="activeIndex" mode="horizontal" router>
            <el-menu-item index="1" route="/forget/email">通过邮箱找回</el-menu-item>
            <el-menu-item index="2" route="/forget/phone">通过手机找回</el-menu-item>
        </el-menu>
        <router-view/>
        返回<el-button type="text" @click="login">登录</el-button>
    </el-card>
</template>

<script>
    export default {
        name: "Forget",
        data(){
            return {
                activeIndex: '1'
            }
        },
        methods:{
            login(){
                this.$router.push('/login');
            }
        }
    }
</script>

<style scoped>
    .card{
        width: 600px;
        margin-left: auto;
        margin-right: auto;
        margin-top: 50px;
        padding-left: 100px;
        padding-right: 100px;
    }
    .header{
        width:fit-content;
        margin-left: auto;
        margin-right: auto;
    }
</style>