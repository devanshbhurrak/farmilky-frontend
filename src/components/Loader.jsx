import React from "react";

const Loader = () => {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

export default Loader;
