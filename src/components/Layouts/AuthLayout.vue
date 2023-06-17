<template>
    <div>
        <transition name="privacy-policy">
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
            >
            <Form @submit="handleAuth" :validation-schema="schema" class="form">
                <header class="min-[350px]:text-lg first-letter:uppercase">
                    <h2>{{ currentAccountLink.action }}</h2>
                </header>
                <input-text
                    @emit-values="(value: string, e: Event) => assignValues(value, e, 'email')"
                    label="Email"
                    name="email"
                    type="email"
                />
                <input-text
                    @emit-values="(value: string, e: Event) => assignValues(value, e, 'password')"
                    label="Password"
                    name="password"
                    type="password"
                />
                <input-text
                    v-if="route.path === '/sign-up'"
                    label="Repeat Password"
                    name="repeatPassword"
                    type="password"
                />
                <the-button
                    :regularButton="true"
                    :isInForm="true"
                    class="purple-class">
                    {{ currentAccountLink.action }}
                </the-button>
                <p class="text-center">
                    {{ currentAccountLink.question }}
                    <router-link :to="currentAccountLink.goTo" class="purple-text">
                        {{ currentAccountLink.linkText }}
                    </router-link>
                </p>
            </Form>
            <div class="flex text-sm text-center">
                <span v-if="currentPath === '/sign-up'">By clicking 'Sign up' you agree to</span>&nbsp;
                <the-button
                    :regularButton="false"
                    @click="isPrivacyPolicyShown = true"
                    class="purple-text"
                >
                    Privacy Policy
                </the-button>
            </div>
        </main>
        <transition name="privacy-policy">
            <privacy-policy-layout
                v-if="isPrivacyPolicyShown"
                :closePopup="() => isPrivacyPolicyShown = false"
                :animationCondition="isPrivacyPolicyShown"
            />
        </transition>
    </div>
</template>

<script setup lang="ts">
import InputText from '../../components/shared/InputText.vue'
import TheButton from '../../components/shared/TheButton.vue'
import ThemeToggle from '../../components/shared/ThemeToggle.vue'
import PrivacyPolicyLayout from './PrivacyPolicyLayout.vue'
import { useDark } from '@vueuse/core'
import { ref, Ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth'
import { Form } from 'vee-validate'
import * as Yup from 'yup'

interface AuthData {
    email: Ref<null | string>,
    password: Ref<null | string>
}
const authData: AuthData = {
    email: ref(null),
    password: ref(null)
}
const assignValues = (value: string, e: Event, type: 'password' | 'email') => {
    if (e.type !== type) return

    authData[type].value = value
}

const isDark = useDark()
const route = useRoute()
const router = useRouter()
const currentPath = route.path
const isPrivacyPolicyShown = ref(false)

const havingAccountLink = computed(() => ({
    '/': {
        action: 'Log in',
        goTo: '/sign-up',
        question: 'Don\'t have an account?',
        linkText: 'Create one'
    },
    '/sign-up': {
        action: 'Sign up',
        goTo: '/',
        question: 'Already have an account?',
        linkText: 'Log in'
    }
}))
const currentAccountLink = ref(havingAccountLink.value[currentPath as keyof typeof havingAccountLink.value])

const schema = Yup.object().shape({
  email: Yup.string().email('Must be a valid email').required("Can't be empty"),
  password: Yup.string().min(8, "Must be at least 8 characters long").required("Can't be empty"),
  repeatPassword: Yup.string()
    .required("Can't be empty")
    .oneOf([Yup.ref('password')], 'Passwords do not match'),
})

const handleAuth = async (e: Event) => {
    const userStore = useUserStore()
    
    const method = currentPath === '/' ? signInWithEmailAndPassword : createUserWithEmailAndPassword
    const isUserAuthenticated = await userStore.handleAuth(
        method, authData.email.value, authData.password.value, currentPath
    )

    if (isUserAuthenticated) {
        router.push(`${currentPath === '/sign-up' ? '/' : '/dashboard'}`)

        currentPath === '/' ? userStore.isLoggedIn = true : userStore.isLoggedIn = false
    }
}
</script>

<style scoped>
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

.privacy-policy-enter-from,
.privacy-policy-leave-to {
    @apply opacity-0;
}

.privacy-policy-enter-active,
.privacy-policy-leave-active {
    @apply transition-opacity duration-500;
}
</style>