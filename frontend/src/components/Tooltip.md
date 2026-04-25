# Tooltip Component Documentation

## Overview

The Tooltip component provides a comprehensive, accessible tooltip system for the NEPA platform. It supports multiple trigger types, positioning options, and includes full accessibility features.

## Features

- ✅ **Multiple Trigger Types**: Hover, Focus, Click, and Manual
- ✅ **Smart Positioning**: Top, Bottom, Left, Right, and Center with viewport boundary detection
- ✅ **Full Accessibility**: ARIA attributes, keyboard navigation, screen reader support
- ✅ **Theme Support**: Automatically adapts to light/dark themes
- ✅ **Customizable Styling**: Custom CSS classes, arrow display, max-width constraints
- ✅ **Rich Content Support**: JSX content, complex layouts, multiple elements
- ✅ **Responsive Design**: Works across all device sizes
- ✅ **TypeScript Support**: Full type safety and IntelliSense

## Installation

The Tooltip component is already included in the components folder. Simply import it:

```tsx
import Tooltip from './components/Tooltip';
```

## Basic Usage

### Simple Hover Tooltip

```tsx
<Tooltip content="This is helpful information">
  <button>Hover me</button>
</Tooltip>
```

### Different Trigger Types

```tsx
// Hover (default)
<Tooltip content="Hover tooltip" trigger="hover">
  <button>Hover</button>
</Tooltip>

// Focus
<Tooltip content="Focus tooltip" trigger="focus">
  <input placeholder="Focus me" />
</Tooltip>

// Click
<Tooltip content="Click tooltip" trigger="click">
  <button>Click me</button>
</Tooltip>

// Manual (controlled)
<Tooltip content="Manual tooltip" trigger="manual" open={isOpen}>
  <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
</Tooltip>
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `React.ReactNode` | **Required** | The tooltip content to display |
| `children` | `React.ReactElement` | **Required** | The element that triggers the tooltip |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right' \| 'center'` | `'top'` | Tooltip position relative to trigger |
| `trigger` | `'hover' \| 'focus' \| 'click' \| 'manual'` | `'hover'` | How the tooltip is triggered |
| `delay` | `number` | `300` | Delay in milliseconds before hiding (ms) |
| `disabled` | `boolean` | `false` | Whether the tooltip is disabled |
| `className` | `string` | `''` | Additional CSS classes for the wrapper |
| `contentClassName` | `string` | `''` | Additional CSS classes for the tooltip content |
| `arrow` | `boolean` | `true` | Whether to show the positioning arrow |
| `maxWidth` | `number` | `300` | Maximum width of the tooltip in pixels |
| `open` | `boolean` | `undefined` | Controlled open state (for manual trigger) |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Callback when open state changes |

### Position Options

- **`top`**: Positioned above the trigger element
- **`bottom`**: Positioned below the trigger element  
- **`left`**: Positioned to the left of the trigger element
- **`right`**: Positioned to the right of the trigger element
- **`center`**: Centered over the trigger element

### Trigger Options

- **`hover`**: Shows on mouse enter, hides on mouse leave
- **`focus`**: Shows on focus, hides on blur
- **`click`**: Toggles on click, closes on escape or blur
- **`manual`**: Controlled programmatically via `open` prop

## Advanced Examples

### Rich Content

```tsx
<Tooltip 
  content={
    <div className="space-y-2">
      <p className="font-semibold">User Profile</p>
      <p className="text-sm">John Doe</p>
      <p className="text-xs opacity-75">john@example.com</p>
    </div>
  }
  maxWidth={250}
>
  <Avatar src="/avatar.jpg" />
</Tooltip>
```

### Custom Styling

```tsx
<Tooltip 
  content="Warning message"
  contentClassName="bg-red-500 text-white border-red-600"
  arrow={false}
>
  <button className="bg-red-500 text-white">Delete</button>
</Tooltip>
```

### Form Field Help

```tsx
<Tooltip 
  content={
    <div>
      <p className="font-semibold mb-1">Password Requirements:</p>
      <ul className="text-sm space-y-1">
        <li>• At least 8 characters</li>
        <li>• One uppercase letter</li>
        <li>• One number</li>
        <li>• One special character</li>
      </ul>
    </div>
  }
  trigger="focus"
  position="right"
  maxWidth={300}
>
  <input type="password" placeholder="Enter password" />
</Tooltip>
```

## Accessibility

The Tooltip component includes comprehensive accessibility features:

### ARIA Attributes

- `role="tooltip"` on the tooltip content
- `aria-describedby` linking trigger to tooltip when open
- Proper focus management and keyboard navigation

### Keyboard Support

- **Tab**: Navigate to tooltip trigger
- **Enter/Space**: Open tooltip (for click trigger)
- **Escape**: Close tooltip
- **Arrow Keys**: Navigate within tooltip content when applicable

### Screen Reader Support

- Tooltip content is announced when opened
- Proper semantic markup for assistive technologies
- High contrast mode support

### Reduced Motion

- Respects `prefers-reduced-motion` setting
- Smooth transitions that can be disabled

## Styling

### CSS Classes

The tooltip uses the following CSS structure:

```css
.tooltip-wrapper {
  /* Wrapper element styles */
}

.tooltip-content {
  /* Main tooltip content */
  /* Automatically adapts to theme */
}

.tooltip-arrow {
  /* Positioning arrow */
}
```

### Theme Integration

The tooltip automatically integrates with the existing theme system:

- **Light Theme**: White background, dark text, gray borders
- **Dark Theme**: Dark background, light text, dark borders

### Custom CSS Variables

You can override the tooltip appearance using CSS variables:

```css
.tooltip-content {
  --tooltip-bg: custom-bg-color;
  --tooltip-text: custom-text-color;
  --tooltip-border: custom-border-color;
}
```

## Testing

The component includes comprehensive test coverage:

### Unit Tests

- Basic rendering and functionality
- All trigger types and positions
- Custom styling options
- Controlled component behavior
- Theme switching

### Accessibility Tests

- axe-core integration for WCAG compliance
- Keyboard navigation testing
- Screen reader compatibility
- High contrast mode testing

### Running Tests

```bash
# Run tooltip-specific tests
npm test -- --testPathPattern=Tooltip

# Run accessibility tests
npm test -- --testPathPattern=accessibility-tooltip

# Run all tests with coverage
npm run test:coverage
```

## Migration Guide

### From Title Attributes

Replace simple `title` attributes:

```tsx
// Before
<button title="Simple tooltip">Button</button>

// After
<Tooltip content="Simple tooltip">
  <button>Button</button>
</Tooltip>
```

### From Other Tooltip Libraries

The API is designed to be familiar and easy to migrate from popular tooltip libraries:

```tsx
// Similar to react-tooltip
<Tooltip content="Content">
  <button>Trigger</button>
</Tooltip>

// Similar to tippy.js
<Tooltip content="Content" position="top">
  <button>Trigger</button>
</Tooltip>
```

## Performance Considerations

- **Lazy Rendering**: Tooltip content is only rendered when needed
- **Efficient Positioning**: Smart viewport detection prevents unnecessary calculations
- **Memory Management**: Proper cleanup of event listeners and timers
- **Optimized Re-renders**: Minimal state updates and efficient React patterns

## Browser Support

The Tooltip component supports all modern browsers:

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## Troubleshooting

### Common Issues

1. **Tooltip not appearing**: Check that the `content` prop is provided and not empty
2. **Positioning issues**: Ensure the trigger element has proper dimensions
3. **Z-index conflicts**: The tooltip uses `z-index: 1070` by default
4. **Theme not applying**: Ensure the ThemeProvider wraps the component

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
DEBUG=tooltip npm run dev
```

## Contributing

When contributing to the Tooltip component:

1. Follow the existing code style and patterns
2. Add comprehensive tests for new features
3. Ensure accessibility compliance
4. Update documentation as needed
5. Test across different themes and devices

## License

This component is part of the NEPA platform and follows the project's licensing terms.
