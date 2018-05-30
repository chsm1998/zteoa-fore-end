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
                <el-button @click="addPosition" type="primary" icon="el-icon-circle-plus">添加职位</el-button>
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
                        <el-button @click="showPosition(Position.row)" type="text" size="small">查看</el-button>
                        <el-button @click="updatePosition(Position.row)" type="text" size="small">修改</el-button>
                        <el-button @click="deletePosition(Position)" type="text" size="small">删除</el-button>
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
                total: 1,
                ctotal: 1,
                search: '',
                currPage: 1,
                pageSize: 5,
                load: true,
                show: false,
                updateShow: false,
                addShow: false,
                position: {
                    id: '',
                    name: '',
                    createTime: '',
                    modifyTime: ''
                },
                rules: {
                    name: { validator: checkName, trigger: 'blur' }
                }
            }
        },
        created() {
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
                let t = this;
                this.axios.get('/zteoa/position/isAuthority')
                    .then(res => {
                        if (res.data.bl) {
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'success'
                            });
                            this.position.name = '';
                            t.addShow = true;
                        } else {
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'error'
                            });
                        }
                    })
            },
            showPosition: function (position) {
                this.position = position;
                this.show = true;
            },
            updatePosition: function (position) {
                let t = this;
                this.axios.get('/zteoa/position/isAuthority')
                    .then(res => {
                        if (res.data.bl) {
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'success'
                            });
                            this.position = position;
                            t.updateShow = true;
                        } else {
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'error'
                            });
                        }
                    })
            },
            deletePosition: function (position) {
                let t = this;
                this.axios.get('/zteoa/position/isAuthority')
                    .then(res => {
                        if (res.data.bl) {
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
                                        t.total--;
                                        t.ctotal--;
                                        t.tableData.splice(position.$index, 1);
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
                        this.axios.post('/zteoa/position/update', {
                            id: t.position.id,
                            name: t.position.name,
                        })
                            .then(res => {
                                if (res.data) {
                                    t.initPosition();
                                    t.updateShow = false;
                                    this.$message({
                                        showClose: true,
                                        message: '更新成功',
                                        type: 'success'
                                    });
                                } else {
                                    this.$message({
                                        showClose: true,
                                        message: '更新失败，请检查职位id',
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
                            name: t.position.name,
                        })
                            .then(res => {
                                if (res.data) {
                                    t.initPosition();
                                    t.getTotal();
                                    t.addShow = false;
                                    this.$message({
                                        showClose: true,
                                        message: '添加成功',
                                        type: 'success'
                                    });
                                } else {
                                    this.$message({
                                        showClose: true,
                                        message: '更新失败，请检查职位id',
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