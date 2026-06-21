import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from './Button';

interface HeaderProps {
  extraActions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ extraActions }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 p-4 flex justify-end items-center gap-2 z-40">
        {extraActions}
        <div className="relative">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu size={24} />
          </Button>
          {/* DropdownMenu logic for other items would be here when added */}
        </div>
      </div>
    </>
  );
};
