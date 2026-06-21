import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: { label: string; onClick: () => void }[];
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ isOpen, onClose, items }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <motion.div
      ref={menuRef}
      className="absolute right-4 top-16 w-48 bg-tg-bg border border-tg-secondary rounded-xl shadow-lg z-50 overflow-hidden"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          className="w-full text-left px-4 py-3 text-tg-text hover:bg-tg-secondary transition-colors"
        >
          {item.label}
        </button>
      ))}
    </motion.div>
  );
};
