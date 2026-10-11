import React from "react";
import Stone from "@/components/Stone";

const page = () => {
  return (
    <header className="h-screen w-full bg-black relative">
      <div className="size-full absolute inset-0">
        <Stone />
      </div>
      <div className="size-full flex justify-between items-center px-10 py-5 relative z-5">
        <div className="mt-[-8vw]">
          <h1 className="text-[8vw] text-white uppercase leading-none tracking-tighter">
            smoke <br /> fluid
          </h1>

          <p className="text-[1vw] w-[40%] font-mono mt-[2vw] leading-tight">
            Explore the mesmerizing intersection of smoke and fluid simulation
            with interactive 3D graphics. Manipulate the scene or just enjoy the
            flow.
          </p>
        </div>

        <h1 className="text-[8vw] text-white text-right uppercase tracking-tighter leading-[.85] mt-[8vw]">
          beyond <br /> reality
        </h1>
      </div>
    </header>
  );
};

export default page;
