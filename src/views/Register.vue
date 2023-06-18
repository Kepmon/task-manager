<template>
  <div>
    <transition name="fadeIn">
      <theme-toggle
        v-if="!openPrivacyPolicy"
        class="px-8 mb-12 max-w-[180px] bg-white dark:bg-gray-700 rounded-b-3xl"
      />
    </transition>
    <main class="auth-main">
      <img
        :src="isDark ? '/img/logo-light.svg' : '/img/logo-dark.svg'"
        alt="Company logo"
        class="mb-4 scale-125 sm:scale-150"
      />
      <form class="form" @submit="submit">
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
          class="purple-class"
          :disabled="form.isSubmitting.value"
        >
          Register
        </the-button>
        <p class="text-center">
          Already have an account?
          <router-link to="/" class="purple-text"> Log in </router-link>
        </p>
      </form>
      <div class="text-sm text-center">
        <span>By clicking 'Sign up' you agree to </span>
        <the-button
          :regular-button="false"
          class="purple-text inline"
          @click="openPrivacyPolicy = true"
        >
          Privacy Policy
        </the-button>
      </div>
    </main>
    <transition name="fadeIn">
      <privacy-policy-layout
        v-if="openPrivacyPolicy"
        :close-popup="() => (openPrivacyPolicy = false)"
        :animation-condition="openPrivacyPolicy"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import InputText from "../components/shared/InputText.vue";
import TheButton from "../components/shared/TheButton.vue";
import ThemeToggle from "../components/shared/ThemeToggle.vue";
import PrivacyPolicyLayout from "../components/Layouts/PrivacyPolicyLayout.vue";
import { useDark } from "@vueuse/core";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { useForm } from "vee-validate";
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
      repeatPassword: Yup.string()
        .required()
        .oneOf([Yup.ref("password")], "Passwords do not match")
        .default(""),
    })
  ),
});

const openPrivacyPolicy = ref(false);

const submit = form.handleSubmit(async (values) => {
  await userStore.register({
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
  @apply mx-auto relative w-[max-content] text-purple-400 cursor-pointer;
  @apply after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-[2px];
  @apply after:w-full after:bg-purple-400 after:scale-0 hover:after:scale-100 focus:after:scale-100;
  @apply after:origin-left after:transition-transform after:duration-300 outline-none;
}
</style>
