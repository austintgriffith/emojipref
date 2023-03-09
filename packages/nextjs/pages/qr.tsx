import type { NextPage } from "next";
import React from "react";
import QRCode from "react-qr-code";

const QR: NextPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen max-w-[500px] m-auto">
      <QRCode value="https://emojipref.vercel.app/" />
    </div>
  );
};

export default QR;
