// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Header, HelpPanel } from '@cloudscape-design/components';
import { InfoLink, useHelpPanel } from '../../../components';

export function EvaluationMainInfo() {
	return (
		<HelpPanel
			header={<h2>Help</h2>}
		>
			<p>Placeholder for help text...</p>
		</HelpPanel>
	);
}

export function EvaluationHeader() {
	const loadHelpPanelContent = useHelpPanel();
	return (
		<Header variant="h1" description="Upload your files to a feed" info={<InfoLink onFollow={() => loadHelpPanelContent(<EvaluationMainInfo />)} />}>
			Feeds
		</Header>
	);
}
