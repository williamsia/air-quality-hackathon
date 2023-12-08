// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Box, SpaceBetween, TextContent, Button, Container, Header } from '@cloudscape-design/components';
import { useNavigate } from 'react-router-dom';

export function GettingStartedOverView() {
	return (
		<SpaceBetween size="s">

			<TextContent>
				<br/><br/>
				<h2>Overview</h2>
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
		<Container
		header={
			<Header>
				Getting Started
			</Header>
		}>
			<SpaceBetween direction='vertical' size='s'>
			<TextContent >
				<p>Welcome to the Afri-SET Air Quality Data Analyzer. This tool will take sensor data from various manufacturers and automatically map it into a standardized format.</p>
				<h5>Step 1: Upload your air quality data in a comma-separated values (CSV) file.</h5>
				<p>
					The file will be sent to a Large language model (LLM), which automatically detects the schema and defines a transformation that will convert it into a standardized format. The input data is then transformed and stored in a data store.
				</p>
				<h5>Step 2: Download the results.</h5>
				<p>
					The application queries the data store for your transformed data and lets you download it as a new CSV file.
				</p>

			</TextContent>
			<Box textAlign='right'><Button variant="primary" onClick={() => navigate('/feeds')} >Upload your data</Button></Box>
</SpaceBetween>
		</Container>
	);
}
