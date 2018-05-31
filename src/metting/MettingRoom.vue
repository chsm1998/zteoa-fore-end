<template>
    <div>
        <el-row>
            <el-col :offset="6" :span="8" class="search">
                <el-autocomplete @select="handleSelect" v-model="search" :select-when-unmatched="true" value-key="name" :fetch-suggestions="querySearch"
                    prefix-icon="el-icon-search" placeholder="请输入会议室名称" clearable>
                    <template slot="append">
                        <el-button @click="handleSelect" icon="el-icon-search">搜索</el-button>
                    </template>
                </el-autocomplete>
            </el-col>
            <el-col :offset="6" :span="4" class="add">
                <el-button @click="addBoardroom" type="primary" icon="el-icon-circle-plus">添加会议室</el-button>
            </el-col>
        </el-row>
        <el-row>
            <el-table v-loading="load" :data="tableData" max-height="400" style="width: 100%">
                <el-table-column align="center" prop="id" label="会议室编号">
                </el-table-column>
                <el-table-column align="center" prop="name" label="会议室名称">
                </el-table-column>
                <el-table-column align="center" prop="address" label="会议室地址">
                </el-table-column>
                <el-table-column align="center" label="是否可用">
                    <template slot-scope="scope">
                        <span>{{ scope.row.use ? '可用' : '不可用' }}</span>
                    </template>
                </el-table-column>
                <el-table-column fixed="right" label="操作">
                    <template slot-scope="Boardroom">
                        <el-button-group>
                            <el-button size="small" @click="showBoardroom(Boardroom.row)" icon="el-icon-search" ></el-button>
                            <el-button size="small" @click="updateBoardroom(Boardroom.row)" type="primary" icon="el-icon-edit" ></el-button>
                            <el-button size="small" @click="deleteBoardroom(Boardroom)" type="danger" icon="el-icon-delete" ></el-button>
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
        <el-dialog title="会议室信息" :visible.sync="show" :center="true">
            <el-form inline class="demo-table-expand">
                <el-form-item label="会议室编号">
                    <span>{{ boardroom.id }}</span>
                </el-form-item>
                <el-form-item label="会议室名称">
                    <span>{{ boardroom.name }}</span>
                </el-form-item>
                <el-form-item label="会议室地址">
                    <span>{{ boardroom.address }}</span>
                </el-form-item>
                <el-form-item label="是否可用">
                    <span>{{ boardroom.use ? '可用' : '不可用' }}</span>
                </el-form-item>
            </el-form>
        </el-dialog>
        <el-dialog title="修改会议室信息" :visible.sync="updateShow" :center="true">
            <el-form :model="boardroom" status-icon :rules="rules" ref="boardroom" label-width="100px">
                <el-form-item label="会议室编号" prop="id">
                    <el-input v-model="boardroom.id"></el-input>
                </el-form-item>
                <el-form-item label="会议室名称" prop="name">
                    <el-input v-model="boardroom.name"></el-input>
                </el-form-item>
                <el-form-item label="会议室地址" prop="address">
                    <el-input v-model="boardroom.address"></el-input>
                </el-form-item>
                <el-form-item label="是否可用" prop="use">
                    <el-radio v-model="boardroom.use" border :label="true">可用</el-radio>
                    <el-radio v-model="boardroom.use" border :label="false">不可用</el-radio>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitForm('boardroom')">修改</el-button>
                    <el-button @click="resetForm('boardroom')">重置</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
        <el-dialog title="添加会议室" :visible.sync="addShow" :center="true">
            <el-form :model="boardroom" status-icon :rules="rules" ref="boardroom" label-width="100px">
                <el-form-item label="会议室名称" prop="name">
                    <el-input v-model="boardroom.name"></el-input>
                </el-form-item>
                <el-form-item label="会议室地址" prop="address">
                    <el-input v-model="boardroom.address"></el-input>
                </el-form-item>
                <el-form-item label="是否可用" prop="use">
                    <el-radio v-model="boardroom.use" border :label="true">可用</el-radio>
                    <el-radio v-model="boardroom.use" border :label="false">不可用</el-radio>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="addSubmitForm('boardroom')">添加</el-button>
                    <el-button @click="resetForm('boardroom')">重置</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>

    export default {
        name: 'boardroom',
        data: function () {
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
                boardroom: {
                    id: '',
                    name: '',
                    address: '',
                    use: ''
                }
            }
        },
        created() {
            this.initBoardroom();
            this.getTotal();
            this.getCtotal();
        },
        methods: {
            initBoardroom: function () {
                const t = this;
                this.axios.post('/zteoa/boardroom/queryList', {
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
                this.axios.post('/zteoa/boardroom/queryList', {
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
                this.axios.post('/zteoa/boardroom/queryList', {
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
                this.axios.post('/zteoa/boardroom/queryList', {
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
                this.axios.post('/zteoa/boardroom/queryTotal', {
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
                this.axios.post('/zteoa/boardroom/queryTotal', {
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
                this.axios.post('/zteoa/boardroom/queryList', {
                    name: t.search,
                    currPage: 1,
                    pageSize: t.ctotal
                })
                    .then(res => {
                        cb(res.data);
                    })
                    .catch(error => console.log(error));
            },
            addBoardroom: function () {
                let t = this;
                this.axios.get('/zteoa/boardroom/isAuthority')
                    .then(res => {
                        if (res.data.bl) {
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'success'
                            });
                            this.boardroom = '';
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
            showBoardroom: function (boardroom) {
                this.boardroom = boardroom;
                this.show = true;
            },
            updateBoardroom: function (boardroom) {
                let t = this;
                this.axios.get('/zteoa/boardroom/isAuthority')
                    .then(res => {
                        if (res.data.bl) {
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'success'
                            });
                            this.boardroom = boardroom;
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
            deleteBoardroom: function (boardroom) {
                let t = this;
                this.axios.get('/zteoa/boardroom/isAuthority')
                    .then(res => {
                        if (res.data.bl) {
                            t.axios.get('/zteoa/boardroom/delete', {
                                params: {
                                    id: boardroom.row.id
                                }
                            })
                                .then(res => {
                                    if (res.data) {
                                        t.$message({
                                            showClose: true,
                                            message: '删除成功',
                                            type: 'success'
                                        });
                                        t.total--;
                                        t.ctotal--;
                                        t.tableData.splice(boardroom.$index, 1);
                                    } else {
                                        t.$message({
                                            showClose: true,
                                            message: '删除失败',
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
                        this.axios.post('/zteoa/boardroom/update', {
                            id: t.boardroom.id,
                            name: t.boardroom.name,
                            address: t.boardroom.address,
                            use: t.boardroom.use
                        })
                            .then(res => {
                                if (res.data) {
                                    t.initBoardroom();
                                    t.updateShow = false;
                                    this.$message({
                                        showClose: true,
                                        message: '更新成功',
                                        type: 'success'
                                    });
                                } else {
                                    this.$message({
                                        showClose: true,
                                        message: '更新失败，请检查会议室id',
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
                        this.axios.post('/zteoa/boardroom/add', {
                            name: t.boardroom.name,
                            address: t.boardroom.address,
                            use: t.boardroom.use
                        })
                            .then(res => {
                                if (res.data) {
                                    t.initBoardroom();
                                    t.getTotal();
                                    t.addShow = false;
                                    this.$message({
                                        showClose: true,
                                        message: '添加成功',
                                        type: 'success'
                                    });
                                    ctotal++;
                                } else {
                                    this.$message({
                                        showClose: true,
                                        message: '更新失败，请检查会议室id',
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