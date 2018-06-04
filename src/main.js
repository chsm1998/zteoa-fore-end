import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';
import VueRouter from "vue-router";
import axios from "axios";

Vue.use(ElementUI);
Vue.use(VueRouter);

import Foo from "./router/Foo.vue";
import Test from "./router/Test.vue";
import Person from "./system/Personal.vue";
import Dept from "./system/Dept.vue";
import Emp from "./system/emp/EmpAdd.vue";
import Home from "./Home.vue";
import Login from "./Login.vue";
import Position from "./system/Position.vue";
import Product from "./product/product.vue";
import ProductCategory from "./product/productCategory.vue";
import Boardroom from "./metting/MettingRoom.vue";
import BoardroomFacilities from "./metting/BoardroomFacilities.vue";
import BrApply from "./metting/BrApply.vue";
import Receive from "./metting/Receive.vue";

// require('./mock.js');

const routes = [
  {
    path: '/',
    component: Home,
    children: [
      { path: '/foo', component: Foo },
      { path: '/test', component: Test },
      { path: '/person', component: Person },
      { path: '/dept', component: Dept },
      { path: '/empAdd', component: Emp },
      { path: '/position', component: Position },
      { path: '/product', component: Product },
      { path: '/productCategory', component: ProductCategory },
      { path: '/boardroom', component: Boardroom },
      { path: '/boardroomFacilities', component: BoardroomFacilities },
      { path: '/brApply', component: BrApply },
      { path: '/receive', component: Receive },
    ]
  },
  {
    path: '/login',
    component: Login
  }
]


const router = new VueRouter({
  routes
})
let oldAxios = axios.create();
oldAxios.defaults.withCredentials = true
oldAxios.interceptors.request.use(function (config) {
  let newAxios = axios.create();
  newAxios.post('/zteoa/emp/isLogin')
    .then(res => {
      if (!res.data) {
        router.push('/login');
      }
    })
  return config;
}, function (error) {
  return Promise.reject(error);
});

Vue.prototype.axios = oldAxios;

new Vue({
  el: '#app',
  oldAxios,
  router,
  render: h => h(App)
});

