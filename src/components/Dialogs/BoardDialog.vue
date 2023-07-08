<template>
  <dialogs-template @submit-form="submit" @close-dialog="$emit('close-dialog')">
    <template #form-title>
      <h2>{{ action }} {{ action === 'add' ? 'New' : '' }} Board</h2>
    </template>

    <template #main-content>
      <text-input
        @update:model-value="(newValue: string) => (formData.name = newValue)"
        @handle-blur="
          formData.name === ''
            ? (formNameError = true)
            : (formNameError = false)
        "
        :modelValue="(formData.name as string)"
        :isError="formNameError"
        label="Board Name"
        :placeholder="action === 'add' ? 'e.g. Web Design' : ''"
        :class="{ 'input-error after:translate-y-full': formNameError }"
      />

      <multi-option
        @handle-blur="(data) => (formData.columns = data)"
        @remove-input="(index) => (formData.columns as string[]).splice(index, 1)"
        modifiedItem="board"
        :formType="action"
        :selectedMultiOptionItems="(formData.columns as string[])"
      />

      <the-button
        @click="() => (formData.columns as string[]).push('')"
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
  </dialogs-template>
</template>

<script setup lang="ts">
import type { BoardColumn } from '../../api/boardsTypes'
import DialogsTemplate from './DialogsTemplate.vue'
import TextInput from '../shared/Inputs/TextInput.vue'
import MultiOption from './elements/MultiOption.vue'
import TheButton from '../../components/shared/TheButton.vue'
import { ref, Ref } from 'vue'
import { db, colRef } from '../../firebase'
import { getDocs, doc, updateDoc, query, where } from 'firebase/firestore'
defineProps<{
  action: 'add' | 'edit'
  selectedMultiOptionItems?: BoardColumn['name'][]
}>()
defineEmits(['close-dialog'])

const formData: Ref<Record<'name' | 'columns', string | string[]>> = ref({
  name: '',
  columns: ['Todo', 'Doing']
})
const formNameError = ref(false)

const submit = async () => {
  if (
    [formData.value.name, ...formData.value.columns].some((item) => item === '')
  )
    return

  const { uid } = JSON.parse(localStorage.getItem('user') || '{}')
  const requiredDocRef = query(colRef, where('userID', '==', uid))
  const docSnap = await getDocs(requiredDocRef)
  const docID = docSnap.docs[0].id
  const docRef = doc(db, 'users', docID)
  const boardColumns = (formData.value.columns as string[]).map((column) => ({
    name: column,
    tasks: []
  }))
  await updateDoc(docRef, {
    boards: [
      {
        name: formData.value.name,
        columns: boardColumns
      }
    ]
  })
}
</script>
