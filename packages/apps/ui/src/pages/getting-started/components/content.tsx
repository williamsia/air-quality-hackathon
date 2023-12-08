// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Box, SpaceBetween, TextContent, Button } from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';

// const style= {
// 	['float' as any]: 'right',
// 	['margin' as any]: '0 0 0 15px',
// 	['height' as any]: '332px',
// 	['width' as any]: '288px'
//   };


export function GettingStartedOverView() {
	return (
		<SpaceBetween size="s">

			<TextContent>
				<br/><br/>
				<h2>Overview</h2>
				{/* <img src="/gettingStarted.png"  width="200" height="200" style={style}></img> */}

				<Box color="text-body-secondary" display="inline" fontSize="body-s" fontWeight="normal" variant="p">
					Air Quality Demo
				</Box>

				<p>
					<small>The solution relies on few key concepts:</small>
				</p>
				<ul>
					<li>
						<strong>Evaluation:</strong> <small>container of your evaluation with a baseline, up to five optimization scenarios and a report</small>
					</li>
				</ul>
			</TextContent>
		</SpaceBetween>
	);
}

export function GettingStarted() {
	const navigate = useNavigate();
	return (
		<SpaceBetween size="s">
			<TextContent >
				<h2>Get started</h2>
				<h5>Step 1: Upload your air quality data.</h5>
				<p>
					<small>Upload Data.</small>
				</p>

			</TextContent>
			<Box textAlign='right'><Button variant="primary" onClick={() => navigate('/feeds')} >Upload your data</Button></Box>

		</SpaceBetween>
	);
}
