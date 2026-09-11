import React from 'react';
import { 
  Search, 
  X, 
  LayoutGrid, 
  Table, 
  ArrowUpDown, 
  Filter, 
  MapPin, 
  Tag, 
  RotateCcw 
} from 'lucide-react';
import { STATUS_OPTIONS } from './StatusBadge';

export const FilterControls = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  locationFilter,
  onLocationFilterChange,
  availableCategories = [],
  availableLocations = [],
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  onResetFilters,
  totalResults
}) => {
  const hasActiveFilters = 
    searchTerm.trim() !== '' || 
    statusFilter !== 'all' || 
    categoryFilter !== 'all' || 
    locationFilter !== 'all';

  return (
    <div className="filter-controls-container">
      {/* Search Input Bar */}
      <div className="search-box">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search business, phone, or location..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button 
            className="clear-search-btn" 
            onClick={() => onSearchChange('')}
            title="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Selectors Section */}
      <div className="filter-grid-wrapper">
        <div className="filter-selectors-grid">
          {/* 1. Status Filter */}
          <div className="select-wrapper">
            <Filter size={14} className="select-icon" />
            <select 
              value={statusFilter} 
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="custom-select"
              title="Filter by status"
            >
              <option value="all">Status: All</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Category Filter */}
          <div className="select-wrapper">
            <Tag size={14} className="select-icon" />
            <select 
              value={categoryFilter} 
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="custom-select"
              title="Filter by category"
            >
              <option value="all">Category: All</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Location Filter */}
          <div className="select-wrapper">
            <MapPin size={14} className="select-icon" />
            <select 
              value={locationFilter} 
              onChange={(e) => onLocationFilterChange(e.target.value)}
              className="custom-select"
              title="Filter by location"
            >
              <option value="all">Location: All</option>
              {availableLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Sort Order */}
          <div className="select-wrapper">
            <ArrowUpDown size={14} className="select-icon" />
            <select 
              value={sortBy} 
              onChange={(e) => onSortByChange(e.target.value)}
              className="custom-select"
              title="Sort leads"
            >
              <option value="recent">Sort: Recent</option>
              <option value="rating-desc">Rating: High to Low</option>
              <option value="rating-asc">Rating: Low to High</option>
              <option value="reviews-desc">Most Reviews</option>
              <option value="name-asc">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Action Controls: Reset & View Toggle */}
        <div className="filter-bottom-controls">
          {hasActiveFilters ? (
            <button 
              type="button" 
              className="reset-filters-btn animate-fade-in"
              onClick={onResetFilters}
              title="Reset all filters"
            >
              <RotateCcw size={13} />
              <span>Reset Filters</span>
            </button>
          ) : (
            <div className="results-counter-text">
              Showing <strong>{totalResults}</strong> {totalResults === 1 ? 'lead' : 'leads'}
            </div>
          )}

          {/* View Switcher (Cards vs Table) */}
          <div className="view-toggle-group">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => onViewModeChange('cards')}
              title="Cards View (Mobile optimized)"
            >
              <LayoutGrid size={15} />
              <span className="view-toggle-text">Cards</span>
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => onViewModeChange('table')}
              title="Table View (Desktop optimized)"
            >
              <Table size={15} />
              <span className="view-toggle-text">Table</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
