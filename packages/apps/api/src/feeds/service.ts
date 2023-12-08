import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { FastifyBaseLogger } from "fastify";
// @ts-ignore
import ow from 'ow';
import { NewFeed } from "./schemas.js";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ulid } from "ulid";

export class FeedService {

	constructor(private readonly logger: FastifyBaseLogger,
				private readonly s3Client: S3Client,
				private readonly feedBucket: string) {
	}

	public async create(newFeed: NewFeed): Promise<{feedId: string, url: string}> {
		this.logger.debug(`FeedService > create > newFeed: ${JSON.stringify(newFeed)}`);
		ow(newFeed.dataRow, ow.number.greaterThan(0));

		const id = ulid().toLowerCase();
		const itemKey = `feeds/input/${id}`
		const params = {Bucket: this.feedBucket, Key: itemKey};
		const s3Command = new PutObjectCommand(params);
		const signedUrl = await getSignedUrl(this.s3Client, s3Command, {expiresIn: newFeed.expiration});

		this.logger.debug(`FeedService > create > exit >`);
		return {feedId: id, url: signedUrl};
	}

}
