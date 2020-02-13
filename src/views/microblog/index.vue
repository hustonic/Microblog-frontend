<template>
    <div>
        <el-container class="container">
            <el-header>
                <Header :active-index="activeIndex"/>
            </el-header>
            <el-main class="main">
                <div>
                    <router-view/>
                </div>
                <el-backtop target=".main" :right="100" :bottom="150"/>
            </el-main>
        </el-container>
    </div>
</template>

<script>
    import Header from './header';

    export default {
        name: "Microblog",
        components:{
            Header
        },
        props:{
            activeIndex: {
                type: String,
                default(){
                    return '1'
                }
            }
        },
        data() {
            return {

            };
        },
        methods: {
            getCurrentUser(){
                this.$api.auth.getCurrentUser()
                .then((response)=>{
                    let user=response.data.data;
                    this.$store.commit('setUserId', user.userId);
                    this.$store.commit('setUser', user);
                })
            },
            fetchData(){
                this.getCurrentUser();
            }
        },
        created(){
            this.fetchData();
        },
        watch:{
            '$route': 'fetchData'
        }
    }
</script>

<style scoped>
    .container{
        position: absolute;
        width: 99%;
        height: 98%;
    }
</style>