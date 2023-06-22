<template>
  <dialogs-template :closeDialog="closeDialog">
    <template #form-title>
      <h2>{{ action }} {{ action === 'add' ? 'New' : '' }} Board</h2>
    </template>

    <template #main-content>
      <input-text
        label="Board Name"
        :placeholder="action === 'add' ? 'e.g. Web Design' : ''"
        :customValue="action === 'edit' ? 'Platform Launch' : ''"
        :formType="action"
        name="boardName"
        type="text"
      />

      <multi-option
        modifiedItem="board"
        :formType="action"
        :selectedMultiOptionItems="selectedMultiOptionItems"
      />

      <the-button :regularButton="true" :isInForm="true" class="white-button">
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
import InputText from '../shared/InputText.vue'
import MultiOption from './elements/MultiOption.vue'
import TheButton from '../../components/shared/TheButton.vue'

defineProps<{
  action: 'add' | 'edit'
  selectedMultiOptionItems: string[] | BoardColumn['name'][]
  closeDialog: () => void
}>()
</script>
