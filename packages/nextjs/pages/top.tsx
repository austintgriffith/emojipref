import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { useContractEvent, useContractReads } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { Address } from "~~/components/scaffold-eth";
import { ethers } from "ethers";

const Top: NextPage = () => {
  const [registerAddresses, setRegisterAddresses] = useState({});
  const [readData, setReadData] = useState<any>(null);
  const { data: contractInfo } = useDeployedContractInfo("YourContract");

  const emojiContract = {
    address: contractInfo?.address,
    abi: contractInfo?.abi,
  };

  const { data: balanceData } = useContractReads({
    contracts: readData,
  });

  useEffect(() => {
    // @ts-ignore
    const readData = [];
    Object.entries(registerAddresses).map(([address]) =>
      readData.push({
        ...emojiContract,
        functionName: "balanceOf",
        args: [address],
      }),
    );
    // @ts-ignore
    setReadData(readData);
  }, [registerAddresses]);

  useEffect(() => {
    // @ts-ignore
    // @ts-ignore
    Object.entries(registerAddresses).map(([address], index) =>
      setRegisterAddresses(previousState => ({
        ...previousState,
        [address as string]: {
          // @ts-ignore
          ...previousState[address as string],
          // @ts-ignore
          balance: balanceData && ethers.utils.formatEther(balanceData?.[index].toString() ?? "0"),
        },
      })),
    );
  }, [balanceData]);

  // useEffect(() => {}, [balanceData]);

  console.log("contractInfo", contractInfo);

  useContractEvent({
    address: contractInfo?.address,
    abi: contractInfo?.abi,
    eventName: "Register",
    listener(address) {
      console.log("EVENT", address);
      setRegisterAddresses(previousState => ({
        ...previousState,
        [address as string]: {
          registered: true,
          // @ts-ignore
          ...previousState[address as string],
        },
      }));
    },
  });

  console.log("data", balanceData);

  return (
    <div className="flex flex-col h-screen m-auto pt-10">
      <h1 className="font-bold text-center">TOP LIST</h1>
      <ul>
        {Object.entries(registerAddresses)
          .sort(function (a, b) {
            // @ts-ignore
            const aBalance = a[1]?.balance ?? "0";
            // @ts-ignore
            const bBalance = b[1]?.balance ?? "0";
            return bBalance - aBalance;
          })
          .map(([address, value]) => (
            <li key={address} className="pt-2 flex gap-2">
              <Address address={address} />
              {/* @ts-ignore*/}
              <div>
                <span className="font-bold">Score:</span> {/* @ts-ignore */}
                {value.balance}
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Top;
