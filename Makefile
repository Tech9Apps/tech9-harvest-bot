run-local:
	rm -rf ./cdk.out
	cdk synth
	sam local invoke -t ./cdk.out/dev-Tech9HarvestSlackBot.template.json
