// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { useEffect, useState } from 'react';

// SPDX-License-Identifier: MIT-0
export const useSplitPanel = (selectedItems: unknown[]) => {
	const [splitPanelSize, setSplitPanelSize] = useState(300);
	const [splitPanelOpen, setSplitPanelOpen] = useState(false);
	const [hasManuallyClosedOnce, setHasManuallyClosedOnce] = useState(false);

	const onSplitPanelResize = ({ detail: { size } }: { detail: { size: number } }) => {
		setSplitPanelSize(size);
	};

	const onSplitPanelToggle = ({ detail: { open } }: { detail: { open: boolean } }) => {
		setSplitPanelOpen(open);

		if (!open) {
			setHasManuallyClosedOnce(true);
		}
	};

	useEffect(() => {
		if (selectedItems.length && !hasManuallyClosedOnce) {
			setSplitPanelOpen(true);
		}
	}, [selectedItems.length, hasManuallyClosedOnce]);

	return {
		splitPanelOpen,
		onSplitPanelToggle,
		splitPanelSize,
		onSplitPanelResize
	};
};
