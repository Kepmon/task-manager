<template>
  <modals-template @submit-form="submit" @close-modal="$emit('close-modal')">
    <template #form-title>
      <h2>{{ action }} {{ action === 'add' ? 'New' : '' }} Board</h2>
    </template>

    <template #main-content>
      <text-input
        @handle-blur="
          formData.name === ''
            ? (formNameError = true)
            : (formNameError = false)
        "
        v-model="formData.name"
        :isError="formNameError"
        label="Board Name"
        :placeholder="
          action === 'add' ? 'e.g. Web Design' : boardsStore.currentBoard?.name
        "
        :whitePlaceholder="action === 'add' ? false : true"
        :class="{ 'input-error after:translate-y-full': formNameError }"
      />

      <div v-if="formData.columns.length">
        <p class="mb-2 text-xs">Board Columns</p>
        <div class="grid gap-3">
          <div
            v-for="(item, index) in formData.columns"
            :key="index"
            class="flex items-center"
          >
            <text-input
              @handle-blur="
                () =>
                  item === ''
                    ? (columnErrors[index] = true)
                    : (columnErrors[index] = false)
              "
              @update:model-value="(newValue: string) => ((formData.columns as string[])[index] = newValue)"
              :modelValue="item"
              :placeholder="action === 'add' ? item : ''"
              :isError="columnErrors[index]"
              :condition="
                index === formData.columns.length - 1 && isNewInputAdded
              "
              class="grow"
              :class="{
                'input-error': columnErrors[index] === true
              }"
            ></text-input>
            <close-icon
              @handle-close="() => (formData.columns as string[]).splice(index, 1)"
              :listItem="item"
              :isError="columnErrors[index]"
            />
          </div>
        </div>
      </div>

      <the-button
        @click="addNewColumn"
        :regularButton="true"
        :isInForm="true"
        class="white-button"
        type="button"
      >
        + Add New Column
      </the-button>

      <the-button :regularButton="true" :isInForm="true" class="purple-class">
        {{ action === 'add' ? 'Create New Board' : 'Save Changes' }}
      </the-button>
    </template>
  </modals-template>
</template>

<script setup lang="ts">
import ModalsTemplate from './ModalsTemplate.vue'
import TextInput from '../shared/Inputs/TextInput.vue'
import TheButton from '../../components/shared/TheButton.vue'
import CloseIcon from '../Svgs/CloseIcon.vue'
import { addNewInput } from '../../composables/addNewInput'
import { useBoardsStore } from '../../stores/boards'
import { ref } from 'vue'

const props = defineProps<{
  action: 'add' | 'edit'
}>()
const emits = defineEmits(['update:modelValue', 'close-modal'])

const boardsStore = useBoardsStore()

const formData = ref<{ name: string; columns: string[] }>({
  name:
    props.action === 'add' ? '' : (boardsStore.currentBoard?.name as string),
  columns:
    props.action === 'add'
      ? ['Todo', 'Doing']
      : (boardsStore.boardColumnsNames as string[])
})
const formNameError = ref(false)
const columnErrors = ref(formData.value.columns.map(() => false))
const isNewInputAdded = ref(false)

const addNewColumn = () => {
  addNewInput(formData, columnErrors, isNewInputAdded)
}

const submit = () => {
  if (formData.value.name === '') return

  emits('close-modal')
  const submitFn =
    props.action === 'add' ? boardsStore.addNewBoard : boardsStore.editBoard

  submitFn(formData.value.name.trim(), formData.value.columns)
}
</script>
