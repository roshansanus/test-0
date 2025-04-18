
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="salon-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-salon-primary to-salon-secondary bg-clip-text text-transparent">
              BarberBook
            </h3>
            <p className="text-gray-600">
              Find and book the best salons near you. Simple, fast, and convenient.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-salon-primary">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-salon-primary">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-salon-primary">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">For Users</h4>
            <ul className="space-y-2 text-gray-600">
              <li>
                <Link to="/signup/user" className="hover:text-salon-primary">Sign Up</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-salon-primary">Sign In</Link>
              </li>
              <li>
                <Link to="/salons" className="hover:text-salon-primary">Find Salons</Link>
              </li>
              <li>
                <Link to="/help/user" className="hover:text-salon-primary">Help Center</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">For Salons</h4>
            <ul className="space-y-2 text-gray-600">
              <li>
                <Link to="/signup/salon" className="hover:text-salon-primary">Join as Salon</Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-salon-primary">Pricing Plans</Link>
              </li>
              <li>
                <Link to="/salon/login" className="hover:text-salon-primary">Salon Dashboard</Link>
              </li>
              <li>
                <Link to="/help/salon" className="hover:text-salon-primary">Partner Support</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">About</h4>
            <ul className="space-y-2 text-gray-600">
              <li>
                <Link to="/about" className="hover:text-salon-primary">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-salon-primary">Contact</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-salon-primary">Terms of Service</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-salon-primary">Privacy Policy</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-6 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} BarberBook. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
