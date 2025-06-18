"use client";

import React from "react";

interface Props {
  title: string;
  children: React.ReactNode;
}

const AssetsContainer: React.FC<Props> = ({ title, children }) => {
  return (
    <div className="mb-6 overflow-hidden rounded-lg bg-card/80 backdrop-blur-sm border shadow-sm transition-colors duration-200">
      <div className="flex items-center justify-between p-4 px-6 border-b">
        <h2 className="text-xl font-medium text-card-foreground">{title}</h2>
      </div>

      <div className="px-6">{children}</div>
    </div>
  );
};

export default AssetsContainer;
