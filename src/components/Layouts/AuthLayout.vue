<template>
  <div class="pb-8">
    <transition name="privacy-policy">
      <theme-toggle
        class="px-8 mb-20 max-w-[180px] bg-white dark:bg-gray-700 rounded-b-3xl"
      />
    </transition>
    <main class="auth-main">
      <logo-icon
        aria-label="The app logo"
        class="mb-4 scale-125 sm:scale-150"
      />
      <form @submit.prevent="handleAuth" class="form">
        <header class="xs:text-lg first-letter:uppercase">
          <h2>{{ currentAccountLink.action }}</h2>
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
          :regularButton="true"
          :isInForm="true"
          class="purple-class"
          :disabled="form.isSubmitting.value"
        >
          {{ currentAccountLink.action }}
        </the-button>
        <p class="text-center">
          {{ currentAccountLink.question }}
          <router-link :to="currentAccountLink.goTo" class="purple-text">
            {{ currentAccountLink.linkText }}
          </router-link>
        </p>
      </form>
      <div class="flex flex-wrap justify-center text-sm text-center leading-5">
        <span v-if="currentPath === '/sign-up'"
          >By clicking 'Sign up' you agree to</span
        >&nbsp;
        <the-button
          @click="isPrivacyPolicyShown = true"
          :regularButton="false"
          class="purple-text"
        >
          Privacy Policy
        </the-button>
      </div>
    </main>
    <transition name="privacy-policy">
      <privacy-policy-layout
        v-if="isPrivacyPolicyShown"
        @close-popup="isPrivacyPolicyShown = false"
        :animationCondition="isPrivacyPolicyShown"
      />
    </transition>
    <transition name="popup">
      <confirmation-popup v-show="isPopupShown" :isError="isAuthError" />
    </transition>
  </div>
</template>

<script setup lang="ts">
import InputText from '../../components/shared/InputText.vue'
import TheButton from '../../components/shared/TheButton.vue'
import ThemeToggle from '../../components/shared/ThemeToggle.vue'
import ConfirmationPopup from '../../components/shared/ConfirmationPopup.vue'
import PrivacyPolicyLayout from './PrivacyPolicyLayout.vue'
import LogoIcon from '../Svgs/LogoIcon.vue'
import { useDark } from '@vueuse/core'
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth'
import { useForm } from 'vee-validate'
import * as Yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

const isDark = useDark()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const currentPath = route.path
const isPrivacyPolicyShown = ref(false)

const havingAccountLink = computed(() => ({
  '/': {
    action: 'Log in',
    goTo: '/sign-up',
    question: "Don't have an account?",
    linkText: 'Create one'
  },
  '/sign-up': {
    action: 'Sign up',
    goTo: '/',
    question: 'Already have an account?',
    linkText: 'Log in'
  }
}))
const currentAccountLink = ref(
  havingAccountLink.value[currentPath as keyof typeof havingAccountLink.value]
)

const emailCondition =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
const form = useForm({
  initialValues: {
    currentPath
  },
  validationSchema: toTypedSchema(
    Yup.object({
      currentPath: Yup.string(),
      email: Yup.string()
        .required("Can't be empty")
        .matches(emailCondition, 'Must be a valid email'),
      password: Yup.string()
        .min(8, 'Must be at least 8 characters long')
        .required("Can't be empty"),
      repeatPassword: Yup.string().when('curentPath', {
        is: () => currentPath === '/sign-up',
        then: () =>
          Yup.string()
            .required("Can't be empty")
            .oneOf([Yup.ref('password')], 'Passwords do not match')
      })
    })
  )
})
const isPopupShown = ref(false)
const isAuthError = ref(false)
const handleAuth = form.handleSubmit(async (values) => {
  const method =
    currentPath === '/'
      ? signInWithEmailAndPassword
      : createUserWithEmailAndPassword

  const isUserAuthenticated = await userStore.handleAuth(
    method,
    values.email,
    values.password,
    currentPath
  )

  if (!isUserAuthenticated) {
    isAuthError.value = true
  }

  if (isUserAuthenticated) {
    isAuthError.value = false
    setTimeout(() => {
      router.push(`${currentPath === '/sign-up' ? '/' : '/dashboard'}`)
    }, 2000)
  }

  isPopupShown.value = true
  setTimeout(() => {
    isPopupShown.value = false
  }, 2000)
})
</script>

<style scoped>
.form {
  @apply flex flex-col gap-6 relative p-6 w-[90%] sm:w-[480px];
  @apply rounded-md bg-white dark:bg-gray-700;
}

.purple-text {
  @apply block mx-auto relative w-[max-content] text-purple-400 cursor-pointer;
  @apply after:absolute after:-bottom-1 after:left-0 after:h-[2px];
  @apply after:w-full after:bg-purple-400 after:scale-0 hover:after:scale-100 focus-visible:after:scale-100;
  @apply after:origin-left after:transition-transform after:duration-300 outline outline-transparent;
}

.privacy-policy-enter-from,
.privacy-policy-leave-to {
  @apply opacity-0;
}

.privacy-policy-enter-active,
.privacy-policy-leave-active {
  @apply transition-opacity duration-500;
}
</style>
