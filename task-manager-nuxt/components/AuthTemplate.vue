<template>
  <div class="pb-8">
    <transition name="privacy-policy">
      <privacy-policy
        v-if="isPrivacyPolicyShown"
        @close-popup="isPrivacyPolicyShown = false"
        :animationCondition="isPrivacyPolicyShown"
      />
    </transition>

    <transition name="popup">
      <confirmation-popup
        v-if="isPopupShown"
        :isResponseError="isResponseError"
        :errorMessage="errorMessage"
      />
    </transition>

    <theme-toggle
      class="px-8 mb-20 max-w-[180px] bg-white dark:bg-gray-700 rounded-b-3xl"
    />

    <main class="auth-main">
      <logo-icon class="mb-4 scale-125 sm:scale-150 border-none" />
      <form @submit.prevent="onSubmit" class="form">
        <header class="xs:text-lg first-letter:uppercase">
          <h2>{{ currentPath.action }}</h2>
        </header>

        <auth-input label="Email" name="email" type="email" />
        <auth-input label="Password" name="password" type="password" />
        <auth-input
          v-if="path === '/sign-up'"
          label="Repeat Password"
          name="repeatPassword"
          type="password"
        />

        <button
          class="regular-button purple-class"
          :disabled="form.meta.value.valid === false || buttonLoading"
        >
          {{ buttonLoading ? 'Loading...' : currentPath.action }}
        </button>

        <p class="text-center">
          {{ currentPath.question }}
          <nuxt-link :to="currentPath.goTo" class="purple-text">
            {{ currentPath.linkText }}
          </nuxt-link>
        </p>
      </form>

      <div class="flex flex-wrap justify-center text-sm text-center leading-5">
        <span v-if="path === '/sign-up'"
          >By clicking 'Sign up' you agree to</span
        >&nbsp;
        <button @click="isPrivacyPolicyShown = true" class="purple-text">
          Privacy Policy
        </button>
      </div>
    </main>
    <slot />
  </div>
</template>

<script setup lang="ts">
import LogoIcon from '~/components/svgs/LogoIcon.vue'
import AuthInput from '~/components/inputs/AuthInput.vue'
import {
  isPopupShown,
  isResponseError,
  handleResponse
} from '../composables/responseHandler'
import * as Yup from 'yup'

const isDark = useDark()
const isPrivacyPolicyShown = ref(false)

const availablePaths = {
  '/': {
    action: 'Log in',
    goTo: 'sign-up' ,
    question: "Don't have an account?",
    linkText: 'Create one'
  },
  '/sign-up': {
    action: 'Sign up',
    goTo: '/',
    question: 'Already have an account?',
    linkText: 'Log in'
  }
}

const route = useRoute()
const path = route.path
const currentPath = ref(availablePaths[path as keyof typeof availablePaths])

const emailCondition =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i

const authFormSchema = Yup.object({
  email: Yup.string()
    .required("Can't be empty")
    .matches(emailCondition, 'Must be a valid email'),
  password: Yup.string()
    .min(8, 'Must be at least 8 characters long')
    .required("Can't be empty"),
  repeatPassword: Yup.string().when('curentPath', {
    is: () => path === '/sign-up',
    then: () =>
      Yup.string()
        .required("Can't be empty")
        .oneOf([Yup.ref('password')], 'Passwords do not match')
  })
})

const form = useForm({
  validationSchema: toTypedSchema(authFormSchema)
})

const errorMessage = ref('')
const buttonLoading = ref(false)
const onSubmit = form.handleSubmit(async (values) => {
  const submitFn = path === '/' ? userStore.logIn : userStore.register

  buttonLoading.value = true
  const response = await submitFn(values.email, values.password)

  if (response.ok === false) {
    errorMessage.value = response.errorMessage
  }

  handleResponse(response.ok, '/dashboard', buttonLoading)
})
</script>

<style lang="postcss" scoped>
.form {
  @apply grid gap-6 relative p-6 w-[90%] sm:w-[480px];
  @apply rounded-md bg-white dark:bg-gray-700;
}

.purple-text {
  @apply block mx-auto relative w-max text-purple-400 cursor-pointer;
  @apply after:absolute after:-bottom-1 after:left-0 after:h-[3px];
  @apply after:w-full after:bg-purple-400 after:scale-x-0;
  @apply hover:after:scale-x-100 focus-visible:after:scale-x-100;
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
