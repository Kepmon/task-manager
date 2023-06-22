<template>
  <dialogs-template :closeDialog="closeSeeTask">
    <template #form-title>
      <h2>
        Research pricing points of various competitors and trial different
        business models
      </h2>
    </template>

    <template #ellipsis>
      <the-button
        @click.prevent="areTaskOptionsShown = !areTaskOptionsShown"
        :regularButton="false"
        data-ellipsis
        aria-label="click here to see more options"
        class="px-3 py-2 cursor-pointer"
      >
        <svg
          width="5"
          height="20"
          xmlns="http://www.w3.org/2000/svg"
          data-ellipsis
        >
          <g fill-rule="evenodd" class="fill-gray-400">
            <circle cx="2.308" cy="2.308" r="2.308" />
            <circle cx="2.308" cy="10" r="2.308" />
            <circle cx="2.308" cy="17.692" r="2.308" />
          </g>
        </svg>
      </the-button>
    </template>

    <template #main-content>
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

        <p class="text-gray-400 text-xs min-[350px]:text-sm">
          {{ boardProperties.description }}
        </p>

        <div>
          <p class="mb-4 text-xs text-gray-400 dark:text-white">
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
              <input
                type="checkbox"
                :checked="subtask.isCompleted"
                class="checkbox peer"
              />
              <span
                class="text-xs peer-checked:line-through peer-checked:opacity-50"
              >
                {{ subtask.title }}
              </span>
            </label>
          </div>
        </div>

        <div>
          <p class="mb-2 text-xs text-gray-400 dark:text-white">
            Current Status
          </p>
          <v-select
            :options="statusItems"
            :searchable="false"
            placeholder="Doing"
          ></v-select>
        </div>
      </div>
    </template>
  </dialogs-template>
</template>

<script setup lang="ts">
import DialogsTemplate from './DialogsTemplate.vue'
import MoreOptions from '../shared/MoreOptions.vue'
import TheButton from '../shared/TheButton.vue'
import moreOptionsPopup from '../../composables/moreOptionsPopup'
import { returnBoardProperties } from '../../composables/boardProperties'
import { returnNumberOfCompletedSubtasks } from '../../composables/completedTasks'
import { ref, Ref } from 'vue'

defineProps<{
  showEditForm: () => void
  showDeleteForm: () => void
  closeSeeTask: () => void
}>()

const boardProperties = returnBoardProperties()
const statusItems = boardProperties.columns.map((column) => column.name)
const areTaskOptionsShown = ref(false)

const { toggleOptions, closeOptions } = moreOptionsPopup
const callMoreOptionsFn = (
  e: Event,
  cb: (e: Event, conditionToChange: Ref<boolean>) => void
) => {
  cb(e, areTaskOptionsShown)
}
</script>

<style scoped>
.checkbox {
  @apply appearance-none after:flex after:items-center after:justify-center;
  @apply after:h-3 after:w-3 after:bg-white after:shadow-option after:rounded-[2px];
  @apply checked:after:bg-purple-400 checked:after:content-checked;
}

.subtask {
  @apply [&:not(:last-of-type)]:mb-2 p-2 rounded bg-blue-200 dark:bg-gray-800;
  @apply hover:bg-purple-320 hover:dark:bg-purple-320;
  @apply transition-colors duration-300;
}
</style>
