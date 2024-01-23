export interface FormDataProperties {
  name: string
  description: string | undefined
  items: {
    name: string
    id: string
    dotColor: string | undefined
  }[]
  placeholderItems: string[] | undefined
}

export interface FormDataPropertiesWithId extends FormDataProperties {
  id: string
}
