import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MoreHorizontal, Home, ChevronRight } from 'lucide-react';
import BreadcrumbItem, { BreadcrumbItem as BreadcrumbItemType } from './BreadcrumbItem';
import { useTranslation } from '../../i18n/useTranslation';

export interface BreadcrumbOptions {
  maxItems?: number;
  showHomeIcon?: boolean;
  showDropdown?: boolean;
  customSeparator?: React.ReactNode;
  hideOnSingleItem?: boolean;
  ariaLabel?: string;
}

export interface BreadcrumbConfig {
  routes: Record<string, BreadcrumbItemType>;
  homeLabel?: string;
  separator?: React.ReactNode;
}

interface BreadcrumbsProps {
  config?: BreadcrumbConfig;
  options?: BreadcrumbOptions;
  className?: string;
  items?: BreadcrumbItemType[];
  onItemClick?: (item: BreadcrumbItemType) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  config,
  options = {},
  className = '',
  items: propItems,
  onItemClick
}) => {
  const { t } = useTranslation();
  const location = useLocation();

  const {
    maxItems = 5,
    showHomeIcon = true,
    showDropdown = true,
    customSeparator,
    hideOnSingleItem = true,
    ariaLabel
  } = options;

  const defaultConfig: BreadcrumbConfig = {
    routes: {
      '': { id: 'home', label: t('breadcrumbs.home', 'Home'), href: '/' },
      'dashboard': { id: 'dashboard', label: t('breadcrumbs.dashboard', 'Dashboard'), href: '/dashboard' },
      'analytics': { id: 'analytics', label: t('breadcrumbs.analytics', 'Analytics'), href: '/analytics' },
      'transactions': { id: 'transactions', label: t('breadcrumbs.transactions', 'Transactions'), href: '/transactions' },
      'profile': { id: 'profile', label: t('breadcrumbs.profile', 'Profile'), href: '/profile' },
      'settings': { id: 'settings', label: t('breadcrumbs.settings', 'Settings'), href: '/settings' },
      'payment': { id: 'payment', label: t('breadcrumbs.payment', 'Payment'), href: '/payment' },
      'faq': { id: 'faq', label: t('breadcrumbs.faq', 'FAQ'), href: '/faq' },
      'auth': { id: 'auth', label: t('breadcrumbs.auth', 'Authentication'), href: '/auth' },
      'tree': { id: 'tree', label: t('breadcrumbs.tree', 'Tree View'), href: '/tree' }
    },
    homeLabel: t('breadcrumbs.home', 'Home'),
    separator: <ChevronRight size={12} />
  };

  const finalConfig = { ...defaultConfig, ...config };

  const generateBreadcrumbsFromPath = (): BreadcrumbItemType[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItemType[] = [];

    // Always start with home
    if (finalConfig.routes['']) {
      breadcrumbs.push(finalConfig.routes['']);
    }

    // Build path-based breadcrumbs
    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      const route = finalConfig.routes[segment];
      
      if (route) {
        breadcrumbs.push({
          ...route,
          href: currentPath
        });
      } else {
        // Handle dynamic routes
        breadcrumbs.push({
          id: segment,
          label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
          href: currentPath
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = useMemo(() => {
    if (propItems) {
      return propItems;
    }
    return generateBreadcrumbsFromPath();
  }, [location.pathname, finalConfig, propItems]);

  const shouldHide = hideOnSingleItem && breadcrumbs.length <= 1;

  const displayItems = useMemo(() => {
    if (shouldHide) return [];
    
    const items = [...breadcrumbs];
    
    // Apply maxItems limit
    if (items.length > maxItems) {
      const visibleItems = items.slice(0, maxItems - 2);
      const hiddenCount = items.length - visibleItems.length;
      
      return [
        ...visibleItems,
        {
          id: 'more',
          label: t('breadcrumbs.more', `+${hiddenCount} more`),
          isDropdown: true,
          dropdownItems: items.slice(maxItems - 2)
        }
      ];
    }
    
    return items;
  }, [breadcrumbs, maxItems, shouldHide]);

  const handleItemClick = (item: BreadcrumbItemType) => {
    onItemClick?.(item);
  };

  if (shouldHide) {
    return (
      <nav 
        aria-label={ariaLabel || t('breadcrumbs.navigation', 'Breadcrumb navigation')}
        className={`breadcrumbs breadcrumbs--hidden ${className}`}
        role="navigation"
      >
        <meta itemScope itemType="https://schema.org/BreadcrumbList" />
      </nav>
    );
  }

  return (
    <nav 
      aria-label={ariaLabel || t('breadcrumbs.navigation', 'Breadcrumb navigation')}
      className={`breadcrumbs ${className}`}
      role="navigation"
    >
      {/* SEO structured data */}
      <meta itemScope itemType="https://schema.org/BreadcrumbList" />
      
      <ol className="breadcrumbs-list" itemScope itemProp="itemListElement" itemType="https://schema.org/ListItem">
        {displayItems.map((item, index) => (
          <li key={item.id} className="breadcrumbs-list-item" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <meta itemProp="position" content={String(index + 1)} />
            <meta itemProp="name" content={item.label} />
            {item.href && <meta itemProp="item" content={window.location.origin + item.href} />}
            
            <BreadcrumbItem
              item={item}
              isLast={index === displayItems.length - 1}
              maxItems={maxItems}
              showHomeIcon={showHomeIcon}
              separator={finalConfig.separator}
              onClick={handleItemClick}
            />
          </li>
        ))}
      </ol>
      
      {/* Additional SEO metadata */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": displayItems.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.label,
            "item": item.href ? window.location.origin + item.href : undefined
          }))
        })}
      </script>
    </nav>
  );
};

export default Breadcrumbs;
