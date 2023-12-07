import ContentLayout from "@cloudscape-design/components/content-layout"
import Header from "@cloudscape-design/components/header"
import HelpPanel from "@cloudscape-design/components/help-panel"

import Breadcrumbs from "./sharedComponents/Breadcrumbs"
import ShellLayout from "./sharedComponents/shell"
import DemoNavigation from "./sharedComponents/DemoNavigation"
import { useState } from "react"

export default function DemoHome() {
	const [toolsOpen, setToolsOpen] = useState<boolean>(true)

	return (
		<ShellLayout
			breadcrumbs={<Breadcrumbs/>}
			navigation={<DemoNavigation/>}
			toolsOpen={toolsOpen}
			onToolsChange={(event) => setToolsOpen(event.detail.open)}
			tools={
				<HelpPanel header={"Help panel"}>

				</HelpPanel>
			}
			toolsHide={false}
		>
			<ContentLayout
				header={
					<Header
						variant="h1"
						description={"This demo combines a web-based product carbon footprint (PCF) frontend application with two different approaches to supplier data acquisition - AWS Supply Chain and Catena-X."}
					>
						Air Quality Demo
					</Header>
				}
			>

			</ContentLayout>
		</ShellLayout>
	)
}
