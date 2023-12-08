import ContentLayout from "@cloudscape-design/components/content-layout"
import Header from "@cloudscape-design/components/header"
import HelpPanel from "@cloudscape-design/components/help-panel"

import Breadcrumbs from "./sharedComponents/Breadcrumbs"
import ShellLayout from "./sharedComponents/shell"
import DemoNavigation from "./sharedComponents/DemoNavigation"
import { useEffect, useState } from "react"
import { Alert, Button } from "@cloudscape-design/components";


const websocketUrl = import.meta.env.VITE_SCENARIO_WEBSOCKET_API_BASE_URL;
export default function DemoHome() {
	const [toolsOpen, setToolsOpen] = useState<boolean>(true)
	const [notificationMessage, setNotificationMessage] = useState<string>()
	const [wsConnection, setWsConnection] = useState<WebSocket>()

	useEffect(() => {
		if (wsConnection) {
			wsConnection.onopen = (e) => {
				console.log('connection is established' + JSON.stringify(e))
			}
			wsConnection.onmessage = (message) => {
				console.log(message.data);
				setNotificationMessage(message.data)
			}
		}
	}, [wsConnection]);

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


			{notificationMessage &&
				<Alert
					statusIconAriaLabel="Info"
					header="Feed Mapping"
					dismissible={true}
					onDismiss={() => setNotificationMessage(undefined)}
				>
					{notificationMessage}
				</Alert>
			}
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
				<Button onClick={() => {
					const connection = new WebSocket(websocketUrl);
					setWsConnection(connection);
				}}>Connect</Button>
				<Button onClick={() => {
					if (wsConnection) wsConnection.close();
				}}>Disconnect</Button>
			</ContentLayout>
		</ShellLayout>
	)
}
