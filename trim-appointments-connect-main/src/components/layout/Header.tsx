
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Menu, X, User, Scissors, Calendar, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  const renderAuthLinks = () => {
    if (user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="hover:bg-transparent hover:text-salon-primary">
              <User className="mr-2 h-4 w-4" />
              {profile?.first_name || "Account"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {profile?.role === 'user' && (
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate('/user/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/user/appointments')}>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>My Appointments</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            )}
            
            {profile?.role === 'salon_owner' && (
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate('/salon/dashboard')}>
                  <Scissors className="mr-2 h-4 w-4" />
                  <span>Salon Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/salon/appointments')}>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Appointments</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/salon/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            )}
            
            {profile?.role === 'admin' && (
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Admin Dashboard</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="hover:bg-transparent hover:text-salon-primary">
              Sign Up
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link to="/register/user" className="w-full cursor-pointer">
                Sign Up as User
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/register/salon" className="w-full cursor-pointer">
                Sign Up as Salon
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button asChild className="bg-salon-primary hover:bg-salon-secondary">
          <Link to="/login">Sign In</Link>
        </Button>
      </>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="salon-container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-salon-primary to-salon-secondary bg-clip-text text-transparent">BarberBook</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium hover:text-salon-primary">
            Home
          </Link>
          <Link to="/salons" className="text-sm font-medium hover:text-salon-primary">
            Find Salons
          </Link>
          <Link to="/about" className="text-sm font-medium hover:text-salon-primary">
            About
          </Link>
          {renderAuthLinks()}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-gray-600 hover:text-salon-primary"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden p-4 bg-white border-b shadow-sm">
          <nav className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className="text-sm font-medium hover:text-salon-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/salons" 
              className="text-sm font-medium hover:text-salon-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Find Salons
            </Link>
            <Link 
              to="/about" 
              className="text-sm font-medium hover:text-salon-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            
            {/* Mobile auth links */}
            {user ? (
              <>
                {profile?.role === 'user' && (
                  <>
                    <Link 
                      to="/user/profile" 
                      className="text-sm font-medium hover:text-salon-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link 
                      to="/user/appointments" 
                      className="text-sm font-medium hover:text-salon-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Appointments
                    </Link>
                  </>
                )}
                {profile?.role === 'salon_owner' && (
                  <>
                    <Link 
                      to="/salon/dashboard" 
                      className="text-sm font-medium hover:text-salon-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Salon Dashboard
                    </Link>
                    <Link 
                      to="/salon/appointments" 
                      className="text-sm font-medium hover:text-salon-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Manage Appointments
                    </Link>
                  </>
                )}
                <Button 
                  variant="ghost"
                  className="justify-start px-0 hover:bg-transparent hover:text-salon-primary"
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link 
                  to="/register/user" 
                  className="text-sm font-medium hover:text-salon-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up as User
                </Link>
                <Link 
                  to="/register/salon" 
                  className="text-sm font-medium hover:text-salon-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up as Salon
                </Link>
                <Button 
                  asChild 
                  className="bg-salon-primary hover:bg-salon-secondary w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/login">Sign In</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
