<template>
    <div>
        <el-menu :default-active="activeIndex" mode="horizontal" router>
            <el-menu-item index="1" route="/home">
                <template slot="title">
                    <i class="el-icon-s-home"/>
                    <span>首页</span>
                </template>
            </el-menu-item>

            <el-menu-item index="2" route="/user-page">
                <template slot="title">
                    <i class="el-icon-s-custom"/>
                    <span v-if="$store.state.user">{{$store.state.user.userName}}</span>
                </template>
            </el-menu-item>

            <el-submenu index="3">
                <template slot="title">
                    <i class="el-icon-s-tools"/>
                    <span>设置</span>
                </template>
                <el-menu-item index="3-1" route="/user-setting">用户设置</el-menu-item>
                <el-menu-item index="3-2" route="/change-password">修改密码</el-menu-item>
                <el-menu-item index="3-3" @click="logout">退出</el-menu-item>
            </el-submenu>
        </el-menu>
    </div>
</template>

<script>
    export default {
        name: 'Header',
        props: {
            activeIndex: {
                type: String,
                default(){
                    return '1'
                }
            }
        },
        data() {
            return {

            }
        },
        methods:{
            logout(){
                this.$api.auth.logout();
            }
        }
    }
</script>

<style scoped>

</style>