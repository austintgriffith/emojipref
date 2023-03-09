import { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";

// in ETH
const FAUCET_AMOUNT = "0.02";
const wallet_private_key = process.env.WALLET_PRIVATE_KEY;

// ToDo. Protect endpoint
export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (!wallet_private_key) return;
  if (request.method !== "POST") {
    response.status(405).json({ message: "Only POST requests allowed" });
    return;
  }

  const { address } = request.body;

  if (!ethers.utils.isAddress(address)) {
    response.status(400).json({ message: "Wrong address" });
  }

  // Init providers
  const gnosisProvider = new ethers.providers.JsonRpcProvider("https://rpc.gnosischain.com");

  // Init signers
  const gnosisWallet = new ethers.Wallet(wallet_private_key, gnosisProvider);

  // ToDo. handle errors.
  const tx = await gnosisWallet.sendTransaction({
    to: address,
    value: ethers.utils.parseEther(FAUCET_AMOUNT),
  });

  console.log("TX", tx);

  console.log("waiting...", await tx.wait());

  response.status(200).end();
}
