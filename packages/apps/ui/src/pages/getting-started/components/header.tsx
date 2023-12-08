// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { HelpPanel, Header, Box, SpaceBetween, Button } from '@cloudscape-design/components';
import { InfoLink, useHelpPanel } from '../../../components';
import { useNavigate } from 'react-router-dom';

export function GettingStartedMainInfo() {
	return (
		<HelpPanel
			header={<h2>Help</h2>}
		>
			<p>Placeholder for help text...</p>
		</HelpPanel>
	);
}

export function GettingStartedHeader() {
	const loadHelpPanelContent = useHelpPanel();
	const navigate = useNavigate();
	return (
		<SpaceBetween size='s'>
			<Header variant='h1'
					info={<InfoLink onFollow={() => loadHelpPanelContent(<GettingStartedMainInfo />)} />}
					actions={<Button variant="primary" onClick={() => navigate('/feeds')}>Upload your data</Button>}>
				Air Quality Data Analyzer
			</Header>
			<Box fontSize="heading-l">Automatically map the schema of your air quality sensor data.</Box>
		</SpaceBetween>
	);
}
