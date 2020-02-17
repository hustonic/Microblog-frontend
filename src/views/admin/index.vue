<template>
    <el-container>
        <el-aside width="201px">
            <el-menu default-active="1" class="el-menu-vertical">
                <el-menu-item index="1" route="/admin/verification">微博认证审核</el-menu-item>
            </el-menu>
        </el-aside>
        <el-main>
            <router-view/>
        </el-main>
    </el-container>
</template>

<script>
    export default {
        name: "Admin"
    }
</script>

<style scoped>
    .el-menu-vertical:not(.el-menu--collapse) {
        width: 200px;
        min-height: 400px;
    }
</style>