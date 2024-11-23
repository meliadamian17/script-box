import React from "react";
import { CodeBracketIcon } from "@heroicons/react/24/outline";

const Footer = () => {
  return (
    <footer className="footer p-10 bg-base-200 text-base-content">
      <div className="flex flex-col items-center">
        <div className="flex items-center space-x-2">
          <CodeBracketIcon className="w-10 h-10 text-primary" />
          <p className="font-bold">
            Scriptbox
            <br />
            Simplifying Development, One Script at a Time.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

