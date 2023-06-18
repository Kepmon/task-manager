import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "../views/DashboardView.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import PrivacyPolicyView from "../views/PrivacyPolicyView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "login",
      component: Login,
    },
    {
      path: "/sign-up",
      name: "sign-up",
      component: Register,
    },
    {
      path: "/privacy-policy",
      name: "privacy-policy",
      component: PrivacyPolicyView,
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: DashboardView,
    },
  ],
});

export default router;
