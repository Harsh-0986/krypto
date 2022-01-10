import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constant";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
	const provider = new ethers.providers.Web3Provider(ethereum);
	const signer = provider.getSigner();

	const transactionsContract = new ethers.Contract(
		contractAddress,
		contractABI,
		signer
	);
	return transactionsContract;
};

export const TransactionProvider = ({ children }) => {
	const [currentAccount, setCurrentAccount] = useState("");

	const [formData, setFormData] = useState({
		addressTo: "",
		amount: "",
		keyword: "",
		message: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [transactionCount, setTransactionCount] = useState(
		localStorage.getItem("transactionCount")
	);
	const [transactions, setTransactions] = useState([]);

	const handleChange = (e, name) => {
		setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
	};

	//Getting all transactions
	const getAllTransactions = async () => {
		try {
			if (!ethereum) return alert("Please install metamask");

			const transactionsContract = getEthereumContract();

			const availableTransactions =
				await transactionsContract.getAllTransactions();

			let power = 10 ** 18;

			//Creating a structured transaction
			const structuredTransactions = availableTransactions.map(
				(transaction) => ({
					addressTo: transaction.reciever,
					addressFrom: transaction.sender,
					timestamp: new Date(
						transaction.timestamp.toNumber() * 1000
					).toLocaleString(),
					message: transaction.message,
					keyword: transaction.keyword,
					amount: parseInt(transaction.amount._hex) / power,
				})
			);

			setTransactions(structuredTransactions);

			console.log(structuredTransactions);
		} catch (e) {
			console.log(e);
		}
	};

	const checkIfWalletIsConnected = async () => {
		try {
			if (!ethereum) return alert("Please Install Metamask");

			const accounts = await ethereum.request({ method: "eth_accounts" });

			if (accounts.length) {
				setCurrentAccount(accounts[0]);

				//Getting all transactions
				getAllTransactions();
			} else {
				console.log("No account found");
			}
		} catch (e) {
			console.log(e);
		}
	};

	// Checking for transactions
	const checkIfTransactionsExist = async () => {
		try {
			//Getting transactions contract
			const transactionsContract = getEthereumContract();
			//Getting transactions count
			const transactionCount =
				await transactionsContract.getTransactionCount();

			//Setting transaction count in localStorage
			window.localStorage.setItem("transactionCount", transactionCount);
		} catch (e) {
			console.log(e);
			throw new Error("No Ethereum object found");
		}
	};

	const connectWallet = async () => {
		try {
			if (!ethereum) return alert("Please install Metamask");

			//Getting all accounts logged in metamask
			const accounts = await ethereum.request({
				method: "eth_requestAccounts",
			});

			setCurrentAccount(accounts[0]);
		} catch (e) {
			console.log(e);

			throw new Error("No ethereum object");
		}
	};

	const sendTransaction = async () => {
		try {
			if (!ethereum) return alert("Please install metamask");
			//get data from form
			const { addressTo, amount, keyword, message } = formData;

			const transactionsContract = getEthereumContract();
			const parsedAmount = ethers.utils.parseEther(amount);
			await ethereum.request({
				method: "eth_sendTransaction",
				params: [
					{
						from: currentAccount,
						to: addressTo,
						gas: "0x5208", //21000 gwei
						value: parsedAmount._hex,
					},
				],
			});
			const transactionHash = await transactionsContract.addToBlockchain(
				addressTo,
				parsedAmount,
				message,
				keyword
			);

			setIsLoading(true);
			console.log(`Loading - ${transactionHash.hash}`);

			await transactionHash.wait();

			setIsLoading(false);
			console.log("Success");

			const transactionsCount =
				await transactionsContract.getTransactionCount();

			setTransactionCount(transactionsCount.toNumber());

			window.reload();
		} catch (e) {
			console.log(e);
			throw new Error("No Ethereum object found");
		}
	};

	useEffect(() => {
		checkIfWalletIsConnected();
		checkIfTransactionsExist();
	}, []);

	return (
		<TransactionContext.Provider
			value={{
				connectWallet,
				currentAccount,
				formData,
				setFormData,
				handleChange,
				sendTransaction,
				transactions,
				isLoading,
			}}
		>
			{children}
		</TransactionContext.Provider>
	);
};
