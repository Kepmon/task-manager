<template>
  <div class="grid" :class="{ 'col-span-2': isLogo }">
    <more-options
      :condition="areBoardOptionsShown"
      element="board"
      :show-edit-form="() => (isEditBoardDialogShown = true)"
      :show-delete-form="() => (isDeleteBoardDialogShown = true)"
      :toggle-options="(e: Event) => callMoreOptionsFn(e, toggleOptions)"
      :close-more-options="(e: Event) => callMoreOptionsFn(e, closeOptions)"
    />
    <nav aria-label="main navigation" class="main-nav">
      <div class="flex items-center gap-2 h-full">
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
          />
        </div>
        <div class="flex items-center gap-2" @click="toggleBoardsNav">
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
            <path
              stroke-width="2"
              fill="none"
              d="m1 1 4 4 4-4"
              class="stroke-purple-400"
            />
          </svg>
        </div>
      </div>
      <div class="flex items-center gap-2 min-[640px]:gap-3 text-white">
        <the-button
          :regular-button="width >= 640 ? true : false"
          class="gap-[2px] purple-class"
          :class="{
            'opacity-25 cursor-not-allowed': dashboard,
            'cursor-pointer': !dashboard,
            'px-4 py-[2px] rounded-2xl': width < 640,
          }"
          @click="isAddTaskDialogShown = true"
        >
          <span class="leading-none" :class="{ 'text-2xl': width < 640 }"
            >+</span
          >
          <span v-if="width >= 640">Add New Task</span>
        </the-button>
        <the-button
          :regular-button="false"
          data-ellipsis
          aria-label="click here to see more options"
          class="px-3 py-2 cursor-pointer"
          @click.prevent="areBoardOptionsShown = !areBoardOptionsShown"
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
      </div>
    </nav>
    <transition name="dialog">
      <task-dialog
        v-if="isAddTaskDialogShown"
        action="add"
        :selected-multi-option-items="[
          'e.g. Make coffee',
          'e.g. Drink coffee & smile',
        ]"
        :close-dialog="() => (isAddTaskDialogShown = false)"
      />
    </transition>
    <transition name="dialog">
      <confirmation-dialog
        v-if="isDeleteBoardDialogShown"
        element-to-delete="board"
        element-name="Platform Launch"
        :close-dialog="() => (isDeleteBoardDialogShown = false)"
      />
    </transition>
    <transition name="dialog">
      <board-dialog
        v-if="isEditBoardDialogShown"
        action="edit"
        :close-dialog="() => (isEditBoardDialogShown = false)"
        :selected-multi-option-items="selectedMultiOptionItems"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import TheButton from "../shared/TheButton.vue";
import MoreOptions from "../shared/MoreOptions.vue";
import TaskDialog from "../Dialogs/TaskDialog.vue";
import ConfirmationDialog from "../Dialogs/ConfirmationDialog.vue";
import BoardDialog from "../Dialogs/BoardDialog.vue";
import moreOptionsPopup from "../../composables/moreOptionsPopup";
import { returnBoardProperties } from "../../composables/boardProperties";
import { ref, Ref } from "vue";

defineProps<{
  sidebar: boolean;
  isLogo: boolean;
  theme: boolean;
  dashboard: boolean;
  width: number;
  boardName: string;
  navOpen: boolean;
  toggleBoardsNav: () => void;
}>();

const areBoardOptionsShown = ref(false);
const isAddTaskDialogShown = ref(false);
const isDeleteBoardDialogShown = ref(false);
const isEditBoardDialogShown = ref(false);

const boardProperties = returnBoardProperties();
const selectedMultiOptionItems = boardProperties.columns.map(
  (column) => column.name
);

const { toggleOptions, closeOptions } = moreOptionsPopup;
const callMoreOptionsFn = (
  e: Event,
  cb: (e: Event, conditionToChange: Ref<boolean>) => void
) => {
  cb(e, areBoardOptionsShown);
};
</script>

<style scoped>
.main-nav {
  @apply flex items-center justify-between relative px-3;
  @apply min-[350px]:px-6 shadow-xs bg-white dark:bg-gray-700;
}

.main-nav__logo {
  @apply flex items-center h-full sm:border-r;
  @apply sm:border-blue-300 dark:border-gray-600;
}
</style>
