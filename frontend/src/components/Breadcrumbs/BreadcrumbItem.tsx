import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  isDropdown?: boolean;
  dropdownItems?: BreadcrumbItem[];
}

interface BreadcrumbItemProps {
  item: BreadcrumbItem;
  isLast?: boolean;
  maxItems?: number;
  showHomeIcon?: boolean;
  separator?: React.ReactNode;
  onClick?: (item: BreadcrumbItem) => void;
}

const BreadcrumbItemComponent: React.FC<BreadcrumbItemProps> = ({
  item,
  isLast = false,
  maxItems = 5,
  showHomeIcon = true,
  separator,
  onClick
}) => {
  const { t } = useTranslation();

  const handleClick = () => {
    if (onClick && !isLast) {
      onClick(item);
    }
  };

  const renderContent = () => {
    if (item.isDropdown) {
      return (
        <div className="breadcrumb-dropdown">
          <button
            className="breadcrumb-dropdown-trigger"
            aria-expanded="false"
            aria-haspopup="menu"
            aria-label={`${item.label} menu`}
          >
            <span className="breadcrumb-dropdown-text">{item.label}</span>
            <ChevronRight size={12} className="breadcrumb-dropdown-icon" />
          </button>
          <ul className="breadcrumb-dropdown-menu" role="menu">
            {item.dropdownItems?.map((dropdownItem) => (
              <li key={dropdownItem.id}>
                <a
                  href={dropdownItem.href}
                  className="breadcrumb-dropdown-item"
                  role="menuitem"
                >
                  {dropdownItem.icon && (
                    <span className="breadcrumb-dropdown-item-icon">{dropdownItem.icon}</span>
                  )}
                  <span className="breadcrumb-dropdown-item-text">{dropdownItem.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    const content = (
      <span className="breadcrumb-item-content">
        {showHomeIcon && item.id === 'home' && (
          <Home size={14} className="breadcrumb-home-icon" />
        )}
        {item.icon && !showHomeIcon && (
          <span className="breadcrumb-item-icon">{item.icon}</span>
        )}
        <span className="breadcrumb-item-text">{item.label}</span>
      </span>
    );

    if (isLast || !item.href) {
      return (
        <span className="breadcrumb-item breadcrumb-item--active" aria-current="page">
          {content}
        </span>
      );
    }

    return (
      <a
        href={item.href}
        className="breadcrumb-item breadcrumb-item--link"
        onClick={handleClick}
        aria-label={`Navigate to ${item.label}`}
      >
        {content}
      </a>
    );
  };

  return (
    <li className="breadcrumb-list-item" role="none">
      {renderContent()}
      {!isLast && (
        <span className="breadcrumb-separator" aria-hidden="true">
          {separator || <ChevronRight size={12} />}
        </span>
      )}
    </li>
  );
};

export default BreadcrumbItemComponent;
