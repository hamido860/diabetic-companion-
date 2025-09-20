import React, { useState, ReactNode } from 'react';
import { ChevronDownIcon } from './icons/Icons';

interface AccordionItemProps {
  title: string;
  children: ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left py-4"
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
        <ChevronDownIcon
          className={`w-6 h-6 text-gray-500 dark:text-gray-400 transform transition-transform duration-300 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-4 text-gray-600 dark:text-gray-400 prose prose-sm sm:prose-base dark:prose-invert max-w-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

interface AccordionProps {
  children: ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ children }) => {
  return <div>{children}</div>;
};

export { Accordion, AccordionItem };
