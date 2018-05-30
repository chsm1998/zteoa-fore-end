<template>
    <div>
        <el-row>
            <el-col :offset="6" :span="8" class="search">
                <el-autocomplete @select="handleSelect" v-model="search" :select-when-unmatched="true" value-key="name" :fetch-suggestions="querySearch"
                    prefix-icon="el-icon-search" placeholder="请输入员工姓名" clearable>
                    <template slot-scope="{ item }">
                        <span>{{ item.name }}</span>
                        <span>{{ item.dept.name }}</span>
                    </template>
                    <template slot="append">
                        <el-button @click="handleSelect" icon="el-icon-search">搜索</el-button>
                    </template>
                </el-autocomplete>
            </el-col>
            <el-col :offset="6" :span="4" class="add">
                <el-button @click="empAdd" type="primary" icon="el-icon-circle-plus">添加员工</el-button>
            </el-col>
        </el-row>
        <el-row>
            <el-table v-loading="load" :data="tableData" max-height="400" style="width: 100%">
                <el-table-column align="center" prop="id" label="编号">
                </el-table-column>
                <el-table-column align="center" prop="name" label="姓名">
                </el-table-column>
                <el-table-column align="center" prop="address" label="地址" width="220">
                </el-table-column>
                <el-table-column align="center" prop="phone" label="手机">
                </el-table-column>
                <el-table-column align="center" prop="position.name" label="部门">
                </el-table-column>
                <el-table-column align="center" prop="dept.name" label="职位">
                </el-table-column>
                <el-table-column fixed="right" label="操作">
                    <template slot-scope="emp">
                        <el-button @click="showEmp(emp.row)" type="text" size="small">查看</el-button>
                        <el-button @click="updateEmp(emp.row)" type="text" size="small">修改</el-button>
                        <el-button @click="deleteEmp(emp)" type="text" size="small">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>
        <div class="block">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currPage" :page-sizes="pageSizes"
                :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </div>
        <el-dialog title="员工信息" :visible.sync="show" :center="true">
            <el-form inline class="demo-table-expand">
                <el-form-item label="员工编号">
                    <span>{{ emp.id }}</span>
                </el-form-item>
                <el-form-item label="员工姓名">
                    <span>{{ emp.name }}</span>
                </el-form-item>
                <el-form-item label="家庭住址">
                    <span>{{ emp.address }}</span>
                </el-form-item>
                <el-form-item label="员工手机">
                    <span>{{ emp.phone }}</span>
                </el-form-item>
                <el-form-item label="所在部门">
                    <span>{{ emp.dept.name }}</span>
                </el-form-item>
                <el-form-item label="在职职位">
                    <span>{{ emp.position.name }}</span>
                </el-form-item>
            </el-form>
        </el-dialog>
        <el-dialog title="修改员工信息" :visible.sync="updateShow" :center="true">
            <el-form :model="emp" status-icon :rules="rules" ref="emp" label-width="100px">
                <el-form-item label="员工姓名" prop="name">
                    <el-input v-model="emp.name"></el-input>
                </el-form-item>
                <el-form-item label="家庭住址" prop="address">
                    <el-input v-model="emp.address"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                    <el-input type="tel" v-model="emp.phone"></el-input>
                </el-form-item>
                <el-form-item label="所在部门" prop="dept.id">
                    <el-select v-model="emp.dept.id" filterable placeholder="请选择所在部门">
                        <el-option v-for="item in depts" :key="item.id" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="当前职位" prop="position.id">
                    <el-select v-model="emp.position.id" filterable placeholder="请选择当前职位">
                        <el-option v-for="item in positions" :key="item.id" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitForm('emp')">立即修改</el-button>
                    <el-button @click="resetForm('emp')">重置</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>

    export default {
        name: 'personal',
        data: function () {
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
            return {
                tableData: [],
                pageSizes: [5, 10, 15, 20],
                total: 1,
                ctotal: 1,
                search: '',
                currPage: 1,
                pageSize: 5,
                emp: {
                    name: '',
                    id: '',
                    address: '',
                    phone: '',
                    dept: {
                        name: ''
                    },
                    position: {
                        name: ''
                    },
                },
                show: false,
                updateShow: false,
                load: true,
                depts: [],
                positions: [],
                rules: {
                    name: [
                        { required: true, message: '请输入您的姓名', trigger: 'blur' },
                        { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
                    ],
                    address: [
                        { required: true, message: '请输入用家庭住址', trigger: 'blur' }
                    ],
                    phone: [
                        { required: true, message: '请输入手机号', trigger: 'blur' },
                        { validator: checkPhone, trigger: 'blur' }
                    ]
                }
            }
        },
        created() {
            this.setNewsApi();
            this.getTotal();
            this.getCtotal();
        },
        methods: {
            setNewsApi: function () {
                const t = this;
                this.axios.post('/zteoa/emp/queryList', {
                    currPage: t.currPage,
                    pageSize: t.pageSize
                })
                    .then(res => {
                        t.tableData = res.data;
                        t.load = false;
                    })
                    .catch(error => console.log(error));
            },
            handleSelect: function (item) {
                const t = this;
                this.axios.post('/zteoa/emp/queryList', {
                    name: t.search,
                    currPage: 1,
                    pageSize: t.pageSize
                })
                    .then(res => {
                        t.getTotal();
                        t.tableData = res.data;
                        t.load = false;
                    })
                    .catch(error => console.log(error));
            },
            handleSizeChange: function (val) {
                const t = this;
                t.pageSize = val;
                this.axios.post('/zteoa/emp/queryList', {
                    currPage: t.currPage,
                    pageSize: val
                })
                    .then(res => {
                        t.tableData = res.data;
                        t.load = false;
                    })
                    .catch(error => console.log(error));
            },
            handleCurrentChange: function (val) {
                const t = this;
                t.currPage = val;
                this.axios.post('/zteoa/emp/queryList', {
                    currPage: val,
                    pageSize: t.pageSize
                })
                    .then(res => {
                        t.tableData = res.data;
                        t.load = false;
                    })
                    .catch(error => console.log(error));
            },
            getTotal: function () {
                const t = this;
                this.axios.post('/zteoa/emp/queryTotal', {
                    name: t.search
                })
                    .then(res => {
                        t.total = res.data;
                    })
                    .catch(res => {
                        this.$message({
                            showClose: true,
                            message: '服务器异常' + res,
                            type: 'error'
                        });
                    })
            },
            getCtotal: function () {
                const t = this;
                this.axios.post('/zteoa/emp/queryTotal', {
                    name: t.search
                })
                    .then(res => {
                        t.ctotal = res.data;
                    })
                    .catch(res => {
                        this.$message({
                            showClose: true,
                            message: '服务器异常' + res,
                            type: 'error'
                        });
                    })
            },
            querySearch: function (queryString, cb) {
                const t = this;
                this.axios.post('/zteoa/emp/queryList', {
                    name: t.search,
                    currPage: 1,
                    pageSize: t.ctotal
                })
                    .then(res => {
                        cb(res.data);
                    })
                    .catch(error => console.log(error));
            },
            empAdd: function () {
                let t = this;
                this.axios.get('/zteoa/emp/isAuthority')
                    .then(res => {
                        if (res.data.bl) {
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'success'
                            });
                            t.$router.push('/empAdd');
                        } else {
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'error'
                            });
                        }
                    })
            },
            showEmp: function (emp) {
                this.emp = emp;
                this.show = true;
            },
            updateEmp: function (emp) {
                let t = this;
                this.axios.post('/zteoa/emp/isAuthority', {
                    id: emp.id,
                    name: emp.name,
                    username: emp.username,
                    password: emp.password,
                    address: emp.address,
                    phone: emp.phone,
                    pid: emp.position.id,
                    did: emp.dept.id
                })
                    .then(res => {
                        if (res.data.bl) {
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'success'
                            });
                            this.getDepts();
                            this.getPositions();
                            this.emp = emp;
                            this.updateShow = true;
                        } else {
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'error'
                            });
                        }
                    })
            },
            deleteEmp: function (emp) {
                let t = this;
                this.axios.post('/zteoa/emp/isAuthority', {
                    id: emp.row.id,
                    name: emp.row.name,
                    username: emp.row.username,
                    password: emp.row.password,
                    address: emp.row.address,
                    phone: emp.row.phone,
                    pid: emp.row.position.id,
                    did: emp.row.dept.id
                })
                    .then(res => {
                        if (res.data.bl) {
                            this.axios.get('/zteoa/emp/delete', {
                                params: {
                                    id: emp.row.id
                                }
                            })
                                .then(res => {
                                    if (res.data) {
                                        this.$message({
                                            showClose: true,
                                            message: '删除成功',
                                            type: 'success'
                                        });
                                        t.total--;
                                        t.ctotal--;
                                        t.tableData.splice(emp.$index, 1);
                                    } else {
                                        this.$message({
                                            showClose: true,
                                            message: '删除失败',
                                            type: 'error'
                                        });
                                    }
                                })
                                .catch(res => {
                                    this.$message({
                                        showClose: true,
                                        message: '服务器异常',
                                        type: 'error'
                                    });
                                })
                        } else {
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'error'
                            });
                        }
                    })
            },
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    let t = this;
                    if (valid) {
                        this.axios.post('/zteoa/emp/update', {
                            id: t.emp.id,
                            name: t.emp.name,
                            username: t.emp.username,
                            password: t.emp.password,
                            address: t.emp.address,
                            phone: t.emp.phone,
                            pid: t.emp.position.id,
                            did: t.emp.dept.id
                        })
                            .then(res => {
                                if (res.data.bl) {
                                    t.setNewsApi();
                                    t.updateShow = false;
                                    this.$message({
                                        showClose: true,
                                        message: res.data.message,
                                        type: 'success'
                                    });
                                } else {
                                    this.$message({
                                        showClose: true,
                                        message: res.data.message,
                                        type: 'error'
                                    });
                                }
                            })
                            .catch(res => {
                                this.$message({
                                    showClose: true,
                                    message: '更新失败，服务器异常',
                                    type: 'error'
                                });
                                console.log(res);
                            })
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
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
    .demo-table-expand {
        font-size: 0;
    }

    .demo-table-expand label {
        width: 90px;
        color: #99a9bf;
    }

    .demo-table-expand .el-form-item {
        margin-right: 0;
        margin-bottom: 0;
        width: 50%;
    }
</style>