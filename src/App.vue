<template>
    <div id="app">
        <!--  这个标签用来承载路由映射的页面  -->
        <router-view v-if="isRouterAlive"/>
    </div>
</template>

<script>
    export default{
        provide(){
            return{
                reload:this.reload  //子组件通过inject:['reload']引入该方法，
            }
        },
        data(){
            return {
                isRouterAlive:true,
            }
        },
        methods:{
            reload(){  //重新渲染组件
                this.isRouterAlive = false;
                this.$nextTick(function () {
                    this.isRouterAlive = true;
                })
            }
        }
    }
</script>

<style>

</style>
