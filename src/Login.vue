<template>
    <div id="login">
        <el-form label-position="top" :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="login">
            <el-form-item label="用户名：" prop="username">
                <el-input v-model="ruleForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码：" prop="password">
                <el-input type="password" v-model="ruleForm.password"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm('ruleForm')">登录</el-button>
                <el-button @click="resetForm('ruleForm')">重置</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
    import axios from "axios";
    export default {
        name: 'login',
        data() {
            return {
                ruleForm: {
                    username: '',
                    password: ''
                },
                rules: []
            }
        },
        methods: {
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        let t = this;
                        axios.post('/zteoa/emp/login', {
                            username: t.ruleForm.username,
                            password: t.ruleForm.password
                        })
                            .then(res => {
                                if (res.data) {
                                    this.$router.push({ path: '/person' });
                                } else {
                                    t.$message({
                                        showClose: true,
                                        message: '用户名或密码错误',
                                        type: 'error'
                                    });
                                }
                            })
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
            }
        }
    }
</script>

<style>
    .login {
        border: 1px solid #eee;
        padding: 50px;
        width: 300px;
        border-radius: 5px;
    }

    #login {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }
</style>