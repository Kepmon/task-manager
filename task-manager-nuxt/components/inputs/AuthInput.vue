<template>
  <div class="grid gap-2">
    <label class="text-xs" :for="name">{{ label }}</label>
    <!-- @input="updatePassword" -->
    <Field
      :id="name"
      :type="type"
      :name="name"
      class="input"
      :class="{
        'border-red-400': errorMessage,
        'border-blue-40 focus-visible:border-purple-400': !errorMessage
      }"
    />
    <ErrorMessage :name="name" class="font-normal text-xs text-red-400" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  name: string
  type: HTMLInputElement['type']
}>()

// const userStore = useUserStore()
const name = toRef(props, 'name')
const { errorMessage } = useField(name)

// const updatePassword = (e: InputEvent) => {
//   if (props.name !== 'password') return

//   userStore.inputedPassword = (e.target as HTMLInputElement).value
// }
</script>
