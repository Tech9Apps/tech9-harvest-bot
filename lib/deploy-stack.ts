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
  SLACK_BOT_TOKEN,
  MANAGERS,
  IGNORE_USERS
} = process.env;

export class DeployStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // lambda
    const weeklyBotName = `${STAGE}-tech9-harvest-bot-weekly`;
    const weeklyBotHandler = new NodejsFunction(this, weeklyBotName, {
      functionName: weeklyBotName,
      runtime: Runtime.NODEJS_14_X,
      bundling: {
        nodeModules: ['axios', '@slack/web-api', 'date-fns', 'reflect-metadata', 'harvest-v2'],
      },
      memorySize: 512,
      timeout: Duration.minutes(15),
      entry: path.join(__dirname, `../src/weekly.ts`),
      depsLockFilePath: join(__dirname, "..", 'yarn.lock'),
      handler: 'weekly',
      environment: {
        STAGE: STAGE!,
        HARVEST_ACCOUNT_ID: HARVEST_ACCOUNT_ID!,
        HARVEST_PERSONAL_TOKEN: HARVEST_PERSONAL_TOKEN!,
        PILOT_USERS: PILOT_USERS!,
        SLACK_BOT_TOKEN: SLACK_BOT_TOKEN!,
        MANAGERS: MANAGERS!,
        IGNORE_USERS: IGNORE_USERS!
      }
    })

    const dailyEventRule = new Rule(this, `${STAGE}-scheduleRule-weekly`, {
      schedule: Schedule.expression("cron(0 4 * * ? *)"),
    });

    dailyEventRule.addTarget(new LambdaFunction(weeklyBotHandler))

    // lambda
    const monthlyName = `${STAGE}-tech9-harvest-bot-monthly`;
    const monthlyBotHandler = new NodejsFunction(this, monthlyName, {
      functionName: monthlyName,
      runtime: Runtime.NODEJS_14_X,
      bundling: {
        nodeModules: ['axios', '@slack/web-api', 'date-fns', 'reflect-metadata', 'harvest-v2'],
      },
      memorySize: 512,
      timeout: Duration.minutes(15),
      entry: path.join(__dirname, `../src/monthly.ts`),
      depsLockFilePath: join(__dirname, "..", 'yarn.lock'),
      handler: 'monthly',
      environment: {
        STAGE: STAGE!,
        HARVEST_ACCOUNT_ID: HARVEST_ACCOUNT_ID!,
        HARVEST_PERSONAL_TOKEN: HARVEST_PERSONAL_TOKEN!,
        PILOT_USERS: PILOT_USERS!,
        SLACK_BOT_TOKEN: SLACK_BOT_TOKEN!,
        MANAGERS: MANAGERS!,
        IGNORE_USERS: IGNORE_USERS!
      }
    })

    const monthlyEventRule = new Rule(this, `${STAGE}-scheduleRule-monthly`, {
      schedule: Schedule.expression("cron(0 14 L * ? *)"),
    });

    monthlyEventRule.addTarget(new LambdaFunction(monthlyBotHandler))
  }
}
