# Breadcrumbs Component System

A comprehensive breadcrumb navigation system for the NEPA frontend that provides users with clear navigation context and supports various use cases.

## 🎯 Overview

The breadcrumb system consists of several components that work together to provide flexible, accessible, and SEO-optimized navigation breadcrumbs.

## 📁 Components

### Core Components

#### `Breadcrumbs.tsx`
The main breadcrumb component that renders a navigation trail.

**Props:**
- `config`: Route configuration object
- `options`: Display options (maxItems, showHomeIcon, etc.)
- `items`: Custom breadcrumb items (overrides auto-generation)
- `onItemClick`: Callback for breadcrumb clicks
- `className`: Custom CSS classes
- `ariaLabel`: Custom accessibility label

**Features:**
- Automatic path-based breadcrumb generation
- SEO structured data (JSON-LD)
- Responsive design with dropdown for overflow
- Accessibility compliance (WCAG)
- Internationalization support

#### `BreadcrumbItem.tsx`
Individual breadcrumb item component.

**Props:**
- `item`: Breadcrumb item data
- `isLast`: Whether this is the last item
- `maxItems`: Maximum items to display
- `showHomeIcon`: Show home icon for home item
- `separator`: Custom separator
- `onClick`: Click handler

**Features:**
- Support for dropdown breadcrumbs
- Custom separators and icons
- Active state styling
- Accessibility attributes

#### `BreadcrumbProvider.tsx`
Context provider for breadcrumb state management.

**Props:**
- `children`: Child components
- `initialItems`: Starting breadcrumb items
- `maxItems`: Maximum items to keep
- `enableAutoGeneration`: Auto-generate from path

**Context Methods:**
- `addItem`: Add breadcrumb item
- `removeItem`: Remove breadcrumb item
- `updateItem`: Update breadcrumb item
- `clearItems`: Clear all breadcrumbs
- `setItems`: Set breadcrumb items

#### `useBreadcrumbNavigation.tsx`
Hook for breadcrumb navigation logic.

**Options:**
- `generateFromPath`: Auto-generate from current path
- `preserveState`: Keep manual additions
- `maxDepth`: Maximum breadcrumb depth
- `excludePatterns`: URL patterns to exclude

**Returns:**
- `breadcrumbs`: Current breadcrumb array
- `navigateToBreadcrumb`: Navigation function
- `addBreadcrumb`: Add breadcrumb function
- `removeBreadcrumb`: Remove breadcrumb function
- `updateBreadcrumb`: Update breadcrumb function
- `clearBreadcrumbs`: Clear breadcrumbs function

## 🎨 Styling

### `breadcrumbs.css`
Comprehensive styling for all breadcrumb components.

**Features:**
- Responsive design (mobile, tablet, desktop)
- Accessibility support (high contrast, reduced motion)
- RTL language support
- Print styles
- Custom scrollbar for long lists
- Multiple variants and sizes
- Loading and error states
- Focus management

## 🌐 Internationalization

### Supported Languages
- English (en)
- Spanish (es)

### Translation Keys
```typescript
breadcrumbs: {
  navigation: string;
  home: string;
  dashboard: string;
  analytics: string;
  transactions: string;
  profile: string;
  settings: string;
  payment: string;
  faq: string;
  auth: string;
  tree: string;
  more: string;
  back: string;
  currentPage: string;
  menu: string;
  loading: string;
  error: string;
  noBreadcrumbs: string;
}
```

## 🔧 Usage Examples

### Basic Usage

```tsx
import { Breadcrumbs } from './components/Breadcrumbs';

const MyComponent = () => {
  return (
    <Breadcrumbs 
      config={{
        routes: {
          '': { id: 'home', label: 'Home', href: '/' },
          'dashboard': { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
          'analytics': { id: 'analytics', label: 'Analytics', href: '/analytics' }
        }
      }}
      options={{
        maxItems: 5,
        showHomeIcon: true
      }}
    />
  );
};
```

### Custom Items

```tsx
import { Breadcrumbs } from './components/Breadcrumbs';

const MyComponent = () => {
  const customItems = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'category', label: 'Products', href: '/products' },
    { id: 'product-123', label: 'Product Details', href: '/products/123' }
  ];

  return (
    <Breadcrumbs 
      items={customItems}
      onItemClick={(item) => console.log('Clicked:', item)}
      options={{
        maxItems: 3,
        customSeparator: '>'
      }}
    />
  );
};
```

### With Provider

```tsx
import { BreadcrumbProvider, Breadcrumbs } from './components/Breadcrumbs';

const App = () => {
  return (
    <BreadcrumbProvider maxItems={5}>
      <Breadcrumbs />
    </BreadcrumbProvider>
  );
};
```

### Using Hook

```tsx
import { useBreadcrumbNavigation } from './components/Breadcrumbs';

const MyComponent = () => {
  const { breadcrumbs, addBreadcrumb, navigateToBreadcrumb } = useBreadcrumbNavigation({
    generateFromPath: true,
    maxDepth: 4
  });

  const handleCustomNavigation = () => {
    addBreadcrumb({
      id: 'custom',
      label: 'Custom Page',
      href: '/custom'
    });
  };

  return (
    <div>
      <button onClick={handleCustomNavigation}>
        Add Custom Breadcrumb
      </button>
      
      <Breadcrumbs items={breadcrumbs} />
    </div>
  );
};
```

## ♿ Accessibility Features

### WCAG Compliance
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and roles
- **Focus Management**: Proper focus handling
- **Color Contrast**: High contrast mode support
- **Reduced Motion**: Animation respect

### ARIA Attributes
- `aria-label`: Navigation label
- `aria-current="page"`: Current page indicator
- `aria-expanded`: Dropdown state
- `aria-haspopup`: Dropdown menu
- `role="navigation"`: Navigation landmark
- `role="menuitem"`: Menu items

### Keyboard Support
- **Tab**: Navigate through breadcrumbs
- **Enter/Space**: Activate breadcrumb
- **Escape**: Close dropdown
- **Arrow Keys**: Navigate dropdown items

## 🔍 SEO Optimization

### Structured Data
- **JSON-LD**: BreadcrumbList schema
- **Microdata**: Schema.org markup
- **Meta Tags**: Position and name metadata

### Benefits
- **Search Engines**: Better understanding of site structure
- **Rich Snippets**: Enhanced search results
- **Voice Search**: Improved voice navigation

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px - Compact design
- **Tablet**: 641px - 1024px - Medium layout
- **Desktop**: > 1024px - Full layout

### Features
- **Touch-Friendly**: 44px minimum touch targets
- **Adaptive Layout**: Responsive dropdown behavior
- **Optimized Text**: Truncation for long labels
- **Custom Scrollbar**: For long breadcrumb lists

## 🧪 Testing

### Test Coverage
- **Component Tests**: All breadcrumb components
- **Accessibility Tests**: axe-jest integration
- **Navigation Tests**: User interaction testing
- **Responsive Tests**: Mobile/tablet behavior
- **SEO Tests**: Structured data validation

### Running Tests
```bash
# Run breadcrumb tests
npm test -- --testPathPattern=Breadcrumbs

# Run accessibility tests
npm run test:accessibility

# Run all tests
npm test
```

## 🔧 Configuration

### Route Configuration
```typescript
interface BreadcrumbConfig {
  routes: Record<string, BreadcrumbItem>;
  homeLabel?: string;
  separator?: React.ReactNode;
}
```

### Display Options
```typescript
interface BreadcrumbOptions {
  maxItems?: number;
  showHomeIcon?: boolean;
  showDropdown?: boolean;
  customSeparator?: React.ReactNode;
  hideOnSingleItem?: boolean;
  ariaLabel?: string;
}
```

### Item Structure
```typescript
interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  isDropdown?: boolean;
  dropdownItems?: BreadcrumbItem[];
}
```

## 🎭 Customization

### Theming
Breadcrumbs use CSS custom properties for theming:

```css
:root {
  --breadcrumb-color: rgb(var(--color-foreground));
  --breadcrumb-active-color: rgb(var(--color-foreground));
  --breadcrumb-separator-color: rgb(var(--color-muted-foreground));
  --breadcrumb-bg-hover: rgb(var(--color-accent));
  --breadcrumb-border-radius: 0.375rem;
}
```

### Variants
- **Primary**: `breadcrumb-item--primary`
- **Secondary**: `breadcrumb-item--secondary`
- **Ghost**: `breadcrumb-item--ghost`
- **Sizes**: `breadcrumb-item--sm`, `breadcrumb-item--lg`

## 🐛 Troubleshooting

### Common Issues

#### Breadcrumbs Not Showing
1. Check if `BreadcrumbProvider` wraps your component
2. Verify route configuration matches current paths
3. Ensure `generateFromPath` is enabled

#### Dropdown Not Working
1. Check `showDropdown` option is enabled
2. Verify `maxItems` is less than total items
3. Check CSS for dropdown styles

#### Accessibility Issues
1. Verify ARIA labels are present
2. Check keyboard navigation works
3. Test with screen reader

#### SEO Not Working
1. Ensure JSON-LD script is rendered
2. Check microdata attributes
3. Validate structured data format

## 📚 Migration Guide

### From Old BreadcrumbNavigation
```tsx
// Old
<BreadcrumbNavigation />

// New
<Breadcrumbs config={routesConfig} />
```

### Adding Custom Logic
```tsx
// Before
const breadcrumbs = generateBreadcrumbs();

// After
const { breadcrumbs, addBreadcrumb } = useBreadcrumbNavigation();
// Custom logic here
```

## 🚀 Performance

### Optimization
- **Memoization**: Prevents unnecessary re-renders
- **Lazy Loading**: Dropdown items loaded on demand
- **Efficient CSS**: Hardware-accelerated animations
- **Bundle Size**: Tree-shaking friendly exports

### Metrics
- **Bundle Impact**: ~8KB (gzipped)
- **Runtime Cost**: Minimal
- **Memory Usage**: Low

## 🔄 Future Enhancements

### Planned Features
- **Animated Transitions**: Smooth breadcrumb animations
- **Breadcrumb History**: Navigation history support
- **Smart Caching**: Performance improvements
- **Advanced SEO**: More structured data types
- **Theme Variants**: More styling options

---

This breadcrumb system provides a complete, accessible, and SEO-optimized navigation solution for the NEPA platform.
