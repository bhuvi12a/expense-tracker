import Link from 'next/link';
import { FaWallet } from 'react-icons/fa';

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 shadow-lg">
      <div className="container mx-auto">
        <div className="flex items-center">
          {/* Logo/Brand */}
          <Link href="/" className="text-white text-2xl font-bold flex items-center gap-2">
            <FaWallet />
            <span>ExpenseTracker</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
