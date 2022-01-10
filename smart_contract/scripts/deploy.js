const main = async () => {
	const Transactions = await hre.ethers.getContractFactory("Transactions");
	const transactions = await Transactions.deploy();

	await transactions.deployed();

	console.log(transactions.address);
};

const runMain = async () => {
	try {
		await main();
		process.exit(0);
	} catch (e) {
		console.log(e);
		process.exit(1);
	}
};

runMain();
