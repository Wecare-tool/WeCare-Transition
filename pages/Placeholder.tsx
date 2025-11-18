import React from 'react';

interface PlaceholderProps {
    title: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({ title }) => {
  return (
    <div className="flex items-center justify-center h-full bg-wecare-surface-elevated dark:bg-wecare-dark-surface rounded-xl p-8 border border-wecare-border dark:border-wecare-dark-border">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-wecare-text-primary dark:text-wecare-dark-text-primary mb-2">{title}</h2>
        <p className="text-wecare-text-secondary dark:text-wecare-dark-text-secondary">This view is under construction.</p>
      </div>
    </div>
  );
};

export default Placeholder;