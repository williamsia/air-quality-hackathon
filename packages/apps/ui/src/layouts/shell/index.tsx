// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { AppLayoutProps } from '@cloudscape-design/components/app-layout';
import React from 'react';
import { HelpPanelProvider } from '../../components';
import { CustomAppLayout } from '../../components/common-components';
import { useLocalStorage } from '../../components/use-local-storage';
import { Notifications } from '../../components';
import { AppNavigation } from './app-navigation';
import { AppSideNavigation } from './side-navigation';
import './styles.css';

// const splitPanelMaxSize = 360;

export interface ShellProps {
	innerRef: React.RefObject<AppLayoutProps.Ref>;
	breadcrumbs?: AppLayoutProps['breadcrumbs'];
	contentType?: AppLayoutProps.ContentType;
	tools?: AppLayoutProps['tools'];
	toolsOpen?: AppLayoutProps['toolsOpen'];
	onToolsChange?: AppLayoutProps['onToolsChange'];
	children?: AppLayoutProps['content'];
	splitPanel?: AppLayoutProps['splitPanel'];
	splitPanelOpen?: AppLayoutProps['splitPanelOpen'];
	splitPanelPosition?: 'side' | 'bottom';
	onSplitPanelToggle?: AppLayoutProps['onSplitPanelToggle'];
	loadHelpPanelContent: (content: React.ReactNode) => void;
	disableContentPaddings?: boolean;
}

export default function Shell({
								  innerRef,
								  breadcrumbs,
								  contentType,
								  tools,
								  toolsOpen,
								  onToolsChange,
								  children,
								  splitPanel,
								  splitPanelOpen,
								  splitPanelPosition,
								  onSplitPanelToggle,
								  loadHelpPanelContent,
								  disableContentPaddings
							  }: ShellProps) {
	const [splitPanelSize, setSplitPanelSize] = useLocalStorage(
		`React-ConfigurableDashboard-SplitPanelSize-${splitPanelPosition}`,
		360
	);

	return (
		<HelpPanelProvider value={loadHelpPanelContent}>
			<AppNavigation />
			<CustomAppLayout
				ref={innerRef}
				contentType={contentType}
				breadcrumbs={breadcrumbs}
				navigation={<AppSideNavigation />}
				toolsOpen={toolsOpen}
				tools={tools}
				onToolsChange={onToolsChange}
				notifications={<Notifications />}
				stickyNotifications={true}
				content={children}
				headerSelector='#top-nav'
				splitPanel={splitPanel}
				splitPanelPreferences={{ position: splitPanelPosition! }}
				splitPanelOpen={splitPanelOpen}
				onSplitPanelToggle={onSplitPanelToggle}
				splitPanelSize={splitPanelSize}
				onSplitPanelResize={event => setSplitPanelSize(event.detail.size)}
				ariaLabels={{
					navigation: 'Navigation drawer',
					navigationClose: 'Close navigation drawer',
					navigationToggle: 'Open navigation drawer',
					notifications: 'Notifications',
					tools: 'Help panel',
					toolsClose: 'Close help panel',
					toolsToggle: 'Open help panel'
				}}
				disableContentPaddings={disableContentPaddings ?? false}
			/>
		</HelpPanelProvider>
	);
}
