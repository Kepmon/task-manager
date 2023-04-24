<template>
<transition-group name="dialogs">
  <see-task
    @click.prevent.self="toggleSeeTask"
    v-show="isSeeTaskOpen"
    :title="title"
    :description="description"
    :howManyCompleted="
      returnNumberOfCompletedSubtasks(subtasks)
    "
    :howManySubtasks="subtasks.length"
    :subtasks="subtasks"
    :columns="columns"
    :status="status"
  />
  
  <add-edit-form
    @click.prevent.self="toggleAddNewTask"
    v-show="isAddEditDialogOpen"
    title="Add New Task"
    action="add"
    :isDark="isDark"
    :columns="columns"
    text="Create Task"
  />
  
  <delete
    @click.prevent.self="toggleDeleteDialog"
    v-show="isDeleteDialogOpen"
    elementToDelete="board"
    :elementName="name"
  />
</transition-group>
</template>

<script setup lang="ts">
import type { Board, Task } from '../api/boardsTypes'
import SeeTask from './SeeTask.vue'
import AddEditForm from './AddEditForm.vue'
import Delete from './Delete.vue'
import { returnNumberOfCompletedSubtasks } from '../../composables/completedTasks'

defineProps<{
  isDark: boolean,
  isSeeTaskOpen: boolean,
  toggleSeeTask: () => void,
  isAddEditDialogOpen: boolean,
  toggleAddNewTask: () => void,
  isDeleteDialogOpen: boolean,
  toggleDeleteDialog: () => void,
  name: Board['name'],
  columns: Board['columns'],
  title: Task['title'],
  description: Task['description'],
  status: Task['status'],
  subtasks: Task['subtasks']
}>()
</script>