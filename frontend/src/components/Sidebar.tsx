import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Zap, 
  CreditCard, 
  History, 
  Settings, 
  User, 
  Menu, 
  X,
  ChevronDown,
  ChevronRight,
  LogOut,
  HelpCircle,
  FileText,
  TrendingUp
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: SidebarItem[];
  badge?: string | number;
}

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
  activeItem?: string;
  onItemClick?: (item: SidebarItem) => void;
  className?: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const defaultSidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Home size={20} />,
    path: '/dashboard'
  },
  {
    id: 'payments',
    label: 'Bill Payment',
    icon: <Zap size={20} />,
    path: '/payments',
    children: [
      {
        id: 'new-payment',
        label: 'New Payment',
        icon: <CreditCard size={16} />,
        path: '/payments/new'
      },
      {
        id: 'payment-history',
        label: 'Payment History',
        icon: <History size={16} />,
        path: '/payments/history'
      }
    ]
  },
  {
    id: 'yield',
    label: 'Yield Generation',
    icon: <TrendingUp size={20} />,
    path: '/yield'
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: <FileText size={20} />,
    path: '/transactions',
    badge: 'New'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: <User size={20} />,
    path: '/profile'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings size={20} />,
    path: '/settings'
  },
  {
    id: 'help',
    label: 'Help & Support',
    icon: <HelpCircle size={20} />,
    path: '/help'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = true,
  onToggle,
  activeItem = 'dashboard',
  onItemClick,
  className = '',
  collapsed = false,
  onCollapsedChange
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        onCollapsedChange?.(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [onCollapsedChange]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleItemClick = (item: SidebarItem) => {
    if (item.children && item.children.length > 0) {
      toggleExpanded(item.id);
    } else {
      onItemClick?.(item);
      if (isMobile) {
        onToggle?.();
      }
    }
  };

  const renderSidebarItem = (item: SidebarItem, level: number = 0) => {
    const isActive = activeItem === item.id;
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const paddingLeft = level * 16 + 16;

    return (
      <div key={item.id} className="w-full">
        <button
          onClick={() => handleItemClick(item)}
          className={`
            w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200
            hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
            ${isActive ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' : 'text-gray-700'}
            ${collapsed && level === 0 ? 'justify-center' : ''}
            group
          `}
          style={{ paddingLeft: collapsed && level === 0 ? '12px' : `${paddingLeft}px` }}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-haspopup={hasChildren ? 'true' : undefined}
        >
          <div className={`flex items-center ${collapsed && level === 0 ? 'justify-center' : ''}`}>
            <span className={`flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
              {item.icon}
            </span>
            {!collapsed && (
              <span className="ml-3 text-sm font-medium truncate">
                {item.label}
              </span>
            )}
          </div>
          {!collapsed && (
            <div className="flex items-center space-x-2">
              {item.badge && (
                <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}
              {hasChildren && (
                <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                  <ChevronRight size={16} />
                </span>
              )}
            </div>
          )}
        </button>

        {hasChildren && !collapsed && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <div className={`h-full flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    } ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">NEPA</span>
          </div>
        ) : (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
            <Zap size={20} className="text-white" />
          </div>
        )}
        {isMobile && (
          <button
            onClick={onToggle}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {defaultSidebarItems.map(item => renderSidebarItem(item))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {!collapsed ? (
          <div className="space-y-2">
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <button className="w-full flex justify-center p-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
            <LogOut size={16} />
          </button>
        )}
      </div>

      {/* Collapse Toggle (Desktop only) */}
      {!isMobile && (
        <button
          onClick={() => onCollapsedChange?.(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      )}
    </div>
  );

  // Mobile overlay
  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onToggle}
            aria-hidden="true"
          />
        )}
        <div
          className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 lg:hidden ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </>
    );
  }

  return sidebarContent;
};

export default Sidebar;
