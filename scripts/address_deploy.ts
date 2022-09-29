import * as fs from "fs";

const updateAddressDeploy = (func: any) => {
	let rawdata = fs.readFileSync("./address_deploy.json", { encoding: "utf8", flag: "r" });
	const previous = JSON.parse(rawdata);
	const updated = func(previous);
	fs.writeFileSync("./address_deploy.json", JSON.stringify(updated, null, 2));
};

const setAddressDeploy = (path: any, val: any) => {
	path = path.split(".").reverse();
	updateAddressDeploy((config: any) => {
		var ref = config;
		while (path.length > 1) {
			const key = path.pop();
			if (!ref[key]) {
				ref[key] = {};
			}
			ref = ref[key];
		}
		ref[path.pop()] = val;
		return config;
	});
};

function findNetworkNameFromArgv() {
	const index = process.argv.findIndex((arg) => arg === "--network");

	if (index === -1) {
		return null;
	}

	const networkName = process.argv[index + 1];

	return networkName;
}

export { updateAddressDeploy, setAddressDeploy, findNetworkNameFromArgv };
