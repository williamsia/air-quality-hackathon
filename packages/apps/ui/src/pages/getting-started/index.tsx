// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
import '../../styles/base.scss';

import React, { useRef, useState } from 'react';

import { AppLayoutProps } from '@cloudscape-design/components';
// SPDX-License-Identifier: MIT-0
import ContentLayout from '@cloudscape-design/components/content-layout';

import { Breadcrumbs } from '../../components';
import ShellLayout from '../../layouts/shell';
import { GettingStarted } from './components/content';
import { GettingStartedHeader, GettingStartedMainInfo } from './components/header';

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
