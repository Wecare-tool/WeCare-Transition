import React from 'react';

interface ProgressBarProps {
  progress: number;
  colorClass: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, colorClass }) => {
  return (
    <div className="w-full bg-black/10 dark:bg-wecare-dark-bg/50 rounded-full h-3.5">
      <div
        className={`${colorClass} h-3.5 rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;