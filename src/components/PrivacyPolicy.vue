<template>
    <div class="privacy-policy-popup">
        <div>
            <button
                @click="closePopup"
                aria-label="Click here to close the popup"
                class="close-button"
            >
                <close-icon />
            </button>

            <h1 class="max-[480px]:mt-4 mb-8 text-3xl text-center font-bold tracking-wider">
                Privacy Policy
            </h1>

            <div class="text-center">
                <p class="font-bold italic text-lg">
                    Thank you for visiting our website. We take your privacy seriously and
                    want you to know how we collect, use, and share your personal
                    information.
                </p>

                <h2 class="font-bold">Information We Collect</h2>
                <p>
                    We collect personal information when you sign up. The personal
                    information we collect may include your name, email address, and any
                    other information you provide to us.
                </p>

                <h2 class="font-bold">How We Use Your Information</h2>
                <p>We may use your personal information to:</p>
                <ul>
                    <li class="flex items-center justify-center">
                        <right-arrow />
                        Send you newsletters, updates, and other information about our
                        products and services
                    </li>
                    <li class="flex items-center justify-center">
                        <right-arrow />
                        Respond to your inquiries and provide customer support
                    </li>
                    <li class="flex items-center justify-center">
                        <right-arrow />
                        Improve our website and services
                    </li>
                </ul>

                <h2 class="font-bold">How We Share Your Information</h2>
                <p>
                    We do not share your personal information with third parties without
                    your consent, except as required by law or as necessary to protect our
                    legal rights.
                </p>

                <h2 class="font-bold">Security</h2>
                <p>
                    We take reasonable measures to protect your personal information from
                    unauthorized access,use, or disclosure. However, no data transmission
                    over the internet can be guaranteed to be 100% secure.
                </p>

                <h2 class="font-bold">Children</h2>
                <p>
                    Our website is not intended for children under the age of 13. We do
                    not knowingly collect personal information from children under the age
                    of 13.
                </p>

                <h2 class="font-bold">Changes to this Privacy Policy</h2>
                <p>
                    We may update this privacy policy from time to time. We encourage you
                    to review this policy periodically for any changes.
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import RightArrow from './Svgs/RightArrow.vue'
import CloseIcon from './Svgs/CloseIcon.vue'
import { defineProps } from 'vue'

defineProps<{
    closePopup: () => void
}>()
</script>

<style scoped>
.privacy-policy-popup {
    @apply absolute inset-x-0 inset-y-10 min-[480px]:inset-x-10 py-8 px-4 min-[480px]:px-8;
    @apply mx-auto max-w-[1200px] font-normal rounded-3xl;
    @apply border-4 border-purple-400 border-double;
    @apply bg-gray-200 dark:bg-gray-800 overflow-scroll scrollbar-invisible;
}

h2 {
    @apply mt-8;
}

.close-button {
    @apply absolute top-0 right-1/2 max-[480px]:translate-x-1/2;
    @apply min-[480px]:top-2 min-[480px]:right-2 p-3 cursor-pointer;
}
</style>