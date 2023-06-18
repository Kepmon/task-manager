<template>
  <dialogs-template :close-dialog="closeDialog">
    <template #form-title>
      <h2>{{ action }} {{ action === "add" ? "New" : "" }} Task</h2>
    </template>

    <template #main-content>
      <input-text
        label="Title"
        :placeholder="action === 'add' ? 'e.g. Take coffee break' : ''"
        :custom-value="action === 'edit' ? 'Add authentication endpoints' : ''"
        :form-type="action"
        name="title"
        type="text"
      />

      <input-text
        label="Description"
        :form-type="action"
        type="textarea"
        name="description"
      />

      <multi-option
        modified-item="task"
        :form-type="action"
        :selected-multi-option-items="selectedMultiOptionItems"
      />

      <the-button
        :regular-button="true"
        :is-in-form="true"
        class="white-button"
      >
        + Add New Subtask
      </the-button>

      <div>
        <p class="mb-2 text-xs text-gray-400 dark:text-white">Status</p>
        <v-select
          :options="statusItems"
          :searchable="false"
          placeholder="Todo"
        ></v-select>
      </div>

      <the-button
        :regular-button="true"
        :is-in-form="true"
        class="purple-class"
      >
        {{ action === "add" ? "Create Task" : "Save Changes" }}
      </the-button>
    </template>
  </dialogs-template>
</template>

<script setup lang="ts">
import type { Subtask } from "../../api/boardsTypes";
import DialogsTemplate from "./DialogsTemplate.vue";
import InputText from "../shared/InputText.vue";
import MultiOption from "./elements/MultiOption.vue";
import TheButton from "../../components/shared/TheButton.vue";
import { returnBoardProperties } from "../../composables/boardProperties";

defineProps<{
  action: "add" | "edit";
  selectedMultiOptionItems: Subtask["title"][] | string[];
  closeDialog: () => void;
}>();

const boardProperties = returnBoardProperties();
const statusItems = boardProperties.columns.map((column) => column.name);
</script>
