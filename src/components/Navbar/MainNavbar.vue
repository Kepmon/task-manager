<template>
    <div class="grid" :class="{'col-span-2': isLogo}">
        <more-options
            :condition="areBoardOptionsShown"
            element="board"
            :showEditForm="() => isEditBoardDialogShown = true"
            :showDeleteForm="() => isDeleteBoardDialogShown = true"
            :toggleOptions="(e: Event) => callMoreOptionsFn(e, toggleOptions)"
            :closeMoreOptions="(e: Event) => callMoreOptionsFn(e, closeOptions)"
        />
        <nav aria-label="main navigation" class="main-nav">
            <div class="flex gap-2 items-center">
                <img
                    src="/img/logo-mobile.svg"
                    alt="app logo"
                    class="sm:hidden h-5 min-[350px]:h-auto"
                />
                <div v-if="isLogo && width >= 640" class="main-nav__logo">
                    <img
                        :src="theme ? '/img/logo-light.svg' : '/img/logo-dark.svg'"
                        alt="app logo"
                        class="h-[26px] w-[153px] pr-6"
                    >
                </div>
                <div @click="toggleBoardsNav" class="flex items-center gap-2">
                    <h1
                        class="font-bold min-[330px]:text-lg"
                        :class="{ 'pl-6': isLogo && width >= 640 }"
                    >
                        {{ boardName }}
                    </h1>
                    <svg
                        v-if="width < 640"
                        width="10"
                        height="7"
                        xmlns="http://www.w3.org/2000/svg"
                        class="transition-transform duration-500"
                        :class="{ 'rotate-180': navOpen }"
                    >
                        <path stroke="#635FC7" stroke-width="2" fill="none" d="m1 1 4 4 4-4"/>
                    </svg>
                </div>
            </div>
            <div class="flex items-center gap-3 min-[350px]:gap-4">
                <the-button
                    @click="isAddTaskDialogShown = true"
                    :regularButton="true"
                    class="gap-[2px] bg-main-purple hover:bg-main-purple-hover transition-all duration-300"
                    :class="{
                        'opacity-25 cursor-not-allowed': dashboard,
                        'cursor-pointer': !dashboard
                    }"
                >
                    <svg width="12" height="12" xmlns="http://www.w3.org/2000/svg" class="scale-[.7]">
                        <path fill="#FFF" d="M7.368 12V7.344H12V4.632H7.368V0H4.656v4.632H0v2.712h4.656V12z"/>
                    </svg>
                    <span v-show="width >= 640" class="text-white">Add New Task</span>
                </the-button>
                <img
                    @click="() => areBoardOptionsShown = !areBoardOptionsShown"
                    src="/img/icon-vertical-ellipsis.svg"
                    alt="click here to see more options"
                    data-ellipsis
                    class="px-1 h-[18px] cursor-pointer min-[350px]:h-auto"
                >
            </div>
        </nav>
        <task-dialog
            v-if="isAddTaskDialogShown"
            action="add"
            :selectedMultiOptionItems="['e.g. Make coffee', 'e.g. Drink coffee & smile']"
            :closeDialog="() => isAddTaskDialogShown = false"
        />
        <confirmation-dialog
            v-if="isDeleteBoardDialogShown"
            elementToDelete="board"
            elementName="Platform Launch"
            :closeDialog="() => isDeleteBoardDialogShown = false"
        />
        <board-dialog
            v-if="isEditBoardDialogShown"
            action="edit"
            :closeDialog="() => isEditBoardDialogShown = false"
            :selectedMultiOptionItems="selectedMultiOptionItems"
        />
    </div>
</template>

<script setup lang="ts">
import TheButton from '../shared/TheButton.vue'
import MoreOptions from '../shared/MoreOptions.vue'
import TaskDialog from '../Dialogs/TaskDialog.vue'
import ConfirmationDialog from '../Dialogs/ConfirmationDialog.vue'
import BoardDialog from '../Dialogs/BoardDialog.vue'
import moreOptionsPopup from '../../composables/moreOptionsPopup'
import { returnBoardProperties } from '../../composables/boardProperties'
import { ref, Ref } from 'vue'

defineProps<{
    sidebar: boolean,
    isLogo: boolean,
    theme: boolean,
    dashboard: boolean,
    width: number,
    boardName: string,
    navOpen: boolean,
    toggleBoardsNav: () => void,
}>()

const areBoardOptionsShown = ref(false)
const isAddTaskDialogShown = ref(false)
const isDeleteBoardDialogShown = ref(false)
const isEditBoardDialogShown = ref(false)

const boardProperties = returnBoardProperties()
const selectedMultiOptionItems = boardProperties.columns.map(column => column.name)

const { toggleOptions, closeOptions } = moreOptionsPopup
const callMoreOptionsFn = (e: Event, cb: (e: Event, conditionToChange: Ref<boolean>) => void) => {
  cb(e, areBoardOptionsShown)
}
</script>

<style scoped>
.main-nav {
    @apply flex items-center justify-between basis-full relative px-3;
    @apply min-[350px]:px-6 shadow-xs bg-white dark:bg-dark-grey;
}

.main-nav__logo {
    @apply flex items-center h-full sm:border-r;
    @apply sm:border-lines-light dark:border-lines-dark;
}

.main-nav__button {
    @apply flex gap-2 items-center bg-main-purple rounded-3xl px-3 py-[6px];
    @apply min-[330px]:px-6 min-[330px]:py-[10px];
}
</style>