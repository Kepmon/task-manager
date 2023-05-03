<template>
    <div class="flex flex-col gap-6">
        <input-text
            :label="modifiedItem === 'Task' ? 'Title' : 'Board Name'"
            :placeholder="
                modifiedItem === 'Task' ?
                'e.g. Take coffee brake' :
                'e.g. Web Design'
            "
            :inputValue="inputValue"
            :action="formType"
            type="input"
        />
        <input-text
            v-show="modifiedItem === 'Task'"
            label="Description"
            :action="formType"
            type="textarea"
        />
        <multi-option
            :modifiedItem="modifiedItem"
            :formType="formType"
            :isDark="isDark"
        />
    </div>
</template>

<script setup lang="ts">
import InputText from './elements/InputText.vue'
import MultiOption from './elements/MultiOption.vue'
import { returnBoardProperties } from '../../composables/boardProperties'
import { computed } from 'vue'

const props = defineProps<{
    isDark: boolean,
    modifiedItem: 'Task' | 'Board',
    formType: 'SeeTask' | 'Add' | 'Edit' | 'Delete'
}>()

const boardProperties = returnBoardProperties()
const inputValue = computed(() => 
    props.modifiedItem === 'Task' ? boardProperties.title : boardProperties.boardName
)
</script>