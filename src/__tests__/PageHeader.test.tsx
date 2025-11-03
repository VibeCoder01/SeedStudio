
import React from 'react';
import { render, screen } from '@testing-library/react';
import PageHeader from '@/components/page-header';

describe('PageHeader', () => {
  it('renders the title correctly', () => {
    const title = 'My Test Page';
    render(<PageHeader title={title} />);
    
    const headingElement = screen.getByRole('heading', { name: title });
    expect(headingElement).toBeInTheDocument();
  });

  it('renders children when provided', () => {
    const title = 'My Test Page';
    const childText = 'Click Me';
    render(
      <PageHeader title={title}>
        <button>{childText}</button>
      </PageHeader>
    );

    const buttonElement = screen.getByRole('button', { name: childText });
    expect(buttonElement).toBeInTheDocument();
  });

  it('does not render the children container if no children are provided', () => {
     const title = 'My Test Page';
     const { container } = render(<PageHeader title={title} />);
     
     // The direct child of the container is the main div. We check its children.
     // It should only have one child, the <h1> title.
     expect(container.firstChild?.childNodes.length).toBe(1);
  });
});
