import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBreadcrumbs } from './BreadcrumbProvider';
import { BreadcrumbItem } from './BreadcrumbItem';

interface UseBreadcrumbNavigationOptions {
  generateFromPath?: boolean;
  preserveState?: boolean;
  maxDepth?: number;
  excludePatterns?: RegExp[];
}

export const useBreadcrumbNavigation = (options: UseBreadcrumbNavigationOptions = {}) => {
  const {
    generateFromPath = true,
    preserveState = true,
    maxDepth = 5,
    excludePatterns = []
  } = options;

  const location = useLocation();
  const navigate = useNavigate();
  const { addItem, removeItem, updateItem, clearItems } = useBreadcrumbs();

  const generateBreadcrumbsFromPath = useCallback(() => {
    const pathSegments = location.pathname
      .split('/')
      .filter(Boolean)
      .filter(segment => !excludePatterns.some(pattern => pattern.test(segment)))
      .slice(0, maxDepth);

    const breadcrumbs: BreadcrumbItem[] = [];
    let currentPath = '';

    // Add home
    breadcrumbs.push({
      id: 'home',
      label: 'Home',
      href: '/'
    });

    // Generate path-based breadcrumbs
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip if this is the last segment (current page)
      if (index === pathSegments.length - 1) return;
      
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      breadcrumbs.push({
        id: segment,
        label,
        href: currentPath
      });
    });

    return breadcrumbs;
  }, [location.pathname, maxDepth, excludePatterns]);

  const navigateToBreadcrumb = useCallback((item: BreadcrumbItem) => {
    if (item.href) {
      navigate(item.href);
    }
  }, [navigate]);

  const addBreadcrumb = useCallback((item: BreadcrumbItem) => {
    addItem(item);
  }, [addItem]);

  const removeBreadcrumb = useCallback((id: string) => {
    removeItem(id);
  }, [removeItem]);

  const updateBreadcrumb = useCallback((id: string, updates: Partial<BreadcrumbItem>) => {
    updateItem(id, updates);
  }, [updateItem]);

  const clearBreadcrumbs = useCallback(() => {
    clearItems();
  }, [clearItems]);

  // Auto-generate breadcrumbs from path
  useEffect(() => {
    if (generateFromPath) {
      const pathBreadcrumbs = generateBreadcrumbsFromPath();
      
      if (preserveState) {
        // Only update if path-based breadcrumbs are different
        // This allows manual breadcrumb additions to persist
        clearItems();
        pathBreadcrumbs.forEach(item => addItem(item));
      }
    }
  }, [generateFromPath, generateBreadcrumbsFromPath, preserveState, clearItems, addItem]);

  return {
    breadcrumbs: generateBreadcrumbsFromPath(),
    navigateToBreadcrumb,
    addBreadcrumb,
    removeBreadcrumb,
    updateBreadcrumb,
    clearBreadcrumbs
  };
};
