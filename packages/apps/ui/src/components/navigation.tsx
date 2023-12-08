// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import SideNavigation, { SideNavigationProps } from '@cloudscape-design/components/side-navigation';

const navHeader = { text: 'Menu', href: '#/' };

const defaultOnFollowHandler: SideNavigationProps['onFollow'] = event => {
  // keep the locked href for our demo pages
  event.preventDefault();
};

interface NavigationProps {
  activeHref?: string;
  header?: SideNavigationProps['header'];
  items?: SideNavigationProps['items'];
  onFollowHandler?: SideNavigationProps['onFollow'];
}

export function Navigation({
  activeHref,
  header = navHeader,
  items,
  onFollowHandler = defaultOnFollowHandler,
}: NavigationProps) {
  return <SideNavigation items={items} header={header} activeHref={activeHref} onFollow={onFollowHandler} />;
}
