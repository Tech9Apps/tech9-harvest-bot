ifeq ($(OS),Windows_NT)
	ENV := ${CURDIR}\.env
	CWD := ${CURDIR}
else
	ENV := $(PWD)/.env
	CWD := $(PWD)
endif

include $(ENV)

export

run-local-daily:
	rm -rf ./cdk.out
	cdk synth
	sam local invoke -t ./cdk.out/dev-Tech9HarvestSlackBot.template.json dev-tech9-harvest-bot-weekly


run-local-monthly:
	rm -rf ./cdk.out
	cdk synth
	sam local invoke -t ./cdk.out/dev-Tech9HarvestSlackBot.template.json dev-tech9-harvest-bot-monthly