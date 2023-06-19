<template>
    <div>
        <transition name="privacy-policy">
            <theme-toggle
                v-if="!isPrivacyPolicyShown"
                class="px-8 mb-20 max-w-[180px] bg-white dark:bg-gray-700 rounded-b-3xl"
            />
        </transition>
        <main class="auth-main">
            <img
                :src="isDark ? '/img/logo-light.svg' : '/img/logo-dark.svg'"
                alt="Company logo"
                class="mb-4 scale-125 sm:scale-150"
            >
            <form @submit.prevent="handleAuth" class="form">
                <header class="min-[350px]:text-lg first-letter:uppercase">
                    <h2>{{ currentAccountLink.action }}</h2>
                </header>
                <input-text v-model="email" label="Email" type="text" />
                <input-text v-model="password" label="Password" type="password" />
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
            </form>
            <div class="flex flex-wrap justify-center text-sm text-center leading-5">
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
import { useDark } from '@vueuse/core'
import { ref, Ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth'

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

const email: Ref<string | null> = ref(null)
const password: Ref<string | null> = ref(null)
const isPopupShown = ref(false)
const isAuthError = ref(false)
const handleAuth = async (e: Event) => {
    const userStore = useUserStore()

    const method = currentPath === '/' ? signInWithEmailAndPassword : createUserWithEmailAndPassword
    const isUserAuthenticated = await userStore.handleAuth(
        method, email.value, password.value, currentPath
    )

    if (isUserAuthenticated) {
        router.push(`${currentPath === '/sign-up' ? '/' : '/dashboard'}`)
        const form = e.target as HTMLFormElement
        form.reset()
        email.value = null
        password.value = null
    }

    isPopupShown.value = true
    setTimeout(() => {
        isPopupShown.value = false
    }, 2000)
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

.popup-enter-from,
.popup-leave-to {
    @apply -translate-y-[1000px];
}

.popup-enter-active,
.popup-leave-active {
    @apply transition-transform duration-1000;
}
</style>