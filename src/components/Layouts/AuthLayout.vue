<template>
    <main class="auth-main">
        <transition name="privacy-policy">
            <theme-toggle
                v-if="!isPrivacyPolicyShown"
                class="absolute -top-2 px-8 max-w-[180px] bg-white dark:bg-gray-700 rounded-b-3xl"
            />
        </transition>

        <img
            :src="isDark ? '/img/logo-light.svg' : '/img/logo-dark.svg'"
            alt="Company logo"
            class="mb-4 scale-125 sm:scale-150"
        >

        <form class="form">
            <header class="min-[350px]:text-lg first-letter:uppercase">
                <h2>{{ currentAccountLink.action }}</h2>
            </header>

            <input-text label="Email" type="input" />
            <input-text label="Password" type="input" />

            <the-button
                :regularButton="true"
                :isInForm="true"
                class="text-white bg-purple-400 hover:bg-purple-100 transition-all duration-300">
                {{ currentAccountLink.action }}
            </the-button>

            <p class="text-center">
                {{ currentAccountLink.question }}
                <router-link :to="currentAccountLink.goTo" class="purple-text">
                    {{ currentAccountLink.linkText }}
                </router-link>
            </p>
        </form>

        <div class="text-sm text-center">
            <span v-if="currentPath === '/sign-up'">By clicking 'Sign up' you agree to</span>&nbsp;
            <the-button
                :regularButton="false"
                @click="isPrivacyPolicyShown = true"
            >
                <span class="purple-text">Privacy Policy</span>
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
</template>

<script setup lang="ts">
import InputText from '../../components/shared/InputText.vue'
import TheButton from '../../components/shared/TheButton.vue'
import ThemeToggle from '../../components/shared/ThemeToggle.vue'
import PrivacyPolicyLayout from './PrivacyPolicyLayout.vue'
import { useDark } from '@vueuse/core'
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const isDark = useDark()
const currentPath = useRoute().path
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
</script>

<style scoped>
.form {
    @apply flex flex-col gap-6 relative p-6 w-[90%] sm:w-[480px];
    @apply rounded-md bg-white dark:bg-gray-700;
}

.purple-text {
    @apply block mx-auto relative w-[max-content] text-purple-400 cursor-pointer;
    @apply after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-[2px];
    @apply after:w-full after:bg-purple-400 after:scale-0 hover:after:scale-100 ;
    @apply after:origin-left after:transition-transform after:duration-300;
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