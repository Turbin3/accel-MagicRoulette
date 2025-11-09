import { AmericanRoulette } from "@/components/RouletteTable";
import React from "react";

const page = () => {
  return (
    // bg-effect , we will add this later

    // <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 via-30% to-emerald-900 font-sans relative overflow-hidden">
    //   <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
    //   <div className="absolute inset-0 opacity-10" style={{
    //     backgroundImage: `radial-gradient(circle at 25% 25%, #8b5cf6 0%, transparent 50%),
    //                      radial-gradient(circle at 75% 75%, #10b981 0%, transparent 50%)`

    //                     }}>

    //                     </div>
    // </div>
    <AmericanRoulette />
  );
};

export default page;
