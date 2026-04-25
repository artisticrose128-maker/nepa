import React, { useState } from 'react';
import { TreeView, TreeNode } from '../components/TreeView';
import { useTranslation } from '../i18n/useTranslation';
import { trackEvent } from '../services/analyticsService';

const treeData: TreeNode[] = [
  {
    id: 'region-1',
    label: 'Northern Region',
    children: [
      {
        id: 'station-1',
        label: 'Station A',
        children: [
          { id: 'meter-1', label: 'Meter A1' },
          { id: 'meter-2', label: 'Meter A2' }
        ]
      },
      {
        id: 'station-2',
        label: 'Station B',
        children: [
          { id: 'meter-3', label: 'Meter B1' },
          { id: 'meter-4', label: 'Meter B2' }
        ]
      }
    ]
  },
  {
    id: 'region-2',
    label: 'Southern Region',
    children: [
      {
        id: 'station-3',
        label: 'Station C',
        children: [
          { id: 'meter-5', label: 'Meter C1' },
        ]
      }
    ]
  }
];

const TreeViewPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedNode, setSelectedNode] = useState<string>('');

  return (
    <div className="space-y-8">
      <section aria-labelledby="tree-heading">
        <h2 id="tree-heading" className="text-3xl font-semibold text-foreground">{t('tree.title')}</h2>
        <p className="text-muted-foreground text-lg">{t('tree.description')}</p>
      </section>

      <section className="bg-card border border-border rounded-lg p-6 shadow">
        <p className="mb-4 text-muted-foreground">{t('tree.instruction')}</p>
        <TreeView
          data={treeData}
          onSelect={(node) => {
            setSelectedNode(node.label);
            trackEvent({
              page: '/tree',
              type: 'event',
              category: 'tree',
              action: 'node_select',
              label: node.label,
            });
          }}
        />
      </section>

      {selectedNode && (
        <div className="bg-card border border-border rounded-lg p-4 shadow">
          <p className="text-sm text-muted-foreground">{t('tree.selectedNodeLabel')}</p>
          <p className="text-lg font-semibold text-foreground">{selectedNode}</p>
        </div>
      )}
    </div>
  );
};

export default TreeViewPage;
