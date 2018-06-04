<template>
    <div id="all">
        <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="100px">
            <el-form-item label="员工姓名" prop="name">
                <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="用户名" prop="username">
                <el-input v-model="ruleForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input type="password" v-model="ruleForm.password"></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="repassword">
                <el-input type="password" v-model="ruleForm.repassword"></el-input>
            </el-form-item>
            <el-form-item label="家庭住址" prop="address">
                <el-input v-model="ruleForm.address"></el-input>
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
                <el-input type="tel" v-model="ruleForm.phone"></el-input>
            </el-form-item>
            <el-form-item label="所在部门" prop="dept.id">
                <el-select @change="deptChange" v-model="ruleForm.dept.id" filterable placeholder="请选择所在部门">
                    <el-option v-for="item in depts" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="当前职位" prop="position.id">
                <el-select v-model="ruleForm.position.id" filterable placeholder="请选择当前职位">
                    <el-option v-for="item in positions" v-if="isPosition(item)" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm('ruleForm')">立即注册</el-button>
                <el-button @click="resetForm('ruleForm')">重置</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>

    export default {
        data() {
            let checkPwd = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请输入密码'));
                } else {
                    if (this.ruleForm.password !== '') {
                        this.$refs.ruleForm.validateField('repassword');
                    }
                    callback();
                }
            };
            let checkRePwd = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('请再次输入密码'));
                } else if (value !== this.ruleForm.password) {
                    callback(new Error('两次输入密码不一致!'));
                } else {
                    callback();
                }
            };
            let checkPhone = (rule, value, callback) => {
                let reg = /^[1][3,4,5,7,8][0-9]{9}$/;
                if (value === '') {
                    callback(new Error('请输入手机号'));
                } else if (!reg.test(value)) {
                    callback(new Error('请输入正确的手机号'));
                } else {
                    callback();
                }
            };
            let checkUser = (rule, value, callback) => {
                this.axios.get('/zteoa/emp/isRegister', {
                    params: {
                        username: value
                    }
                })
                    .then(res => {
                        if (res.data !== true) {
                            callback(new Error('用户名已被使用'));
                        } else {
                            callback();
                        }
                    })
                    .catch(res => console.log(res))
            }
            return {
                ruleForm: {
                    name: '',
                    username: '',
                    password: '',
                    repassword: '',
                    address: '',
                    phone: '',
                    dept: {
                        id: '',
                    },
                    position: {
                        id: '',
                    },
                },
                depts: [],
                positions: [],
                rules: {
                    name: [
                        { required: true, message: '请输入您的姓名', trigger: 'blur' },
                        { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
                    ],
                    username: [
                        { required: true, message: '请输入用户名', trigger: 'blur' },
                        { min: 6, max: 12, message: '长度在 6 到 12 个字符', trigger: 'blur' },
                        { validator: checkUser, trigger: 'blur' }
                    ],
                    address: [
                        { required: true, message: '请输入用家庭住址', trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: '请输入您的密码', trigger: 'blur' },
                        { validator: checkPwd, trigger: 'blur' }
                    ],
                    repassword: [
                        { required: true, message: '请再次输入密码', trigger: 'blur' },
                        { validator: checkRePwd, trigger: 'blur' }
                    ],
                    phone: [
                        { required: true, message: '请输入手机号', trigger: 'blur' },
                        { validator: checkPhone, trigger: 'blur' }
                    ],
                    deptId: [
                        { required: true, message: '请选择部门', trigger: 'blur'}
                    ],
                    positionId: [
                        { required: true, message: '请选择职位', trigger: 'blur' }
                    ]
                }
            };
        },
        created() {
            this.getDepts();
            this.getPositions();
        },
        methods: {
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    let t = this;
                    if (valid) {
                        this.axios.post('/zteoa/emp/add', {
                            name: t.ruleForm.name,
                            username: t.ruleForm.username,
                            password: t.ruleForm.password,
                            address: t.ruleForm.address,
                            phone: t.ruleForm.phone,
                            pid: t.ruleForm.position.id,
                            did: t.ruleForm.dept.id
                        })
                            .then(res => {
                                if (res.data.bl) {
                                    this.$router.push('/person');
                                } else {
                                    this.$message({
                                        showClose: true,
                                        message: res.data.message,
                                        type: 'error'
                                    });
                                }
                            })
                            .catch(res => console.log(res))
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
            },
            deptChange: function () {
                this.ruleForm.position.id = '';
            },
            isPosition: function (position) {
                if (position.bid == null) {
                    return true;
                }
                return position.bid == this.ruleForm.dept.id;
            },
            getDepts: function () {
                let t = this;
                this.axios.get('/zteoa/dept/queryAll')
                    .then(res => {
                        t.depts = res.data;
                        console.log(t.depts);
                    })
                    .catch(res => console.log(res))
            },
            getPositions: function () {
                let t = this;
                this.axios.get('/zteoa/position/queryAll')
                    .then(res => {
                        t.positions = res.data;
                        console.log(t.positions);
                    })
                    .catch(res => console.log(res))
            }
        }

    }
</script>

<style>
    #all {
        width: 400px;
        margin: 0 auto;
    }
</style>