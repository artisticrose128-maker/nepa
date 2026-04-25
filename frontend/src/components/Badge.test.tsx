import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import * as fc from 'fast-check';
import Badge, { BadgeVariant, BadgeSize } from './Badge';

const variantClasses: Record<BadgeVariant, string[]> = {
  default:     ['bg-secondary', 'text-secondary-foreground', 'border-transparent'],
  primary:     ['bg-primary', 'text-primary-foreground', 'border-transparent'],
  secondary:   ['bg-secondary', 'text-secondary-foreground', 'border-transparent'],
  success:     ['bg-success/10', 'text-success', 'border-success/30'],
  warning:     ['bg-warning/10', 'text-warning', 'border-warning/30'],
  destructive: ['bg-destructive/10', 'text-destructive', 'border-destructive/30'],
  info:        ['bg-info/10', 'text-info', 'border-info/30'],
  outline:     ['bg-transparent', 'text-foreground', 'border-border'],
};

const allVariants = Object.keys(variantClasses) as BadgeVariant[];

const sizeClasses: Record<BadgeSize, string[]> = {
  sm: ['text-xs', 'px-2', 'py-0.5'],
  md: ['text-xs', 'px-2.5', 'py-0.5'],
  lg: ['text-sm', 'px-3', 'py-1'],
};

const allSizes = Object.keys(sizeClasses) as BadgeSize[];

function getRootSpan(container: HTMLElement): HTMLElement {
  return container.querySelector('span') as HTMLElement;
}

describe('Badge — variants', () => {
  allVariants.forEach((variant) => {
    test(`applies correct CSS classes for variant="${variant}"`, () => {
      const { container } = render(<Badge label="Test" variant={variant} />);
      const root = getRootSpan(container);
      variantClasses[variant].forEach((cls) => expect(root).toHaveClass(cls));
    });
  });
});

describe('Badge — sizes', () => {
  allSizes.forEach((size) => {
    test(`applies correct CSS classes for size="${size}"`, () => {
      const { container } = render(<Badge label="Test" size={size} />);
      const root = getRootSpan(container);
      sizeClasses[size].forEach((cls) => expect(root).toHaveClass(cls));
    });
  });
});

describe('Badge — defaults', () => {
  test('default variant is "default" (applies bg-secondary)', () => {
    const { container } = render(<Badge label="Test" />);
    const root = getRootSpan(container);
    expect(root).toHaveClass('bg-secondary');
    expect(root).toHaveClass('border-transparent');
  });

  test('default size is "md" (applies px-2.5)', () => {
    const { container } = render(<Badge label="Test" />);
    expect(getRootSpan(container)).toHaveClass('px-2.5');
  });
});

describe('Badge — icon prop', () => {
  test('renders icon before label text with aria-hidden container', () => {
    const { container } = render(<Badge label="Test" icon={<svg data-testid="icon" />} />);
    const root = getRootSpan(container);
    const children = Array.from(root.children);
    expect(children.length).toBeGreaterThanOrEqual(2);
    expect(children[0]).toHaveAttribute('aria-hidden', 'true');
  });

  test('does not render icon container when icon is not provided', () => {
    const { container } = render(<Badge label="Test" />);
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument();
  });
});

describe('Badge — className prop', () => {
  test('merges custom className with base classes', () => {
    const { container } = render(<Badge label="Test" className="my-custom-class" />);
    const root = getRootSpan(container);
    expect(root).toHaveClass('my-custom-class');
    expect(root).toHaveClass('inline-flex');
  });
});

describe('Badge — root element', () => {
  test('root element is a <span>', () => {
    const { container } = render(<Badge label="Test" />);
    expect(getRootSpan(container).tagName.toLowerCase()).toBe('span');
  });
});

describe('Badge — outline variant', () => {
  test('outline variant has border-border class', () => {
    const { container } = render(<Badge label="Test" variant="outline" />);
    expect(getRootSpan(container)).toHaveClass('border-border');
  });
});

describe('Badge — animate prop', () => {
  test('applies animate-badge-fade-in when animate=true', () => {
    const { container } = render(<Badge label="Test" animate={true} />);
    expect(getRootSpan(container)).toHaveClass('animate-badge-fade-in');
  });

  test('does not apply animate-badge-fade-in when animate=false', () => {
    const { container } = render(<Badge label="Test" animate={false} />);
    expect(getRootSpan(container)).not.toHaveClass('animate-badge-fade-in');
  });
});

describe('Badge — aria-label prop', () => {
  test('forwards aria-label to the root element', () => {
    const { container } = render(<Badge label="Test" aria-label="Custom label" />);
    expect(getRootSpan(container)).toHaveAttribute('aria-label', 'Custom label');
  });
});

describe('Badge — text overflow', () => {
  test('applies overflow classes to label span', () => {
    const { container } = render(<Badge label="A very long label text" />);
    const labelSpan = container.querySelector('span span');
    expect(labelSpan).toHaveClass('overflow-hidden');
    expect(labelSpan).toHaveClass('text-ellipsis');
    expect(labelSpan).toHaveClass('whitespace-nowrap');
  });
});

describe('Badge — accessibility (jest-axe)', () => {
  allVariants.forEach((variant) => {
    test(`no accessibility violations for variant="${variant}"`, async () => {
      const { container } = render(
        <Badge label="Accessible badge" variant={variant} aria-label={`${variant} badge`} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

describe('Badge — Property 1: variant class coverage', () => {
  test('correct CSS classes applied for all variants', () => {
    fc.assert(
      fc.property(fc.constantFrom(...allVariants), (variant) => {
        const { container } = render(<Badge label="Test" variant={variant} />);
        const classList = getRootSpan(container).className;
        return variantClasses[variant].every((cls) => classList.includes(cls));
      }),
      { numRuns: 25 }
    );
  });
});

describe('Badge — Property 2: className passthrough', () => {
  test('custom className appears in class list', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (className) => {
        fc.pre(!className.includes(' '));
        const { container } = render(<Badge label="Test" className={className} />);
        return getRootSpan(container).className.includes(className);
      }),
      { numRuns: 25 }
    );
  });
});

describe('Badge — Property 3: aria-label passthrough', () => {
  test('aria-label is forwarded exactly to the root element', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (ariaLabel) => {
        const { container } = render(<Badge label="Test" aria-label={ariaLabel} />);
        return getRootSpan(container).getAttribute('aria-label') === ariaLabel;
      }),
      { numRuns: 25 }
    );
  });
});
