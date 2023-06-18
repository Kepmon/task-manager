<template>
  <div>
    <transition name="fadeIn">
      <theme-toggle
        v-if="!isPrivacyPolicyShown"
        class="px-8 mb-12 max-w-[180px] bg-white dark:bg-gray-700 rounded-b-3xl"
      />
    </transition>
    <main class="auth-main">
      <img
        :src="isDark ? '/img/logo-light.svg' : '/img/logo-dark.svg'"
        alt="Company logo"
        class="mb-4 scale-125 sm:scale-150"
      />
      <Form class="form" @submit="form.handleSubmit">
        <header class="min-[350px]:text-lg first-letter:uppercase">
          <h2>Log in</h2>
        </header>
        <input-text label="Email" name="email" type="email" />
        <input-text label="Password" name="password" type="password" />
        <input-text
          v-if="route.path === '/sign-up'"
          label="Repeat Password"
          name="repeatPassword"
          type="password"
        />
        <the-button
          :regular-button="true"
          :is-in-form="true"
          class="purple-class"
          type="submit"
        >
          Login
        </the-button>
        <p class="text-center">
          Don't have an account?
          <router-link to="/sign-up" class="purple-text">
            Create one
          </router-link>
        </p>
      </Form>
      <div class="flex text-sm text-center">
        <span v-if="currentPath === '/sign-up'"
          >By clicking 'Sign up' you agree to</span
        >&nbsp;
        <the-button
          :regular-button="false"
          class="purple-text"
          @click="isPrivacyPolicyShown = true"
        >
          Privacy Policy
        </the-button>
      </div>
    </main>
    <transition name="privacy-policy">
      <privacy-policy-layout
        v-if="isPrivacyPolicyShown"
        :close-popup="() => (isPrivacyPolicyShown = false)"
        :animation-condition="isPrivacyPolicyShown"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import InputText from "../../components/shared/InputText.vue";
import TheButton from "../../components/shared/TheButton.vue";
import ThemeToggle from "../../components/shared/ThemeToggle.vue";
import PrivacyPolicyLayout from "../Layouts/PrivacyPolicyLayout.vue";
import { useDark } from "@vueuse/core";
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../../stores/user";
import { Form, useForm } from "vee-validate";
import * as Yup from "yup";
import { toTypedSchema } from "@vee-validate/yup";

const isDark = useDark();
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const form = useForm({
  validationSchema: toTypedSchema(
    Yup.object({
      email: Yup.string().required().default(""),
      password: Yup.string().required().default(""),
    })
  ),
});

const currentPath = route.path;
const isPrivacyPolicyShown = ref(false);

const havingAccountLink = computed(() => ({
  "/": {
    action: "Log in",
    goTo: "/sign-up",
    question: "Don't have an account?",
    linkText: "Create one",
  },
  "/sign-up": {
    action: "Sign up",
    goTo: "/",
    question: "Already have an account?",
    linkText: "Log in",
  },
}));

form.handleSubmit(async (values) => {
  await userStore.login({
    email: values.email,
    password: values.password,
  });

  router.push("dashboard");
});
</script>

<style scoped lang="postcss">
.form {
  @apply flex flex-col gap-6 relative p-6 w-[90%] sm:w-[480px];
  @apply rounded-md bg-white dark:bg-gray-700;
}

.purple-text {
  @apply block mx-auto relative w-[max-content] text-purple-400 cursor-pointer;
  @apply after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-[2px];
  @apply after:w-full after:bg-purple-400 after:scale-0 hover:after:scale-100 focus:after:scale-100;
  @apply after:origin-left after:transition-transform after:duration-300 outline-none;
}
</style>
