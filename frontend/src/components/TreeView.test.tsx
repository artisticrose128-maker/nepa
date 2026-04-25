import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TreeView, TreeNode } from './TreeView';

const treeData: TreeNode[] = [
  {
    id: 'parent',
    label: 'Parent Node',
    children: [
      { id: 'child-1', label: 'Child One' },
      { id: 'child-2', label: 'Child Two' }
    ]
  }
];

describe('TreeView', () => {
  it('renders root nodes and toggles children visibility', () => {
    render(<TreeView data={treeData} />);

    expect(screen.getByText('Parent Node')).toBeInTheDocument();
    const toggleButton = screen.getByRole('button', { name: '+' });
    expect(toggleButton).toBeInTheDocument();
    expect(screen.queryByText('Child One')).not.toBeVisible();

    fireEvent.click(toggleButton);
    expect(screen.getByText('Child One')).toBeVisible();
    expect(screen.getByText('Child Two')).toBeVisible();

    fireEvent.click(toggleButton);
    expect(screen.queryByText('Child One')).not.toBeVisible();
  });
});
