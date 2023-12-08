// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { SideNavigationProps } from '@cloudscape-design/components/side-navigation';
import { Navigation as CommonNavigation } from '../../components';
import { useNavigate } from 'react-router-dom';

const navItems: SideNavigationProps['items'] = [
	{ type: 'link', text: 'Getting started', href: '/' },
	{ type: 'link', text: 'Feeds', href: '/feeds' },

];

export function AppSideNavigation() {
	const navigate = useNavigate();
	const onFollowHandler: SideNavigationProps['onFollow'] = (event) => {
		event.preventDefault();
		navigate(event.detail.href);
	};

	return (
		<>
			<CommonNavigation items={navItems} activeHref='#/' onFollowHandler={onFollowHandler} />
		</>
	);
}
