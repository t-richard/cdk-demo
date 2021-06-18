import {App} from "@aws-cdk/core";
import {HelloCdkStack} from "./hello-cdk-stack";

const app = new App();
new HelloCdkStack(app, 'Hello', { env: { region: 'eu-central-1', account: '188298251865' } });
app.synth();