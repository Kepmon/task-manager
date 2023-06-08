<template>
    <dialogs-template
        formTitle="Research pricing points of various competitors and trial different business models"
        :closeDialog="closeSeeTask"
    >
        <template v-slot:ellipsis>
            <img
                @click="areTaskOptionsShown = !areTaskOptionsShown"
                src="/img/icon-vertical-ellipsis.svg"
                alt="click here to see more options"
                data-ellipsis
                class="px-2 cursor-pointer"
            >
        </template>
            
        <template v-slot:main-content>
            <div class="flex flex-col gap-6 relative">
                <more-options
                    :condition="areTaskOptionsShown"
                    element="task"
                    :toggleOptions="(e: Event) => callMoreOptionsFn(e, toggleOptions)"
                    :closeMoreOptions="(e: Event) => callMoreOptionsFn(e, closeOptions)"
                    :showEditForm="showEditForm"
                    :showDeleteForm="showDeleteForm"
                    :closeSeeTask="closeSeeTask"
                />

                <p class="text-medium-grey text-xs min-[350px]:text-sm">
                    {{ boardProperties.description }}
                </p>

                <div>
                    <p class="mb-4 text-xs text-medium-grey dark:text-white">
                        Subtasks (
                            {{ returnNumberOfCompletedSubtasks(boardProperties.subtasks) }}
                            of
                            {{ boardProperties.subtasks.length }}
                        )
                    </p>
                    <div
                        v-for="subtask in boardProperties.subtasks"
                        :key="subtask.title"
                        class="subtask"
                    >
                        <label class="flex items-center gap-4 px-1 cursor-pointer">
                            <input type="checkbox" :checked="subtask.isCompleted" class="checkbox peer">
                            <span
                                class="text-xs peer-checked:line-through peer-checked:opacity-50"
                            >
                                {{ subtask.title }}
                            </span>
                        </label>
                    </div>
                </div>

                <div>
                    <p class="mb-2 text-xs text-medium-grey dark:text-white">Current Status</p>
                    <v-select :options="statusItems" :searchable="false" placeholder="Doing"></v-select>
                </div>
            </div>
        </template>
    </dialogs-template>
</template>

<script setup lang="ts">
import DialogsTemplate from './DialogsTemplate.vue'
import MoreOptions from '../shared/MoreOptions.vue'
import moreOptionsPopup from '../../composables/moreOptionsPopup'
import { returnBoardProperties } from '../../composables/boardProperties'
import { returnNumberOfCompletedSubtasks } from '../../composables/completedTasks'
import { ref, Ref } from 'vue'

defineProps<{
    showEditForm: () => void,
    showDeleteForm: () => void,
    closeSeeTask: () => void
}>()

const boardProperties = returnBoardProperties()
const statusItems = boardProperties.columns.map((column) => column.name)
const areTaskOptionsShown = ref(false)

const { toggleOptions, closeOptions } = moreOptionsPopup
const callMoreOptionsFn = (e: Event, cb: (e: Event, conditionToChange: Ref<boolean>) => void) => {
  cb(e, areTaskOptionsShown)
}
</script>

<style scoped>
.checkbox {
    @apply appearance-none after:flex after:items-center after:justify-center;
    @apply after:h-3 after:w-3 after:bg-white after:shadow-option after:rounded-[2px];
    @apply checked:after:bg-main-purple checked:after:content-checked;
}

.subtask {
    @apply [&:not(:last-of-type)]:mb-2 p-2 rounded bg-light-grey dark:bg-very-dark-grey;
    @apply hover:bg-semitransparent-purple hover:dark:bg-semitransparent-purple;
    @apply transition-all duration-300;
}
</style>