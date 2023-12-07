import { Box, Button, SpaceBetween, Table, } from "@cloudscape-design/components"

interface ResourceAttribute<T> {
	field: keyof T
	label: string
	customCell?: (item: T) => string
}

interface ResourceTableProps<T> {
	resourceAttributes: ResourceAttribute<T>[]
	resources: T[]
}

interface CustomColDef<T> {
	id: string
	header: string
	cell: (item: T) => string
}

export default function ResourceTable<T>(props: ResourceTableProps<T>) {
	const columnDefinitions = props.resourceAttributes.map((attribute) => {
		return {
			id: attribute.field,
			header: attribute.label,
			cell: attribute.customCell ?? ((item) => item[attribute.field] || "-"),
		} as CustomColDef<T>
	})
	return (
		<Table
			columnDefinitions={columnDefinitions}
			items={props.resources}
			loadingText="Loading resources"
			sortingDisabled
			// variant="embedded"
			empty={
				<Box margin={{vertical: "xs"}} textAlign="center" color="inherit">
					<SpaceBetween size="m">
						<b>No resources</b>
						<Button>Create resource</Button>
					</SpaceBetween>
				</Box>
			}
			// header={<Header> Simple table </Header>}
		/>
	)
}
