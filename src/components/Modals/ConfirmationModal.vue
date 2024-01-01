<template>
  <div class="z-10">
    <modals-template @close-modal="$emit('close-modal')">
      <template #form-title>
        <h2 class="text-red-400">Delete this {{ elementToDelete }}?</h2>
      </template>
      <template #main-content>
        <p class="text-sm text-gray-400 font-normal">
          {{ message }}
        </p>
        <auth-input
          v-if="elementToDelete === 'user'"
          label="Password"
          name="password"
          type="password"
        />
        <div class="flex flex-col s:flex-row gap-4">
          <button
            @click="submit"
            :disabled="isPending"
            class="regular-button red-button"
          >
            <span v-if="isPending">Loading...</span>
            <span v-if="!isPending">Delete</span>
          </button>
          <button
            @click="$emit('close-modal')"
            type="button"
            class="regular-button white-button"
          >
            Cancel
          </button>
        </div>
      </template>
    </modals-template>
  </div>
</template>

<script setup lang="ts">
import type { Board, BoardColumn, Task } from '../../api/boardsTypes'
import ModalsTemplate from './ModalsTemplate.vue'
import AuthInput from '../shared/Inputs/AuthInput.vue'
import { computed } from 'vue'
import { useUserStore } from '../../stores/user'
import { useBoardsStore } from '../../stores/boards'
import { useTasksStore } from '../../stores/tasks'
import { useFormsStore } from '../../stores/forms'
import { ref } from 'vue'
import { handleResponse } from '../../composables/responseHandler'
import { useRoute } from 'vue-router'
import { useForm } from 'vee-validate'
import * as Yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'

type ElementID = Board['boardID'] | BoardColumn['columnID'] | Task['taskID']
const props = defineProps<{
  elementToDelete: 'board' | 'column' | 'task' | 'user'
  elementName?: string
  elementID?: ElementID
  columnOfClickedTask?: BoardColumn['columnID']
}>()
const emits = defineEmits(['close-modal'])

const { path: currentPath } = useRoute()
useForm({
  initialValues: {
    currentPath
  },
  validationSchema: toTypedSchema(
    Yup.object({
      currentPath: Yup.string(),
      password: Yup.string()
        .min(8, 'Must be at least 8 characters long')
        .required("Can't be empty")
    })
  )
})

const message = computed(() => {
  const prefix =
    props.elementToDelete === 'user'
      ? 'Are you sure you want to delete your account?'
      : `Are you sure you want to delete the '${props.elementName}'`
  const suffix = {
    board:
      'This action will remove all columns and its tasks and cannot be reversed.',
    column:
      'This action will remove this column and all its tasks and cannot be reversed.',
    task: 'This action will remove this task and all its subtasks and cannot be reversed.',
    user: 'To be able to delete your account, you need to provide your password.'
  }

  if (props.elementToDelete === 'user') {
    return `${suffix[props.elementToDelete]}`
  }
  return `${prefix} ${props.elementToDelete}? ${suffix[props.elementToDelete]}`
})

const route = useRoute()
const userStore = useUserStore()
const boardsStore = useBoardsStore()
const tasksStore = useTasksStore()
const formsStore = useFormsStore()

const submitFns = {
  board: () => boardsStore.deleteBoard(props.elementID as ElementID),
  column: () =>
    boardsStore.deleteColumn(
      userStore.userData.currentBoard.boardID,
      props.elementID as ElementID
    ),
  task: () => tasksStore.deleteTask(),
  user: () => userStore.deleteAccount()
}

const errorMessage = ref('')
const isPending = ref(false)
const submit = async () => {
  isPending.value = true

  const response = await submitFns[props.elementToDelete]()
  handleResponse(response, route.path, isPending)

  if (props.elementToDelete === 'user' && typeof response === 'string') {
    errorMessage.value = response
  }

  if (props.elementToDelete === 'column') {
    formsStore.resetFormData('board', 'edit')
  }

  isPending.value = false
  emits('close-modal')
}
</script>

<style lang="postcss" scoped>
.red-button {
  @apply text-white bg-red-400 hover:bg-red-200 focus-visible:bg-red-200;
  @apply transition-colors duration-300 outline outline-transparent;
}
</style>
