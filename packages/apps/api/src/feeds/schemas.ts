import { Static, Type } from "@sinclair/typebox";

export const newFeedResource = Type.Object(
	{
		expiration: Type.Optional(Type.Number({description: 'The number of seconds before presigned url expires, default to 5 minutes', default: 300})),
		dataRow: Type.Number({description: 'The row the data starts from the file'})
	},
	{$id: 'newFeedResource'}
);
export type NewFeed = Static<typeof newFeedResource>;

/**
 * Evaluation specific resource attributes
 */
const url = Type.String({ description: 'Pre-signed S3 url to upload the feeds data.' });

// eslint-disable-next-line @rushstack/typedef-var
export const feedUploadResource = Type.Object(
	{
		url,
	},
	{ $id: 'scenarioServiceItemsResource' }
);
export type FeedUploadResource = Static<typeof feedUploadResource>;
