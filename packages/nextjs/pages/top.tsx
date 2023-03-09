import type { NextPage } from "next";
import React from "react";
import { useContractEvent } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

const Top: NextPage = () => {
  const { data: contractInfo } = useDeployedContractInfo("YourContract");

  console.log("contractInfo", contractInfo);

  const events = useContractEvent({
    address: contractInfo?.address,
    abi: contractInfo?.abi,
    eventName: "Register",
    listener(a) {
      console.log("EVENT", a);
    },
  });

  console.log("events", events);

  return <div className="flex flex-col items-center justify-center h-screen max-w-[500px] m-auto">TOP LIST</div>;
};

export default Top;
