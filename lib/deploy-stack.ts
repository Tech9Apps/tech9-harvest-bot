import {Duration, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";
import {Rule, Schedule} from "aws-cdk-lib/aws-events";
import {LambdaFunction} from "aws-cdk-lib/aws-events-targets";
import {join} from "path";

const {
  STAGE,
  HARVEST_ACCOUNT_ID,
  HARVEST_PERSONAL_TOKEN,
  PILOT_USERS,
  SLACK_BOT_TOKEN
} = process.env;

export class DeployStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // lambda
    const name = `${STAGE}-tech9-harvest-bot`;
    const botHandler = new NodejsFunction(this, name, {
      functionName: name,
      runtime: Runtime.NODEJS_14_X,
      memorySize: 1024,
      timeout: Duration.minutes(15),
      entry: path.join(__dirname, `../src/index.js`),
      depsLockFilePath: join(__dirname, "..", 'yarn.lock'),
      handler: 'handler',
      environment: {
        STAGE: STAGE!,
        HARVEST_ACCOUNT_ID: HARVEST_ACCOUNT_ID!,
        HARVEST_PERSONAL_TOKEN: HARVEST_PERSONAL_TOKEN!,
        PILOT_USERS: PILOT_USERS!,
        SLACK_BOT_TOKEN: SLACK_BOT_TOKEN!,
      }
    })

    const eventRule = new Rule(this, 'scheduleRule', {
      schedule: Schedule.cron({ day: '1' }),
    });

    eventRule.addTarget(new LambdaFunction(botHandler))
  }
}