import React, { useState, KeyboardEvent } from 'react';

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
}

interface TreeViewProps {
  data: TreeNode[];
  onSelect?: (node: TreeNode) => void;
}

export const TreeView: React.FC<TreeViewProps> = ({ data, onSelect }) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleNode = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, nodeId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleNode(nodeId);
    }
  };

  const renderNode = (node: TreeNode, level: number) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedIds.has(node.id);

    return (
      <li key={node.id} className="mb-2">
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleNode(node.id)}
              onKeyDown={(event) => handleKeyDown(event, node.id)}
              aria-expanded={isExpanded}
              aria-controls={`${node.id}-group`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary transition hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {isExpanded ? '−' : '+'}
            </button>
          ) : (
            <div className="h-8 w-8" />
          )}
          <button
            type="button"
            onClick={() => onSelect?.(node)}
            className="w-full text-left rounded-md px-2 py-2 transition hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary"
            role="treeitem"
            aria-level={level}
            tabIndex={0}
          >
            {node.label}
          </button>
        </div>

        {hasChildren && (
          <div
            id={`${node.id}-group`}
            role="group"
            className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[2000px] mt-2' : 'max-h-0'}`}
          >
            <ul className="ml-8 border-l border-border pl-4">
              {node.children?.map((child) => renderNode(child, level + 1))}
            </ul>
          </div>
        )}
      </li>
    );
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <ul role="tree" className="space-y-2">
        {data.map((node) => renderNode(node, 1))}
      </ul>
    </div>
  );
};
