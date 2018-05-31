<template>
    <div>
        <el-row>
            <el-col :offset="4" :span="10" class="search">
                <el-autocomplete @select="handleSelect" v-model="search" :select-when-unmatched="true" value-key="category" :fetch-suggestions="querySearch"
                    prefix-icon="el-icon-search" placeholder="请输入用品类别" clearable>
                    <template slot="append">
                        <el-button @click="handleSelect" icon="el-icon-search">搜索</el-button>
                    </template>
                </el-autocomplete>
            </el-col>
            <el-col :offset="6" :span="4" class="add">
                <el-button @click="addProductCategory" type="primary" icon="el-icon-circle-plus">添加用品类别</el-button>
            </el-col>
        </el-row>
        <el-row>
            <el-table v-loading="load" :data="tableData" max-height="400" style="width: 100%">
                <el-table-column align="center" prop="id" label="类别编号">
                </el-table-column>
                <el-table-column align="center" prop="category" label="类别名称">
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
                    <template slot-scope="ProductCategory">
                        <el-button-group>
                            <el-button size="small" @click="showProductCategory(ProductCategory.row)" icon="el-icon-search"></el-button>
                            <el-button size="small" @click="updateProductCategory(ProductCategory.row)" type="primary" icon="el-icon-edit"></el-button>
                            <el-button size="small" @click="deleteProductCategory(ProductCategory)" type="danger" icon="el-icon-delete"></el-button>
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
        <el-dialog title="用品类别信息" :visible.sync="show" :center="true">
            <el-form inline class="demo-table-expand">
                <el-form-item label="类别编号">
                    <span>{{ productCategory.id }}</span>
                </el-form-item>
                <el-form-item label="类别名称">
                    <span>{{ productCategory.category }}</span>
                </el-form-item>
                <el-form-item label="创建时间">
                    <span>{{ getTime(productCategory.createTime) }}</span>
                </el-form-item>
                <el-form-item label="修改时间">
                    <span>{{ getTime(productCategory.modifyTime) }}</span>
                </el-form-item>
            </el-form>
        </el-dialog>
        <el-dialog title="修改类别信息" :visible.sync="updateShow" :center="true">
            <el-form :model="productCategory" status-icon :rules="rules" ref="productCategory" label-width="100px">
                <el-form-item label="类别名称" prop="category">
                    <el-input v-model="productCategory.category"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submitForm('productCategory')">修改</el-button>
                    <el-button @click="resetForm('productCategory')">重置</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
        <el-dialog title="添加用品类别" :visible.sync="addShow" :center="true">
            <el-form :model="productCategory" status-icon :rules="rules" ref="productCategory" label-width="100px">
                <el-form-item label="类别名称" prop="category">
                    <el-input v-model="productCategory.category"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="addSubmitForm('productCategory')">添加</el-button>
                    <el-button @click="resetForm('productCategory')">重置</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>

    export default {
        name: 'productCategory',
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
                productCategory: {
                    id: '',
                    category: '',
                    createTime: '',
                    modifyTime: ''
                },
            }
        },
        created() {
            this.initProductCategory();
            this.getTotal();
            this.getCtotal();
        },
        methods: {
            initProductCategory: function () {
                const t = this;
                this.axios.post('/zteoa/productCategory/queryList', {
                    currPage: this.currPage,
                    pageSize: this.pageSize
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
                this.currPage = 1;
                this.axios.post('/zteoa/productCategory/queryList', {
                    category: t.search,
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
                this.currPage = 1;
                this.axios.post('/zteoa/productCategory/queryList', {
                    category: t.search,
                    currPage: 1,
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
                this.axios.post('/zteoa/productCategory/queryList', {
                    category: t.search,
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
                this.axios.post('/zteoa/productCategory/queryTotal', {
                    category: t.search,
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
                this.axios.post('/zteoa/productCategory/queryTotal', {
                    category: t.search
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
                this.axios.post('/zteoa/productCategory/queryList', {
                    category: t.search,
                    currPage: 1,
                    pageSize: t.ctotal
                })
                    .then(res => {
                        cb(res.data);
                    })
                    .catch(error => console.log(error));
            },
            addProductCategory: function () {
                let t = this;
                this.axios.get('/zteoa/productCategory/isAuthority')
                    .then(res => {
                        if (res.data.bl) {
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'success'
                            });
                            t.productCategory.category = '';
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
            showProductCategory: function (productCategory) {
                this.productCategory = productCategory;
                this.show = true;
            },
            updateProductCategory: function (productCategory) {
                let t = this;
                this.axios.get('/zteoa/productCategory/isAuthority')
                    .then(res => {
                        if (res.data.bl) {
                            t.$message({
                                showClose: true,
                                message: res.data.message,
                                type: 'success'
                            });
                            this.productCategory = productCategory;
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
            deleteProductCategory: function (productCategory) {
                let t = this;
                this.axios.get('/zteoa/productCategory/isAuthority')
                    .then(res => {
                        if (res.data.bl) {
                            t.axios.get('/zteoa/productCategory/delete', {
                                params: {
                                    id: productCategory.row.id
                                }
                            })
                                .then(res => {
                                    if (res.data.bl) {
                                        t.$message({
                                            showClose: true,
                                            message: '删除成功',
                                            type: 'success'
                                        });
                                        t.total--;
                                        t.ctotal--;
                                        t.tableData.splice(productCategory.$index, 1);
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
                        this.axios.post('/zteoa/productCategory/update', {
                            id: t.productCategory.id,
                            category: t.productCategory.category,
                        })
                            .then(res => {
                                if (res.data) {
                                    t.initProductCategory();
                                    t.updateShow = false;
                                    this.$message({
                                        showClose: true,
                                        message: '更新成功',
                                        type: 'success'
                                    });
                                } else {
                                    this.$message({
                                        showClose: true,
                                        message: '更新失败，请检查用品id',
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
                        this.axios.post('/zteoa/productCategory/add', {
                            category: t.productCategory.category,
                        })
                            .then(res => {
                                if (res.data) {
                                    t.initProductCategory();
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
                                        message: '更新失败，请检查用品id',
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