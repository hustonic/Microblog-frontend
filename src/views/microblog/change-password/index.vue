<template>
    <div class="content">
        <el-card>
            修改密码
            <el-divider/>
            <el-form ref="form" :model="user" label-position="right" label-width="80px" :rules="rules">
                <el-form-item label="原密码" prop="oldPassword">
                    <el-input v-model="user.oldPassword" type="password" clearable/>
                </el-form-item>
                <el-form-item label="新密码" prop="userPassword">
                    <el-input v-model="user.userPassword" type="password" placeholder="6～16位字母、数字或符号" clearable/>
                </el-form-item>
                <el-form-item label="确认密码" prop="checkPassword">
                    <el-input v-model="user.checkPassword" type="password" clearable/>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submit">提交</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script>
    export default {
        name: "ChangePassword",
        data(){
            const validateOldPassword = (rule, value, callback)=>{
                if(!value) return callback(new Error('请输入原密码'));
                return callback();
            };
            const validateUserPassword = (rule, value, callback)=>{
                if(!value) return callback(new Error('请输入新密码'));
                if(this.user.checkPassword && value !== this.user.checkPassword)
                    return callback(new Error('两次输入的新密码不一致'));
                if(!/^[^\u4E00-\u9FA5\n]{6,16}$/.test(value))
                    return callback(new Error('密码为6～16位字母、数字或符号'));
                return callback();
            };
            const validateCheckPassword = (rule, value, callback)=>{
                if(!value) return callback(new Error('请再次输入新密码'));
                if(value !== this.user.userPassword)
                    return callback(new Error('两次输入的新密码不一致'));
                return callback();
            };
            return {
                user:{
                    oldPassword: '',
                    userPassword: '',
                    checkPassword: ''
                },
                rules:{
                    oldPassword:[
                        {validator: validateOldPassword, trigger: 'blur'}
                    ],
                    userPassword:[
                        {validator: validateUserPassword, trigger: 'blur'}
                    ],
                    checkPassword:[
                        {validator: validateCheckPassword, trigger: 'blur'}
                    ]
                }
            }
        },
        methods:{
            submit(){
                this.$refs['form'].validate((valid) => {
                    if (valid) {
                        this.changePassword();
                    } else {
                        return false;
                    }
                });
            },
            changePassword(){
                this.$api.auth.updateUser(this.user)
                .then(()=>{
                    this.$message.success('修改成功');
                    this.$refs['form'].resetFields();
                })
                .catch((error)=>{
                    if(error.response.status===400||error.response.status===422)
                        this.$message.error({message:error.response.data.message, showClose:true});
                })
            }
        }
    }
</script>

<style scoped>
    .content{
        width: 600px;
        margin: 0 auto;
    }
</style>