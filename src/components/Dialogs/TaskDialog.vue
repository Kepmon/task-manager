<template>
    <dialogs-template
        :closeDialog="closeDialog"
    >
        <template v-slot:form-title>
            <h2>{{ action }} {{ action === 'add' ? 'New' : '' }} Task</h2>
        </template>

        <template v-slot:main-content>
            <input-text
                label="Title"
                :placeholder="action === 'add' ? 'e.g. Take coffee break' : ''"
                :inputValue="action === 'edit' ? 'Add authentication endpoints' : ''"
                :formType="action"
                type="input"
            />
            
            <input-text
                label="Description"
                :formType="action"
                type="textarea"
            />

            <multi-option
                modifiedItem="task"
                :formType="action"
                :selectedMultiOptionItems="selectedMultiOptionItems"
            />

            <the-button
                :regularButton="true"
                :isInForm="true"
                class="text-main-purple bg-transparent-purple dark:bg-white"
            >
                + Add New Subtask
            </the-button>

            <div>
                <p class="mb-2 text-xs text-medium-grey dark:text-white">Status</p>
                <v-select :options="statusItems" :searchable="false" placeholder="Todo"></v-select>
            </div>

            <the-button
                :regularButton="true"
                :isInForm="true"
                class="hover:bg-main-purple-hover transition-all duration-300 text-white bg-main-purple"
            >
                {{ action === 'add' ? 'Create Task' : 'Save Changes' }}
            </the-button>
        </template>
    </dialogs-template>
</template>

<script setup lang="ts">
import type { Subtask } from '../../api/boardsTypes'
import DialogsTemplate from './DialogsTemplate.vue'
import InputText from './elements/InputText.vue'
import MultiOption from './elements/MultiOption.vue'
import TheButton from '../../components/shared/TheButton.vue'
import { returnBoardProperties } from '../../composables/boardProperties'

defineProps<{
    action: 'add' | 'edit',
    selectedMultiOptionItems: Subtask['title'][] | string[],
    closeDialog: () => void
}>()

const boardProperties = returnBoardProperties()
const statusItems = boardProperties.columns.map((column) => column.name)
</script>