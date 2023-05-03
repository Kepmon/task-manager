import type { Task } from "./boardsTypes"

export type ToggledDialog =
'seeTask' | 'addTask' | 'addBoard' | 'editTask' | 'editBoard' | 'deleteTask' | 'deleteBoard'

export interface SharedProps {
    isDark: boolean,
    toggleDialog: () => void,
    editTask: () => void ,
    editBoard: () => void,
    deleteTask: () => void,
    deleteBoard: () => void,
    condition: boolean
}

export interface AllProps extends SharedProps {
    formType: ToggledDialog,
    modifiedItem: 'Task' | 'Board',
    selectedStatus: string
}

interface SeeTaskProps {
    formType: 'SeeTask',
    modifiedItem: 'Task',
    selectedStatus: Task['status']
}

interface AddEditProps {
    formType: 'Add' | 'Edit',
    modifiedItem: 'Task' | 'Board',
    selectedStatus?: Task['status']
}

interface DeleteProps {
    formType: 'Delete',
    modifiedItem: 'Task' | 'Board',
}

export interface PropsToSelect {
    seeTask: SeeTaskProps,
    addTask: AddEditProps,
    addBoard: AddEditProps,
    editTask: AddEditProps,
    editBoard: AddEditProps,
    deleteTask: DeleteProps,
    deleteBoard: DeleteProps
}