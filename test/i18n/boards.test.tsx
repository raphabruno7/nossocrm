import React from 'react';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { vi } from 'vitest';
import enMessages from '@/messages/en.json';
import { KanbanBoard } from '@/features/boards/components/Kanban/KanbanBoard';
import { DealCard } from '@/features/boards/components/Kanban/DealCard';
import { KanbanHeader } from '@/features/boards/components/Kanban/KanbanHeader';
import { Board, BoardStage, DealView } from '@/types';

vi.mock('@/context/CRMContext', () => ({
  useCRM: () => ({ lifecycleStages: [] }),
}));

const stage: BoardStage = {
  id: 'stage-1',
  label: 'Lead',
  color: 'bg-blue-500',
  order: 0,
  linkedLifecycleStage: undefined,
};

const dealBase: DealView = {
  id: 'deal-1',
  title: 'Acme Deal',
  value: 1000,
  currencyCode: 'BRL',
  status: 'stage-1',
  isWon: false,
  isLost: false,
  tags: [],
  companyName: 'Acme',
  owner: null,
  nextActivity: null,
  priority: 'low',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  boardId: 'board-1',
  contactId: 'contact-1',
  lossReason: null,
};

const activeBoard: Board = {
  id: 'board-1',
  name: 'Sales',
  stages: [],
  color: 'bg-blue-500',
  createdAt: new Date().toISOString(),
};

function wrap(ui: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe('KanbanBoard i18n', () => {
  test('renders "No deals" in English when column is empty', () => {
    wrap(
      <KanbanBoard
        stages={[stage]}
        filteredDeals={[]}
        draggingId={null}
        handleDragStart={() => {}}
        handleDragOver={() => {}}
        handleDrop={() => {}}
        setSelectedDealId={() => {}}
        openActivityMenuId={null}
        setOpenActivityMenuId={() => {}}
        handleQuickAddActivity={() => {}}
        setLastMouseDownDealId={() => {}}
      />
    );
    expect(screen.getByText('No deals')).toBeInTheDocument();
  });

  test('renders "Total:" label in English', () => {
    wrap(
      <KanbanBoard
        stages={[stage]}
        filteredDeals={[dealBase]}
        draggingId={null}
        handleDragStart={() => {}}
        handleDragOver={() => {}}
        handleDrop={() => {}}
        setSelectedDealId={() => {}}
        openActivityMenuId={null}
        setOpenActivityMenuId={() => {}}
        handleQuickAddActivity={() => {}}
        setLastMouseDownDealId={() => {}}
      />
    );
    expect(screen.getByText('Total:')).toBeInTheDocument();
  });
});

describe('DealCard i18n', () => {
  test('renders WON badge in English', () => {
    wrap(
      <DealCard
        deal={{ ...dealBase, isWon: true }}
        isRotting={false}
        activityStatus="none"
        isDragging={false}
        onDragStart={() => {}}
        onSelect={() => {}}
        isMenuOpen={false}
        setOpenMenuId={() => {}}
        onQuickAddActivity={() => {}}
        setLastMouseDownDealId={() => {}}
      />
    );
    expect(screen.getByText('✓ WON')).toBeInTheDocument();
    expect(screen.getByLabelText('Deal won')).toBeInTheDocument();
  });

  test('renders LOST badge in English', () => {
    wrap(
      <DealCard
        deal={{ ...dealBase, isLost: true }}
        isRotting={false}
        activityStatus="none"
        isDragging={false}
        onDragStart={() => {}}
        onSelect={() => {}}
        isMenuOpen={false}
        setOpenMenuId={() => {}}
        onQuickAddActivity={() => {}}
        setLastMouseDownDealId={() => {}}
      />
    );
    expect(screen.getByText('✗ LOST')).toBeInTheDocument();
    expect(screen.getByLabelText('Deal lost')).toBeInTheDocument();
  });
});

describe('KanbanHeader i18n', () => {
  test('renders "New Deal" button and filter options in English', () => {
    wrap(
      <KanbanHeader
        boards={[activeBoard]}
        activeBoard={activeBoard}
        onSelectBoard={() => {}}
        onCreateBoard={() => {}}
        viewMode="kanban"
        setViewMode={() => {}}
        searchTerm=""
        setSearchTerm={() => {}}
        ownerFilter="all"
        setOwnerFilter={() => {}}
        statusFilter="open"
        setStatusFilter={() => {}}
        onNewDeal={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: /new deal/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Open' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'All Owners' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Filter deals or companies...')).toBeInTheDocument();
  });
});
