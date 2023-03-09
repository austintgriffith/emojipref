import type { NextPage } from "next";
import Head from "next/head";
import React, { useEffect } from "react";
import { useAccountBalance, useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import emojiList from "~~/utils/emojiList";
import toast from "react-hot-toast";

const Home: NextPage = () => {
  const { address } = useAccount();

  const { balance } = useAccountBalance(address);

  const { data: gameOn } = useScaffoldContractRead("YourContract", "gameOn", []);

  const { data: round } = useScaffoldContractRead("YourContract", "round", []);
  const { data: owner } = useScaffoldContractRead("YourContract", "owner", []);

  const { data: counter } = useScaffoldContractRead("YourContract", "counter", [round]);

  // todo usecontractmultipleread
  const { data: firstEmoji } = useScaffoldContractRead("YourContract", "indexOfDisplay", [0]);
  const { data: secondEmoji } = useScaffoldContractRead("YourContract", "indexOfDisplay", [1]);
  const { data: thirdEmoji } = useScaffoldContractRead("YourContract", "indexOfDisplay", [2]);
  const { data: fourthEmoji } = useScaffoldContractRead("YourContract", "indexOfDisplay", [3]);

  const display = [firstEmoji, secondEmoji, thirdEmoji, fourthEmoji];

  const { writeAsync: startGame } = useScaffoldContractWrite("YourContract", "startGame", [
    Math.floor((Math.random() * 99999) % 256),
    Math.floor((Math.random() * 99999) % 256),
    Math.floor((Math.random() * 99999) % 256),
    Math.floor((Math.random() * 99999) % 256),
  ]);

  const [myPref, setMyPref] = React.useState(0);

  const { writeAsync: setPreference, isLoading: isSetPrefLoading } = useScaffoldContractWrite(
    "YourContract",
    "setPreference",
    [myPref],
  );

  const { data: savedPreference } = useScaffoldContractRead("YourContract", "preferences", [round, address]);

  const { writeAsync: endRound } = useScaffoldContractWrite("YourContract", "endRound", []);

  const { data: openToCollect } = useScaffoldContractRead("YourContract", "openToCollect", []);

  const { data: bestPref } = useScaffoldContractRead("YourContract", "bestPref", [round]);

  const { writeAsync: collect } = useScaffoldContractWrite("YourContract", "collect", []);

  const { writeAsync: startNextRound } = useScaffoldContractWrite("YourContract", "startNextRound", [
    Math.floor((Math.random() * 99999) % 256),
    Math.floor((Math.random() * 99999) % 256),
    Math.floor((Math.random() * 99999) % 256),
    Math.floor((Math.random() * 99999) % 256),
  ]);

  const { data: yourBalance } = useScaffoldContractRead("YourContract", "balanceOf", [address]);

  const cta = [];
  const renderDisplay = [];

  if (openToCollect) {
    renderDisplay.push(
      <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl cursor-pointer">
        <p className="text-8xl">{bestPref && emojiList[display[bestPref - 1]]}</p>
      </div>,
    );
    if (bestPref == savedPreference) {
      renderDisplay.push(
        <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl cursor-pointer">
          <button className="btn btn-primary" onClick={collect}>
            <p className="text-1xl">🎁 Collect Prize</p>
          </button>
        </div>,
      );
    } else {
      renderDisplay.push(
        <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl cursor-pointer">
          <p className="text-1xl">✨ waiting for next round</p>
        </div>,
      );
    }
  } else {
    for (let i = 1; i < 5; i++) {
      let thisOpacity = 0.4;
      if (!savedPreference && !myPref) thisOpacity = 0.77;
      if (!savedPreference && myPref == i) {
        thisOpacity = 1;
      } else if (savedPreference == i) {
        thisOpacity = 1;
      }

      renderDisplay.push(
        <div
          onClick={() => {
            if (!savedPreference) {
              setMyPref(i);
            }
          }}
          className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl cursor-pointer"
          style={{ opacity: thisOpacity }}
        >
          <p className="text-6xl">{emojiList[display[i - 1]]}</p>
        </div>,
      );
    }
    if (savedPreference) {
      cta.push(<div className="m-7 ">⏳ Waiting for round to end...</div>);
    } else if (myPref != 0) {
      cta.push(
        <button className={`m-7 btn btn-primary ${isSetPrefLoading ? "loading" : ""}`} onClick={setPreference}>
          💾 Save
        </button>,
      );
    } else {
      cta.push(<div className="m-7 ">👆 Pick your favorite emoji!</div>);
    }
  }

  const adminRender = [];
  if (address?.toLowerCase() == owner?.toLowerCase()) {
    if (!gameOn) {
      adminRender.push(
        <div className="flex justify-center items-center gap-12 p-8">
          <button
            className="btn btn-primary"
            onClick={() => {
              startGame();
            }}
          >
            startGame()
          </button>
        </div>,
      );
    } else if (openToCollect) {
      adminRender.push(
        <div className="flex justify-center items-center gap-12 p-8">
          <button
            className="btn btn-primary"
            onClick={() => {
              startNextRound();
            }}
          >
            startNextRound()
          </button>
        </div>,
      );
    } else {
      adminRender.push(
        <div className="flex justify-center items-center gap-12 p-8">
          <button
            className="btn btn-primary"
            onClick={() => {
              endRound();
            }}
          >
            endRound()
          </button>
        </div>,
      );
    }
  }

  useEffect(() => {
    setMyPref(0);
  }, [round]);

  const finalDisplay = [];

  const [isRequestingGas, setIsRequestingGas] = React.useState(false);

  if (!balance) {
    finalDisplay.push(
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="p-8">⛽️ You need some gas from the faucet...</div>
        <button
          className={`btn btn-primary ${isRequestingGas ? "loading" : ""}`}
          onClick={async () => {
            setIsRequestingGas(true);
            const toastId = toast.loading("Processing request...");
            try {
              await fetch("/api/gasMeUp", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ address }),
              });
            } catch (e) {
              toast.error(`Dropper error ${JSON.stringify(e)}`);
            } finally {
              toast.remove(toastId);
              setTimeout(() => {
                setIsRequestingGas(false);
              }, 5000);
            }
          }}
        >
          Gas Me Up!
        </button>
      </div>,
    );
  } else {
    finalDisplay.push(
      <>
        <div className="flex items-center flex-col flex-grow pt-10">
          <div className="px-5">
            <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
              round <span className="text-xl font-bold">{round}</span>
            </div>
            <div className="flex justify-center items-center gap-12 flex-col sm:flex-row pt-4">
              votes <span className="text-xl font-bold">{counter}</span>
            </div>
            <div className="flex justify-center items-center gap-12 flex-col sm:flex-row pt-10">
              your balance{" "}
              <span className="text-xl font-bold">{yourBalance && ethers.utils.formatEther(yourBalance)}</span>
            </div>
          </div>

          {adminRender}

          {gameOn ? (
            <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
              <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">{renderDisplay}</div>
              <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">{cta}</div>
            </div>
          ) : (
            " ✨ hang tight, the game will start soon..."
          )}
        </div>
      </>,
    );
  }

  return (
    <>
      <Head>
        <title>Emoji Prediction Market</title>
        <meta name="description" content="Emoji Prediction Market" />
      </Head>
      {finalDisplay}
    </>
  );
};

export default Home;
