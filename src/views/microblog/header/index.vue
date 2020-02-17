<template>
    <div>
        <el-menu :default-active="activeIndex" mode="horizontal" router>
            <el-menu-item index="1" route="/home">
                <template slot="title">
                    <i class="el-icon-s-home"/>
                    <span>关注</span>
                </template>
            </el-menu-item>

            <el-menu-item index="2" route="/all">
                <template slot="title">
                    <i class="el-icon-discover"/>
                    <span>微博广场</span>
                </template>
            </el-menu-item>

            <el-menu-item index="3" route="/user-page">
                <template slot="title">
                    <i class="el-icon-s-custom"/>
                    <span v-if="$store.state.user">{{$store.state.user.userName}}</span>
                </template>
            </el-menu-item>

            <el-menu-item index="4" route="/relation">
                <template slot="title">
                    <i class="el-icon-s-help"/>
                    <span>粉丝/关注</span>
                </template>
            </el-menu-item>

            <el-submenu index="5">
                <template slot="title">
                    <i class="el-icon-s-tools"/>
                    <span>设置</span>
                </template>
                <el-menu-item index="5-1" route="/user-setting">用户设置</el-menu-item>
                <el-menu-item index="5-2" route="/verification" v-if="$store.state.user&&containRole('user')">V认证</el-menu-item>
                <el-menu-item index="5-3" route="/admin" v-if="$store.state.user&&containRole('admin')">管理员中心</el-menu-item>
                <el-menu-item index="5-4" route="/change-password">修改密码</el-menu-item>
                <el-menu-item index="5-5" @click="logout">退出</el-menu-item>
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
            containRole(role){
                let roles=this.$store.state.user.roles;
                for (let index in roles) {
                    if(roles[index]===role){
                        return true;
                    }
                }
                return false;
            },
            logout(){
                this.$api.auth.logout();
            }
        }
    }
</script>

<style scoped>

</style>