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
      <form @submit.prevent="onSubmit" class="form">
        <header class="xs:text-lg first-letter:uppercase">
          <h2>{{ currentAccountLink.action }}</h2>
        </header>
        <auth-input label="Email" name="email" type="email" />
        <auth-input label="Password" name="password" type="password" />
        <auth-input
          v-if="route.path === '/sign-up'"
          label="Repeat Password"
          name="repeatPassword"
          type="password"
        />
        <the-button
          :regularButton="true"
          :isInForm="true"
          class="purple-class"
          :disabled="form.meta.value.valid === false"
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
      <confirmation-popup
        v-show="isPopupShown"
        :isError="isAuthError"
        :errorMessage="errorMessage"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import AuthInput from '../../components/shared/Inputs/AuthInput.vue'
import TheButton from '../../components/shared/TheButton.vue'
import ThemeToggle from '../../components/shared/ThemeToggle.vue'
import ConfirmationPopup from '../../components/shared/ConfirmationPopup.vue'
import PrivacyPolicyLayout from './PrivacyPolicyLayout.vue'
import LogoIcon from '../Svgs/LogoIcon.vue'
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import {
  isAuthError,
  isPopupShown,
  handleAuthResponse
} from '../../composables/authHandler'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth'
import { useForm } from 'vee-validate'
import * as Yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'
import { db, firebaseAuth } from '../../firebase'

const router = useRouter()
const route = useRoute()
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

const errorMessage = ref<string | null>(null)
const onSubmit = form.handleSubmit(async (values) => {
  if (route.path === '/') {
    const request = await signInWithEmailAndPassword(
      firebaseAuth,
      values.email,
      values.password
    )

    if (['reauthenticate', 'signIn'].includes(request.operationType)) {
      // TODO: show succes toast
    }

    // TODO: if request has failed show error toast
  } else {
    // register
    try {
      const res = await createUserWithEmailAndPassword(
        firebaseAuth,
        values.email,
        values.password
      )
      // TODO: write user to db
      await userStore.init(res.user.uid)
    } catch (error) {
      // TODO: show error toast
    }
  }

  if (userStore.isAuthenticated) {
    router.push('/dashboard')
  }
})

// const handleAuth = form.handleSubmit(async (values) => {
//   const method =
//     currentPath === '/'
//       ? signInWithEmailAndPassword
//       : createUserWithEmailAndPassword

//   const response = await userStore.handleAuth(
//     method
//     values.email,
//     values.password,
//     currentPath
//   )

//   if (response !== true) {
//     errorMessage.value = response as string
//   }

//   handleAuthResponse(response)
// })
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
  @apply disabled:cursor-default disabled:hover:after:scale-0;
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
