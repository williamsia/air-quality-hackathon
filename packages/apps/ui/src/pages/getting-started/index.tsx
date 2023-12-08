// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import ContentLayout from '@cloudscape-design/components/content-layout';
import React, { useRef, useState } from 'react';
import { AppLayoutProps } from '@cloudscape-design/components';
import { Breadcrumbs } from '../../components';
import ShellLayout from '../../layouts/shell';
import { GettingStartedHeader, GettingStartedMainInfo } from './components/header';
import { GettingStarted, GettingStartedOverView } from './components/content';
import '../../styles/base.scss';


export function GettingStartedPage() {
	const appLayoutRef = useRef<AppLayoutProps.Ref>(null);

	const [toolsOpen, setToolsOpen] = useState(false);
	const [toolsContent, setToolsContent] = useState<React.ReactNode>(() => <GettingStartedMainInfo />);

	const loadHelpPanelContent = (content: React.ReactNode) => {
		setToolsOpen(true);
		setToolsContent(content);
		appLayoutRef.current?.focusToolsClose();
	};

	return (
		<ShellLayout
			innerRef={appLayoutRef}
			breadcrumbs={<Breadcrumbs items={[{ text: 'Getting started', href: '#/' }]} />}
			contentType='default'
			tools={toolsContent}
			toolsOpen={toolsOpen}
			onToolsChange={({ detail }) => setToolsOpen(detail.open)}
			loadHelpPanelContent={loadHelpPanelContent}
		>

			<ContentLayout  header={<GettingStartedHeader />} >
				<GettingStarted></GettingStarted>
			</ContentLayout>


		</ShellLayout>
	);
}
