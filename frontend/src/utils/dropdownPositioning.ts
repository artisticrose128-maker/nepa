export interface Position {
  top: number;
  left: number;
  direction: 'up' | 'down';
  alignment: 'left' | 'right';
}

export interface PositioningOptions {
  triggerRect: DOMRect;
  menuRect: DOMRect;
  viewport: {
    width: number;
    height: number;
    scrollX: number;
    scrollY: number;
  };
  preferredPosition?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  offset?: number;
  boundaryOffset?: number;
}

export const calculateDropdownPosition = (options: PositioningOptions): Position => {
  const {
    triggerRect,
    menuRect,
    viewport,
    preferredPosition = 'bottom-left',
    offset = 4,
    boundaryOffset = 8
  } = options;

  const { width: viewportWidth, height: viewportHeight, scrollX, scrollY } = viewport;

  // Calculate available space
  const spaceAbove = triggerRect.top - boundaryOffset;
  const spaceBelow = viewportHeight - triggerRect.bottom - boundaryOffset;
  const spaceLeft = triggerRect.left - boundaryOffset;
  const spaceRight = viewportWidth - triggerRect.right - boundaryOffset;

  // Determine vertical direction
  let direction: 'up' | 'down' = 'down';
  let top = triggerRect.bottom + offset + scrollY;

  if (preferredPosition.startsWith('top')) {
    // Prefer top position
    if (spaceAbove >= menuRect.height) {
      direction = 'up';
      top = triggerRect.top - menuRect.height - offset + scrollY;
    } else if (spaceBelow >= menuRect.height) {
      direction = 'down';
      top = triggerRect.bottom + offset + scrollY;
    } else {
      // Not enough space either way, choose the larger space
      if (spaceAbove > spaceBelow) {
        direction = 'up';
        top = Math.max(boundaryOffset, triggerRect.top - menuRect.height - offset + scrollY);
      } else {
        direction = 'down';
        top = Math.min(
          viewportHeight - menuRect.height - boundaryOffset + scrollY,
          triggerRect.bottom + offset + scrollY
        );
      }
    }
  } else {
    // Prefer bottom position
    if (spaceBelow >= menuRect.height) {
      direction = 'down';
      top = triggerRect.bottom + offset + scrollY;
    } else if (spaceAbove >= menuRect.height) {
      direction = 'up';
      top = triggerRect.top - menuRect.height - offset + scrollY;
    } else {
      // Not enough space either way, choose the larger space
      if (spaceBelow > spaceAbove) {
        direction = 'down';
        top = Math.min(
          viewportHeight - menuRect.height - boundaryOffset + scrollY,
          triggerRect.bottom + offset + scrollY
        );
      } else {
        direction = 'up';
        top = Math.max(boundaryOffset, triggerRect.top - menuRect.height - offset + scrollY);
      }
    }
  }

  // Determine horizontal alignment
  let alignment: 'left' | 'right' = 'left';
  let left = triggerRect.left + scrollX;

  if (preferredPosition.endsWith('right')) {
    // Prefer right alignment
    if (spaceRight >= menuRect.width) {
      alignment = 'right';
      left = triggerRect.right - menuRect.width + scrollX;
    } else if (spaceLeft >= menuRect.width) {
      alignment = 'left';
      left = triggerRect.left + scrollX;
    } else {
      // Not enough space either way, choose the larger space
      if (spaceRight > spaceLeft) {
        alignment = 'right';
        left = Math.max(
          boundaryOffset + scrollX,
          Math.min(
            viewportWidth - menuRect.width - boundaryOffset + scrollX,
            triggerRect.right - menuRect.width + scrollX
          )
        );
      } else {
        alignment = 'left';
        left = Math.max(
          boundaryOffset + scrollX,
          Math.min(
            viewportWidth - menuRect.width - boundaryOffset + scrollX,
            triggerRect.left + scrollX
          )
        );
      }
    }
  } else {
    // Prefer left alignment
    if (spaceLeft >= menuRect.width) {
      alignment = 'left';
      left = triggerRect.left + scrollX;
    } else if (spaceRight >= menuRect.width) {
      alignment = 'right';
      left = triggerRect.right - menuRect.width + scrollX;
    } else {
      // Not enough space either way, choose the larger space
      if (spaceLeft > spaceRight) {
        alignment = 'left';
        left = Math.max(
          boundaryOffset + scrollX,
          Math.min(
            viewportWidth - menuRect.width - boundaryOffset + scrollX,
            triggerRect.left + scrollX
          )
        );
      } else {
        alignment = 'right';
        left = Math.max(
          boundaryOffset + scrollX,
          Math.min(
            viewportWidth - menuRect.width - boundaryOffset + scrollX,
            triggerRect.right - menuRect.width + scrollX
          )
        );
      }
    }
  }

  return { top, left, direction, alignment };
};

export const getViewportInfo = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollX: window.pageXOffset,
    scrollY: window.pageYOffset
  };
};

export const getPositionClasses = (position: Position) => {
  const { direction, alignment } = position;
  
  let classes = 'absolute z-50';
  
  if (direction === 'up') {
    classes += ' bottom-full';
  } else {
    classes += ' top-full';
  }
  
  if (alignment === 'right') {
    classes += ' right-0';
  } else {
    classes += ' left-0';
  }
  
  return classes;
};
