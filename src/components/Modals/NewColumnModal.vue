<template>
  <modals-template
    @close-modal="closeModal"
    @submit-form="submitForm"
    :allowOverflow="true"
  >
    <template #form-title>
      <h2>Add New Column</h2>
    </template>
    <template #main-content>
      <div class="flex items-center gap-4 relative isolate">
        <color-picker
          @set-show-modal="
            (isColorPickerShown) => setShowModal(isColorPickerShown)
          "
          @set-new-color="(color: ColorChangeEvent) => startColor = color.cssColor"
          :startColor="startColor"
        />

        <text-input
          @handle-blur="
            columnName === ''
              ? (isColumnNameError = true)
              : (isColumnNameError = false)
          "
          v-model="columnName"
          label="Column Name"
          idAttr="new-column"
          fieldDescription="column name"
          :isError="isColumnNameError"
          class="grow"
        />
      </div>
      <button class="regular-button purple-class">Add New Column</button>
    </template>
  </modals-template>
</template>

<script setup lang="ts">
import type { ColorChangeEvent } from 'vue-accessible-color-picker'
import ModalsTemplate from './ModalsTemplate.vue'
import TextInput from '../shared/Inputs/TextInput.vue'
import ColorPicker from '../shared/ColorPicker.vue'
import { ref } from 'vue'
import { useBoardsStore } from '../../stores/boards'
import { handleResponse } from '../../composables/responseHandler'

const emits = defineEmits(['close-modal'])

const boardsStore = useBoardsStore()

const columnName = ref('')
const isColumnNameError = ref(false)

const startColor = ref('hsl(193 75% 59%)')
const shouldModalBeClosed = ref(true)

const setShowModal = (isColorPickerShown: boolean) => {
  if (isColorPickerShown) {
    shouldModalBeClosed.value = false
    return
  }

  shouldModalBeClosed.value = true
}

const closeModal = () => {
  if (!shouldModalBeClosed.value) return

  emits('close-modal')
}

const submitForm = async () => {
  if (isColumnNameError.value) return

  const response = await boardsStore.addNewColumn(
    columnName.value,
    startColor.value
  )

  shouldModalBeClosed.value = true

  handleResponse(response)
  closeModal()
}
</script>
