import type { PropsToSelect } from '../api/dialogTypes'
import { returnBoardProperties } from '../composables/boardProperties'

export const returnDialogPropsToSelect = () => {
    const boardProperties = returnBoardProperties()
    return {
        seeTask: {
            formType: 'SeeTask',
            modifiedItem: 'Task',
            selectedStatus: boardProperties.status
        },
        addTask: {
            formType: 'Add',
            modifiedItem: 'Task',
            selectedStatus: 'Todo'
        },
        addBoard: {
            formType: 'Add',
            modifiedItem: 'Board',
            selectedStatus: 'Todo'
        },
        editTask: {
            formType: 'Edit',
            modifiedItem: 'Task',
            selectedStatus: boardProperties.status
        },
        editBoard: {
            formType: 'Edit',
            modifiedItem: 'Board'
        },
        deleteTask: {
            formType: 'Delete',
            modifiedItem: 'Task',
        },
        deleteBoard: {
            formType: 'Delete',
            modifiedItem: 'Board',
        }
    } as PropsToSelect
}