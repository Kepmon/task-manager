<template>
    <transition name="dialog">
        <div v-if="condition" @click.self="toggleDialog" key="dialog" class="semitransparent-bg">
            <form class="form">
                <more-options
                    @click="areTaskOptionsShown = !areTaskOptionsShown"
                    :condition="areTaskOptionsShown"
                    element="Task"
                    :editTask="editTask"
                    :editBoard="editBoard"
                    :deleteTask="deleteTask"
                    :deleteBoard="deleteBoard"
                    class="top-24 sm:top-20 right-12 sm:translate-x-1/2"
                />

                <div class="flex items-center justify-between gap-2 min-[350px]:gap-4">
                    <p
                        class="min-[350px]:text-lg"
                        :class="{ 'text-regular-red': formType === 'Delete' }"
                    >
                        {{ formTitle }}
                    </p>
                    <img
                        @click="areTaskOptionsShown = !areTaskOptionsShown"
                        v-show="formType === 'SeeTask'"
                        src="/img/icon-vertical-ellipsis.svg"
                        alt="click here to see more options"
                        class="px-2 cursor-pointer"
                    >
                </div>

                <see-task
                    v-show="formType === 'SeeTask'"
                    :title="boardProperties.title"
                    :description="boardProperties.description"
                    :howManyCompleted="
                    returnNumberOfCompletedSubtasks(boardProperties.subtasks)
                    "
                    :howManySubtasks="boardProperties.subtasks.length"
                    :subtasks="boardProperties.subtasks"
                />

                <add-edit
                    v-show="formType === 'Add' || formType === 'Edit'"
                    :isDark="isDark"
                    :modifiedItem="modifiedItem"
                    :formType="formType"
                />

                <delete
                    v-show="formType === 'Delete'"
                    :elementToDelete="modifiedItem === 'Board' ? 'board' : 'task'"
                    :elementName="modifiedItem === 'Board' ?
                    boardProperties.boardName :
                    boardProperties.title"
                />

                <div
                    class="flex flex-col"
                    :class="{
                        'min-[512px]:flex-row gap-4': formType === 'Delete',
                        'gap-6': formType !== 'Delete'
                    }"
                >
                    <the-button
                        v-show="formType !== 'SeeTask'"
                        :regularButton="true"
                        :isInForm="true"
                        :class="{
                            'button-one-bg': formType === 'Delete',
                            'text-main-purple bg-transparent-purple dark:bg-white': formType !== 'Delete'
                        }"
                    >
                        {{ buttonOneContent }}
                    </the-button>

                    <div v-show="formType !== 'Delete' && modifiedItem === 'Task'">
                        <p class="mb-2 text-sm text-medium-grey dark:text-white">
                            <span v-show="formType === 'SeeTask'">Current</span>
                            Status
                        </p>
                        <custom-select
                            :selectedStatus="selectedStatus"
                            :columns="boardProperties.columns"
                        />
                    </div>

                    <the-button
                        v-show="formType !== 'SeeTask'"
                        :regularButton="true"
                        :isInForm="true"
                        class="hover:bg-main-purple-hover transition-all duration-300"
                        :class="{
                            'button-two-bg': formType === 'Delete',
                            'text-white bg-main-purple': formType !== 'Delete'
                        }"
                    >
                        {{ buttonTwoContent }}
                    </the-button>
                </div>
            </form>
        </div>
    </transition>
</template>

<script setup lang="ts">
import MoreOptions from '../../components/shared/MoreOptions.vue'
import TheButton from '../../components/shared/TheButton.vue'
import CustomSelect from '../../components/Dialogs/elements/CustomSelect.vue'
import SeeTask from '../../components/Dialogs/SeeTask.vue'
import AddEdit from '../../components/Dialogs/AddEdit.vue'
import Delete from '../../components/Dialogs/Delete.vue'
import { returnNumberOfCompletedSubtasks } from '../../composables/completedTasks'
import { returnBoardProperties } from '../../composables/boardProperties'
import { ref, computed } from 'vue'


const props = defineProps<{
    isDark: boolean,
    formType: 'SeeTask' | 'Add' | 'Edit' | 'Delete',
    modifiedItem: 'Task' | 'Board',
    selectedStatus?: string,
    condition: boolean
    toggleDialog: () => void,
    editTask: () => void,
    editBoard: () => void,
    deleteTask: () => void,
    deleteBoard: () => void
}>()

const areTaskOptionsShown = ref(false)
const boardProperties = returnBoardProperties()

const buttonOneContent = computed(() => {
    if (props.formType === 'Delete') return 'Delete'

    return `+ Add New ${props.modifiedItem === 'Task' ? 'Subtask' : 'Column'}`
})

const buttonTwoContent = computed(() => {
    if (props.formType === 'Delete') return 'Cancel'
    if (props.formType === 'Edit') return 'Save Changes'

    const theNewWord = props.modifiedItem === 'Board' ? 'New' : ''
    return `Create ${theNewWord} ${props.modifiedItem}`
})

const formTitle = computed(() => {
    if (props.formType === 'SeeTask') return boardProperties.title
    if (props.formType === 'Delete') return `Delete this ${props.modifiedItem.toLowerCase()}?`

    return `${props.formType} ${props.formType === 'Add' ? 'New' : ''} ${props.modifiedItem}`
})
</script>

<style scoped>
.dialog-enter-from,
.dialog-leave-to {
    @apply opacity-0;
}

.dialog-enter-active,
.dialog-leave-active {
    @apply transition-opacity duration-300;
}

.semitransparent-bg {
    @apply flex items-center justify-center absolute p-4 min-h-full;
    @apply inset-0 bottom-auto bg-semitransparent-black;
}

.form {
    @apply flex flex-col gap-6;
    @apply relative p-6 w-[90%] sm:w-[480px] rounded-md bg-white dark:bg-dark-grey;
}

.button-one-bg {
    @apply text-white bg-regular-red hover:bg-red-hover transition-all duration-300;
}

.button-two-bg {
    @apply text-main-purple bg-transparent-purple dark:bg-white;
}
</style>