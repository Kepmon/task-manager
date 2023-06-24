<template>
  <dialogs-template @close-dialog="$emit('close-dialog')">
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
        <svg width="5" height="20" data-ellipsis>
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
          @toggle-options="(e: Event) => closeMoreOptionsFn(e, toggleOptions)"
          @show-edit-form="$emit('show-edit-form')"
          @show-delete-form="$emit('show-delete-form')"
          @close-more-options="(e: Event) => closeMoreOptionsFn(e, closeOptions)"
          :condition="areTaskOptionsShown"
          element="task"
        />

        <p class="text-gray-400 text-xs min-[350px]:text-sm">
          {{ description }}
        </p>

        <div v-if="subtasks.length">
          <p class="mb-4 text-xs text-gray-400 dark:text-white">
            Subtasks (
            {{ returnNumberOfCompletedSubtasks(subtasks) }}
            of
            {{ subtasks.length }}
            )
          </p>
          <div
            v-for="{ title, isCompleted } in subtasks"
            :key="title"
            class="subtask"
          >
            <label class="flex items-center gap-4 px-1 cursor-pointer">
              <input
                type="checkbox"
                :checked="isCompleted"
                class="checkbox peer"
              />
              <span
                class="text-xs peer-checked:line-through peer-checked:opacity-50"
              >
                {{ title }}
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
import { useBoardsStore } from '../../stores/boards'
import { ref, Ref } from 'vue'

defineEmits(['close-dialog', 'show-edit-form', 'show-delete-form'])

const { columns, description, subtasks, returnNumberOfCompletedSubtasks } =
  useBoardsStore()
const statusItems = columns.map((column) => column.name)
const areTaskOptionsShown = ref(false)

const { toggleOptions, closeOptions } = moreOptionsPopup
const closeMoreOptionsFn = (
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
