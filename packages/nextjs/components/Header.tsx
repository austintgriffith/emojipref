import React from "react";
import Link from "next/link";
import { FaucetButton } from "~~/components/scaffold-eth";
import RainbowKitCustomConnectButton from "~~/components/scaffold-eth/RainbowKitCustomConnectButton";

/**
 * Site header
 */
export default function Header() {
  return (
    <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 flex-shrink-0 justify-between z-20 shadow-md shadow-secondary">
      <div className="navbar-start w-auto lg:w-1/2">
        <div className="flex items-center gap-2 ml-4 mr-6">
          <Link href="/" passHref className="flex relative w-10 h-10 text-4xl">
            😁
          </Link>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">Emoji Prediction</span>
          </div>
        </div>
      </div>
      <div className="navbar-end flex-grow mr-4">
        <RainbowKitCustomConnectButton />
        <FaucetButton />
      </div>
    </div>
  );
}
