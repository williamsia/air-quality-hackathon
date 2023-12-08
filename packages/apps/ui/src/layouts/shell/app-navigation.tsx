// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import TopNavigation from '@cloudscape-design/components/top-navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../../store.ts';
import { Auth } from 'aws-amplify';

export function AppNavigation() {
	const user = useSelector(
		(state: RootState) => state.auth?.user
	);

	return (
		<TopNavigation
			identity={{
				href: '/',
				title: 'Afri-SET Demo',
				logo: {
					src: '/afriset-logo.webp',
					alt: 'Afri-SET Demo'
				}
			}}
			utilities={[
				{
					type: 'menu-dropdown',
					text: user?.email,
					description: user?.email,
					iconName: 'user-profile',
					onItemClick: async (e) => {
						if (e.detail.id === 'signout') {
							await Auth.signOut();
						}
					},
					items: [
						{
							id: 'preferences', text: 'Preferences'
						},
						{
							id: 'support-group',
							text: 'Support',
							items: [
								{
									id: 'documentation',
									text: 'Documentation',
									href: '#',
									external: true,
									externalIconAriaLabel: ' (opens in new tab)'
								},
								{ id: 'support', text: 'Support' },
								{
									id: 'feedback',
									text: 'Feedback',
									href: '#',
									external: true,
									externalIconAriaLabel: ' (opens in new tab)'
								}
							]
						},
						{
							id: 'signout', text: 'Sign out'
						}
					]
				}
			]}
		/>
	);
}
