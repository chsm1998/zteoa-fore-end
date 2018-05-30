import axios from "axios";
import VueRouter from "vue-router";
import Vue from 'vue';

axios.interceptors.request.use(function (config) {
    let newAxios = axios.create();
    newAxios.post('/zteoa/emp/isLogin')
    .then(res => {
    })
    return config;
}, function (error) {
    return Promise.reject(error);
});