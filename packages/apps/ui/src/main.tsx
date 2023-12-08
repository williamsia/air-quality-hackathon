import { Amplify, Auth, Hub } from 'aws-amplify';

window.global ||= window;
import React from 'react';
import ReactDOM from 'react-dom/client';
import '@aws-amplify/ui-react/styles.css';
import '@cloudscape-design/global-styles/index.css';
import {
	BrowserRouter,
	Route,
	Routes
} from 'react-router-dom';

import { Authenticator } from '@aws-amplify/ui-react';
import { amplifyConfig } from './amplifyConfig.ts';
import { store } from './store';
import { Provider } from 'react-redux';

import { addUser } from './services/authSlice.ts';
import { GettingStartedPage } from './pages/getting-started';
import { QueryData } from './pages/query-data/index.tsx';

Amplify.configure(amplifyConfig);

Hub.listen('auth', (data) => {
	const { payload } = data;
	const { email } = payload?.data?.signInUserSession?.getIdToken()?.decodePayload();
	store.dispatch(addUser({ email }));
});
Auth.currentSession().then(s => {
	const { email } = s?.getIdToken()?.decodePayload();
	store.dispatch(addUser({ email }));
}).catch(e => {
	console.log(e);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<Authenticator>
			{({}) => (
				<Provider store={store}>
					<BrowserRouter>
						<Routes>
							<Route path='/' element={<GettingStartedPage />} />
							<Route path='/feeds' element={<QueryData/>} />
						</Routes>
					</BrowserRouter>
				</Provider>
			)}
		</Authenticator>
	</React.StrictMode>
);
