<template>
  <div :class="{ 'flex flex-col gap-2': label }">
    <label v-if="label" :for="name" class="text-xs">{{ label }}</label>
    <div class="relative">
      <Field
        :id="name"
        :type="type"
        :placeholder="placeholder"
        :name="name"
        class="input"
        :class="fieldClasses"
      />
      <ErrorMessage :name="name" />
    </div>
    <!-- <textarea
            v-if="type === 'textarea'"
            class="input min-h-[80px] max-h-[150px] scrollbar-invisible"
            :class="{ 'border-blue-40 focus:border-purple-400': !error }"
            placeholder="e.g. It’s always good to take a break. This 15 minute break will recharge the batteries a little."
        ></textarea> -->
  </div>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import { Field, ErrorMessage } from "vee-validate";

const props = defineProps<{
  label?: string;
  placeholder?: string;
  customValue?: string;
  error?: boolean;
  formType?: "add" | "edit";
  name: string;
  type: "text" | "email" | "password" | "textarea";
  fieldClasses?: string;
}>();

const name = toRef(props, "name");
</script>

<style scoped lang="postcss">
.input {
  @apply py-3 px-4 w-full bg-transparent rounded-[4px] text-sm font-normal;
  @apply outline-none border;
}
</style>
