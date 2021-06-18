import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as rds from '@aws-cdk/aws-rds';

export class HelloCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const isProduction = process.env.PRODUCTION === 'true';
    const allowedIps = ['45.132.251.229/32', '134.115.152.29/32', '177.127.29.205/32', '48.150.56.15/32', '100.202.255.202/32'];

    const vpc = new ec2.Vpc(this, 'PrimaryVPC', {
      natGateways: isProduction ? undefined : 1,
      natGatewayProvider: isProduction ?
          ec2.NatProvider.gateway() :
          ec2.NatProvider.instance({ instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.NANO) }),
    });

    const securityGroup = new ec2.SecurityGroup(this, 'RDSSecurityGroup', {
      vpc: vpc,
    });

    for (const ip of allowedIps) {
      securityGroup.addIngressRule(ec2.Peer.ipv4(ip), ec2.Port.tcp(5432))
    }

    const database = new rds.DatabaseInstance(this, 'Database', {
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_13_2 }),
      vpc: vpc,
      multiAz: isProduction,
      securityGroups: [securityGroup],
    });

    const bucket = new s3.Bucket(this, 'MyFirstBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: !isProduction,
    });
  }
}