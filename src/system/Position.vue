<template>
    <div>
        <el-row>
            <el-col :offset="6" :span="8" class="search">
                <el-autocomplete @select="handleSelect" v-model="search" :select-when-unmatched="true" value-key="name" :fetch-suggestions="querySearch"
                    prefix-icon="el-icon-search" placeholder="请输入职位名称" clearable>
                    <template slot="append">
                        <el-button @click="handleSelect" icon="el-icon-search">搜索</el-button>
                    </template>
                </el-autocomplete>
            </el-col>
            <el-col :offset="6" :span="4" class="add">
                <el-button v-if="getAdd()" @click="addPosition" type="primary" icon="el-icon-circle-plus">添加职位</el-button>
            </el-col>
        </el-row>
        <el-row>
            <el-table v-loading="load" :data="tableData" max-height="400" style="width: 100%">
                <el-table-column align="center" prop="id" label="编号">
                </el-table-column>
                <el-table-column align="center" prop="name" label="职位名称">
                </el-table-column>
                <el-table-column align="center" label="创建时间">
                    <template slot-scope="scope">
                        <span>{{ getTime(scope.row.createTime) }}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="修改时间">
                    <template slot-scope="scope">
                        <span>{{ getTime(scope.row.modifyTime) }}</span>
                    </template>
                </el-table-column>
                <el-table-column fixed="right" label="操作">
                    <template slot-scope="Position">
                        <el-button-group>
                            <el-button v-if="select" size="small" @click="showPosition(Position.row)" icon="el-icon-search"></el-button>
                            <el-button v-if="getUpdate()" size="small" @click="updatePosition(Position.row)" type="primary" icon="el-icon-edit"></el-button>
                            <el-button v-if="getDelete()" size="small" @click="deletePosition(Position)" type="danger" icon="el-icon-delete"></el-button>
                        </el-button-group>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>
        <div class="block">
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currPage" :page-sizes="pageSizes"
                :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </div>
        <el-dialog title="职位信息" :visible.sync="show" :center="true">
            <el-form inline class="demo-table-expand">
                <el-form-item label="部门编号">
                    <span>{{ position.id }}</span>
                </el-form-item>
                <el-form-item label="部门名称">
                    <span>{{ position.name }}</span>
                </el-form-item>
                <el-form-item label="创建时间">
                    <span>{{ getTime(position.createTime) }}</span>
                </el-form-item>
                <el-form-item label="修改时间">
                    <span>{{ getTime(position.modifyTime) }}</span>
                </el-form-item>
            </el-form>
        </el-dialog>
        <el-dialog title="修改职位信息" :visible.sync="updateShow" :center="true">
            <el-form :model="position" status-icon :rules="rules" ref="position" label-width="100px">
                <el-form-item label="所属部门" prop="dept.id">
                    <el-select v-model="position.bid" filterable placeholder="请选择所在部门">
                        <el-option v-for="item in depts" :key="item.id" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="职位名称" prop="name">
                    <el-input v-model="position.name"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitForm('position')">修改</el-button>
                    <el-button @click="resetForm('position')">重置</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
        <el-dialog title="添加职位" :visible.sync="addShow" :center="true">
            <el-form :model="position" status-icon :rules="rules" ref="position" label-width="100px">
                <el-form-item label="所属部门" prop="dept.id">
                    <el-select v-model="position.bid" filterable placeholder="请选择所在部门">
                        <el-option v-for="item in depts" :key="item.id" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="职位名称" prop="name">
                    <el-input v-model="position.name"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="addSubmitForm('position')">添加</el-button>
                    <el-button @click="resetForm('position')">重置</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>

    export default {
        name: 'position',
        data: function () {
            let checkName = (rule, value, callback) => {
                let t = this;
                this.axios.get('/zteoa/position/queryByName', {
                    params: {
                        name: t.position.name
                    }
                })
                    .then(res => {
                        if (res.data) {
                            callback();
                        } else {
                            callback(new Error('职位名称已被使用'))
                        }
                    })
            }
            return {
                tableData: [],
                pageSizes: [5, 10, 15, 20],
                depts: [],
                add: false,
                update: false,
                select: false,
                deletes: false,
                authoritys: [],
                total: 1,
                ctotal: 1,
                search: '',
                currPage: 1,
                pageSize: 5,
                load: true,
                show: false,
                updateShow: false,
                addShow: false,
                emps: '',
                position: {
                    id: '',
                    name: '',
                    bid: '',
                    createTime: '',
                    modifyTime: ''
                },
                rules: {
                    name: { validator: checkName, trigger: 'blur' }
                }
            }
        },
        created() {
            this.getAuthoritys();
            this.getEmp();
            this.initPosition();
            this.getTotal();
            this.getCtotal();
        },
        methods: {
            initPosition: function () {
                const t = this;
                this.axios.post('/zteoa/position/queryList', {
                    currPage: t.currPage,
                    pageSize: t.pageSize
                })
                    .then(res => {
                        t.tableData = res.data;
                        t.load = false;
                    })
                    .catch(error => console.log(error));
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
            getEmp: function () {
                let t = this;
                this.axios.get("/zteoa/emp/getEmp")
                    .then(res => {
                        t.emps = res.data;
                    })
            },
            getUpdate: function () {
                if (this.emps.position == null) {
                    return true;
                }
                return this.update;
            },
            getDelete: function () {
                if (this.emps.position == null) {
                    return true;
                }
                return this.deletes;
            },
            getAdd: function () {
                if (this.emps.position == null) {
                    return true;
                }
                return this.add;
            },
            getState: function () {
                let t = this;
                this.authoritys.forEach(authority => {
                    if (authority.type == 1) {
                        t.select = authority.authority;
                    } else if (authority.type == 2) {
                        t.deletes = authority.authority;
                    } else if (authority.type == 3) {
                        t.update = authority.authority;
                    } else {
                        t.add = authority.authority;
                    }
                });
            },
            getAuthoritys: function () {
                let t = this;
                this.axios.get("/zteoa/position/getAuthoritys")
                    .then(res => {
                        t.authoritys = res.data;
                        this.getState();
                    })
            },
            getTime: function (time) {
                let date = new Date(time);
                return date.getFullYear() + '-' + (parseInt(date.getMonth()) + 1) + '-' + date.getDate() + ' ' + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
            },
            handleSelect: function (item) {
                const t = this;
                this.axios.post('/zteoa/position/queryList', {
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
                this.axios.post('/zteoa/position/queryList', {
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
                this.axios.post('/zteoa/position/queryList', {
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
                this.axios.post('/zteoa/position/queryTotal', {
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
                this.axios.post('/zteoa/position/queryTotal', {
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
                this.axios.post('/zteoa/position/queryList', {
                    name: t.search,
                    currPage: 1,
                    pageSize: t.ctotal
                })
                    .then(res => {
                        cb(res.data);
                    })
                    .catch(error => console.log(error));
            },
            addPosition: function () {
                this.getDepts();
                this.position.name = '';
                this.addShow = true;
            },
            showPosition: function (position) {
                this.position = position;
                this.show = true;
            },
            updatePosition: function (position) {
                this.getDepts();
                this.position = position;
                this.updateShow = true;
            },
            deletePosition: function (position) {
                let t = this;
                t.axios.get('/zteoa/position/delete', {
                    params: {
                        id: position.row.id
                    }
                })
                    .then(res => {
                        if (res.data.bl) {
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'success'
                            });
                            this.initPosition();
                            this.getTotal();
                            this.getCtotal();
                        } else {
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'error'
                            });
                        }
                    })
                    .catch(res => {
                        t.$message({
                            showClose: true,
                            message: '服务器异常',
                            type: 'error'
                        });
                    })
            },
            submitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    let t = this;
                    if (valid) {
                        this.axios.post('/zteoa/position/update', {
                            id: t.position.id,
                            bid: t.position.bid,
                            name: t.position.name,
                        })
                            .then(res => {
                                if (res.data.bl) {
                                    t.initPosition();
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
            addSubmitForm(formName) {
                this.$refs[formName].validate((valid) => {
                    let t = this;
                    if (valid) {
                        this.axios.post('/zteoa/position/add', {
                            bid: t.position.bid,
                            name: t.position.name,
                        })
                            .then(res => {
                                if (res.data.bl) {
                                    t.initPosition();
                                    t.getTotal();
                                    t.addShow = false;
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