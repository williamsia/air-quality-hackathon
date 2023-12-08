// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import ContentLayout from '@cloudscape-design/components/content-layout';
import React, { FormEventHandler, useEffect, useRef, useState } from 'react';
import { Alert, AppLayoutProps, Box, Button, ColumnLayout, Container, FileUpload, Form, FormField, Grid, Header, Modal, ProgressBar, SpaceBetween, Spinner } from '@cloudscape-design/components';
import { Breadcrumbs } from '../../components';
import ShellLayout from '../../layouts/shell';
import '../../styles/form.scss';
import { EvaluationHeader, EvaluationMainInfo } from './components/header';
import { useLazyGetDownloadUrlQuery, useUploadFileMutation } from '../../services/afriset.ts';
import { ProcessingSteps } from './components/processingSteps.tsx';
const websocketUrl = import.meta.env.VITE_SCENARIO_WEBSOCKET_API_BASE_URL;

interface WsMessage {
    status: "success" | "error",
    stepNumber: number,
}

const finishedReviewingData: WsMessage = {
    status: "success",
    stepNumber: 1
}

const finishedSavingData: WsMessage = {
    status: "success",
    stepNumber: 2
}

export function QueryData() {
	const [wsConnection, setWsConnection] = useState<WebSocket>();
    

	useEffect(() => {
		if (wsConnection) {
			wsConnection.onopen = (e) => {
				console.log('connection is established' + JSON.stringify(e));
			};
			wsConnection.onmessage = (message) => {
				console.log(message.data);
                try {
                const messageData: WsMessage = JSON.parse(message.data);
                if (messageData) {
                    if (messageData.status === "error") {
                        setUploadStep(messageData.stepNumber);
                        setUploadIsError(true);
                    } else {
                        if (messageData.stepNumber === 2) {
                            setUploadStep(4);
                        } else {
                            setUploadStep(messageData.stepNumber + 1);
                        }
                        setUploadIsError(false);
                    }
                }}
                catch (e) {
                }
			};
		}
	}, [wsConnection]);

	const appLayoutRef = useRef<AppLayoutProps.Ref>(null);
	const [toolsOpen, setToolsOpen] = useState(false);
	const [toolsContent, setToolsContent] = useState<React.ReactNode>(() => <EvaluationMainInfo />);

	const loadHelpPanelContent = (content: React.ReactNode) => {
		setToolsOpen(true);
		setToolsContent(content);
		appLayoutRef.current?.focusToolsClose();
	};

	const [files, setFiles] = React.useState<File[]>([]);

	const [upload, response] = useUploadFileMutation();

	const [uploadStep, setUploadStep] = useState<number>(-1);
    const [uploadIsError, setUploadIsError] = useState<boolean>(false);
	const [downloadStep, setDownloadStep] = useState<number>(-1);

	useEffect(() => {
		if (response.data?.feedId) {
			getDownloadUrl({
				feedId: response.data?.feedId,
			})
				.unwrap()
				.then((url) => {
					setPresignedDownloadUrl(url);
                    setUploadStep(1);
				});
		}
	}, [response.data?.feedId]);

	const [presignedDownloadUrl, setPresignedDownloadUrl] = useState<string>('');

	const [getDownloadUrl] = useLazyGetDownloadUrlQuery();

	const [s3ObjectNotExistNotification, setS3ObjectNotExistNotification] = useState('');

	const onClickDownload = async () => {
        setDownloadStep(1);
		await downloadFile(presignedDownloadUrl);
        setDownloadStep(3);
        setUploadStep(4);
	};
	const onSubmit: FormEventHandler<any> = async (event) => {
        setDownloadStep(-1);
        setUploadStep(0);
        setUploadIsError(false);
		event.preventDefault();
		upload({ dataRow: 1, file: files[0], fileType: 'csv' });
		setFiles([]);
	};

	useEffect(() => {
		const connection = new WebSocket(websocketUrl);
		setWsConnection(connection);
		return () => {
			if (wsConnection) {
				wsConnection.close();
			}
		};
	}, []);

	const downloadFile = async (s3Url: string) => {
		const link = document.createElement('a');
		link.href = s3Url;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
        
	};

	return (
		<ShellLayout
			innerRef={appLayoutRef}
			breadcrumbs={
				<Breadcrumbs
					items={[
						{ text: 'Feeds', href: '/feeds' },
						{ text: 'Upload data', href: '#/' },
					]}
				/>
			}
			contentType="form"
			tools={toolsContent}
			toolsOpen={toolsOpen}
			onToolsChange={({ detail }) => setToolsOpen(detail.open)}
			loadHelpPanelContent={loadHelpPanelContent}
			disableContentPaddings={false}
		>
			<ContentLayout header={<EvaluationHeader />}>
				{s3ObjectNotExistNotification && (
					<Alert type="warning" header="S3 Download" dismissible={true} onDismiss={() => setS3ObjectNotExistNotification('')}>
						{s3ObjectNotExistNotification}
					</Alert>
				)}
				<SpaceBetween direction="vertical" size="m">
					<Container header={<Header>Upload your data</Header>}>
						<Grid gridDefinition={[{ colspan: 8 }, { colspan: 4 }]}>
							<form onSubmit={onSubmit}>
								<Form
									variant="full-page"
									actions={
										<SpaceBetween direction="horizontal" size="xs">
											<Button disabled={files.length < 1 || response.isLoading} variant="primary">
												Submit
											</Button>
										</SpaceBetween>
									}
									errorIconAriaLabel="Error"
								>
									<FormField label="File Upload" description="Select a local file that you would like to process">
										<FileUpload
											onChange={({ detail }) => setFiles(detail.value)}
											value={files}
											i18nStrings={{
												uploadButtonText: (e) => (e ? 'Choose files' : 'Choose file'),
												dropzoneText: (e) => (e ? 'Drop files to upload' : 'Drop file to upload'),
												removeFileAriaLabel: (e) => `Remove file ${e + 1}`,
												limitShowFewer: 'Show fewer files',
												limitShowMore: 'Show more files',
												errorIconAriaLabel: 'Error',
											}}
											showFileLastModified
											showFileSize
											showFileThumbnail
											tokenLimit={3}
											constraintText=".csv files supported"
										/>
									</FormField>
								</Form>
							</form>
							<ProcessingSteps steps={['Uploading data', 'Reviewing data', 'Saving data', 'Complete']} stepNumber={uploadStep} error={uploadIsError}/>
						</Grid>
					</Container>
					<Container header={<Header>Download the results</Header>}>
                    <Grid gridDefinition={[{ colspan: 8 }, { colspan: 4 }]}>

						<Button iconAlign="right" iconName="download" disabled={response.data?.feedId === undefined || downloadStep >= 3} onClick={onClickDownload}>
							Download
						</Button>
				<ProcessingSteps steps={['Querying data', 'Downloading data', 'Complete']} stepNumber={downloadStep} />
                </Grid>
					</Container>
				</SpaceBetween>
			</ContentLayout>
		</ShellLayout>
	);
}
