
import { Construct } from "constructs";

import { AccessPoint, FileSystem, PerformanceMode, ThroughputMode } from 'aws-cdk-lib/aws-efs';
import { InstanceType, Vpc, Instance, InstanceClass, InstanceSize, AmazonLinuxImage, AmazonLinuxGeneration } from 'aws-cdk-lib/aws-ec2';
import { PolicyDocument, PolicyStatement, AccountRootPrincipal } from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';

export interface StateMachineProperties {
	environment: string;
}

export class FeedMapping extends Construct {
	constructor(scope: Construct, id: string, props: StateMachineProperties) {
		super(scope, id);


		const namePrefix = `afriset-${props.environment}`;

		//  Retrieve Default VPC information
		const vpc = Vpc.fromLookup(this, "VPC",{isDefault: true});

		const fileSystemPolicy = new PolicyDocument({
			statements: [new PolicyStatement({
			  actions: [
				'elasticfilesystem:ClientWrite',
				'elasticfilesystem:ClientMount',
			  ],
			  principals: [new AccountRootPrincipal()],
			  resources: ['*'],
			  conditions: {
				Bool: {
				  'elasticfilesystem:AccessedViaMountTarget': 'true',
				},
			  },
			})],
		  });

		const fileSystem = new FileSystem(this, 'FileSystem', {
			vpc,
			encrypted: true,
			performanceMode: PerformanceMode.GENERAL_PURPOSE,
			throughputMode: ThroughputMode.BURSTING,
			fileSystemName: `${namePrefix}-python-dependency`,
			fileSystemPolicy: fileSystemPolicy,
			removalPolicy: cdk.RemovalPolicy.DESTROY
		});

		new AccessPoint(this, 'AccessPoint', {
			createAcl: {
				ownerGid: '1002',
				ownerUid: '1002',
				permissions: '755'
			},
			path: '/accessPoint',
			fileSystem: fileSystem,
			posixUser: {
				uid: '1002',
				gid: '1002'
			}
		});

		const ec2Instance = new Instance(this,'Dependency Installer',{
			vpc,
			// securityGroup TODO
			instanceType:  InstanceType.of(InstanceClass.BURSTABLE2, InstanceSize.LARGE),
			machineImage: new AmazonLinuxImage({generation: AmazonLinuxGeneration.AMAZON_LINUX_2}),
		});

		fileSystem.connections.allowDefaultPortFrom(ec2Instance);
		const fileSystemId = fileSystem.fileSystemId;
		const mountPoint =  '/mnt/efs/fs1';
		ec2Instance.userData.addCommands("yum check-update -y",
			"yum upgrade -y",
		 	"yum install -y amazon-efs-utils",
			"yum install -y nfs-utils",
			`file_system_id_1= ${fileSystem.fileSystemId}`,
			`efs_mount_point_1= ${mountPoint}`,
			`mkdir -p "${mountPoint}"`,
			`test -f "/sbin/mount.efs" && echo "${fileSystemId}:/ ${mountPoint} efs defaults,_netdev" >> /etc/fstab || " + "echo "${fileSystemId}.efs." + Stack.of(self).region + ".amazonaws.com:/ ${mountPoint} nfs4 nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2,noresvport,_netdev 0 0" >> /etc/fstab`,
			"mount -a -t efs,nfs4 defaults",
			'pip3 install — target /mnt/efs/dependency langchain==0.0.309',
			'pip3 install — target /mnt/efs/dependency transformers>=4.24,<5',
			'pip3 install — target /mnt/efs/dependency faiss-cpu>=1.7,<2',
			'pip3 install — target /mnt/efs/dependency ipywidgets>=7,<8',
			'pip3 install — target /mnt/efs/dependency unstructured>=0.11.2',
			'pip3 install — target /mnt/efs/dependency sqlalchemy>=2.0.23',
			'pip3 install — target /mnt/efs/dependency datasets>=2.15.0',
			'pip3 install — target /mnt/efs/dependency tiktoken>=0.4.0',
			'pip3 install — target /mnt/efs/dependency deepdiff>=6.7.1',
			);





	}


}
