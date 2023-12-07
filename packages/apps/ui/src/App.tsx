import "./App.css"
import "@aws-amplify/ui-react/styles.css";
import { BrowserRouter, Route, Routes } from "react-router-dom"
import DemoHome from "./features/demo/DemoHome"
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import { amplifyConfig } from "./backendConfig";


Amplify.configure(amplifyConfig);

function App() {
	return (
		<Authenticator>
			{() => (

				<BrowserRouter>
					<Routes>
						<Route path="/" element={<DemoHome/>}/>
						{/* <Route path="/schema/*" element={<DemoSchema />} /> */}
					</Routes>
				</BrowserRouter>
			)}
		</Authenticator>
	)
}

export default App
