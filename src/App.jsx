import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { FilterControls } from './components/FilterControls';
import { LeadCard } from './components/LeadCard';
import { LeadTable } from './components/LeadTable';
import { LeadModal } from './components/LeadModal';
import { FirebaseModal } from './components/FirebaseModal';
import { DeleteModal } from './components/DeleteModal';
import { BulkImportModal } from './components/BulkImportModal';
import { 
  subscribeToLeads, 
  createLead, 
  updateLead, 
  deleteLead, 
  resetMockLeads 
} from './services/leadService';
import { Plus, Users, SearchX, CheckCircle2, UploadCloud } from 'lucide-react';

function App() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncSource, setSyncSource] = useState('local');

  // Filter States: Search, Status, Category, Location
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState(() => {
    return window.innerWidth < 768 ? 'cards' : 'cards';
  });

  // Modal States
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState(null);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);

  // Notification Banner
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Subscribe to real-time leads
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToLeads(
      (data, source) => {
        setLeads(data);
        setSyncSource(source);
        setLoading(false);
      },
      (error) => {
        console.warn('Realtime subscription error:', error);
        setLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Compute unique Categories dynamically from data
  const availableCategories = useMemo(() => {
    const set = new Set();
    leads.forEach((l) => {
      if (l.type && l.type.trim()) set.add(l.type.trim());
    });
    return Array.from(set).sort();
  }, [leads]);

  // Compute unique Locations dynamically from data
  const availableLocations = useMemo(() => {
    const set = new Set();
    leads.forEach((l) => {
      if (l.location && l.location.trim()) set.add(l.location.trim());
    });
    return Array.from(set).sort();
  }, [leads]);

  // Filter and Sort leads
  const filteredAndSortedLeads = useMemo(() => {
    let result = [...leads];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((lead) => lead.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((lead) => (lead.type || '').trim() === categoryFilter);
    }

    // Location filter
    if (locationFilter !== 'all') {
      result = result.filter((lead) => (lead.location || '').trim() === locationFilter);
    }

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter((lead) => {
        return (
          (lead.business_name && lead.business_name.toLowerCase().includes(q)) ||
          (lead.type && lead.type.toLowerCase().includes(q)) ||
          (lead.location && lead.location.toLowerCase().includes(q)) ||
          (lead.contact_number && lead.contact_number.toLowerCase().includes(q)) ||
          (lead.notes && lead.notes.toLowerCase().includes(q))
        );
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'rating-desc') {
        return (Number(b.google_rating) || 0) - (Number(a.google_rating) || 0);
      }
      if (sortBy === 'rating-asc') {
        return (Number(a.google_rating) || 0) - (Number(b.google_rating) || 0);
      }
      if (sortBy === 'reviews-desc') {
        return (Number(b.google_reviews_count) || 0) - (Number(a.google_reviews_count) || 0);
      }
      if (sortBy === 'name-asc') {
        return (a.business_name || '').localeCompare(b.business_name || '');
      }
      // 'recent' default
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    return result;
  }, [leads, statusFilter, categoryFilter, locationFilter, searchTerm, sortBy]);

  // Reset all filters helper
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setLocationFilter('all');
  };

  // Lead Actions
  const handleStatusChange = async (leadId, newStatus) => {
    await updateLead(leadId, { status: newStatus }, leads);
  };

  const handleOpenAddModal = () => {
    setLeadToEdit(null);
    setIsLeadModalOpen(true);
  };

  const handleOpenEditModal = (lead) => {
    setLeadToEdit(lead);
    setIsLeadModalOpen(true);
  };

  // Save Lead with duplicate detection error handling
  const handleSaveLead = async (formData) => {
    if (leadToEdit) {
      const res = await updateLead(leadToEdit.id, formData, leads);
      if (res && res.success === false) {
        return res;
      }
      showToast(`Updated "${formData.business_name}"`);
    } else {
      const res = await createLead(formData, leads);
      if (res && res.success === false) {
        return res;
      }
      showToast(`Added new lead "${formData.business_name}"`);
    }
    setIsLeadModalOpen(false);
    setLeadToEdit(null);
    return { success: true };
  };

  const handleDeletePrompt = (lead) => {
    setLeadToDelete(lead);
  };

  const handleConfirmDelete = async (id) => {
    await deleteLead(id);
    setLeadToDelete(null);
    showToast('Lead deleted successfully');
  };

  const handleResetMock = () => {
    resetMockLeads();
    window.location.reload();
  };

  const handleImportComplete = (result) => {
    showToast(`Imported ${result.addedCount} leads (${result.skippedCount} duplicates skipped)`);
  };

  return (
    <div className="app-layout">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification animate-slide-up">
          <CheckCircle2 size={16} className="toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        onOpenAddModal={handleOpenAddModal}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        leads={leads}
      />

      <main className="main-content">
        <div className="container">
          {/* Top Metric / Quick Status Filter Cards */}
          <StatsBar
            leads={leads}
            activeStatusFilter={statusFilter}
            onSelectStatusFilter={(val) => {
              setStatusFilter((prev) => (prev === val ? 'all' : val));
            }}
          />

          {/* Search, Status, Category, Location & View Controls */}
          <FilterControls
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            locationFilter={locationFilter}
            onLocationFilterChange={setLocationFilter}
            availableCategories={availableCategories}
            availableLocations={availableLocations}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onResetFilters={handleResetFilters}
            totalResults={filteredAndSortedLeads.length}
          />

          {/* Active Filter summary tags (if any) */}
          {(categoryFilter !== 'all' || locationFilter !== 'all' || statusFilter !== 'all') && (
            <div className="active-filters-chips-bar animate-fade-in">
              <span className="filters-label">Active Filters:</span>
              {statusFilter !== 'all' && (
                <span className="filter-chip">
                  Status: <strong>{statusFilter}</strong>
                  <button onClick={() => setStatusFilter('all')}>×</button>
                </span>
              )}
              {categoryFilter !== 'all' && (
                <span className="filter-chip">
                  Category: <strong>{categoryFilter}</strong>
                  <button onClick={() => setCategoryFilter('all')}>×</button>
                </span>
              )}
              {locationFilter !== 'all' && (
                <span className="filter-chip">
                  Location: <strong>{locationFilter}</strong>
                  <button onClick={() => setLocationFilter('all')}>×</button>
                </span>
              )}
              <button className="clear-all-text-btn" onClick={handleResetFilters}>
                Clear All
              </button>
            </div>
          )}

          {/* Main Leads List / Table */}
          {filteredAndSortedLeads.length > 0 ? (
            viewMode === 'cards' ? (
              <div className="leads-grid">
                {filteredAndSortedLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onStatusChange={handleStatusChange}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeletePrompt}
                  />
                ))}
              </div>
            ) : (
              <LeadTable
                leads={filteredAndSortedLeads}
                onStatusChange={handleStatusChange}
                onEdit={handleOpenEditModal}
                onDelete={handleDeletePrompt}
              />
            )
          ) : (
            <div className="empty-state-card animate-fade-in">
              <div className="empty-icon">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || locationFilter !== 'all' ? (
                  <SearchX size={26} />
                ) : (
                  <Users size={26} />
                )}
              </div>
              <h3 className="empty-title">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || locationFilter !== 'all'
                  ? 'No matching leads found' 
                  : 'No leads in pipeline yet'}
              </h3>
              <p className="empty-desc">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || locationFilter !== 'all'
                  ? 'Try clearing your filters or search keywords to see more leads.'
                  : 'Start by creating your first lead or importing a JSON list!'}
              </p>
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || locationFilter !== 'all' ? (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleResetFilters}
                >
                  Clear All Filters
                </button>
              ) : (
                <div className="empty-state-btn-group">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setIsImportModalOpen(true)}
                  >
                    <UploadCloud size={16} /> Import from JSON
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleOpenAddModal}
                  >
                    <Plus size={16} /> Add First Lead
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      <button 
        className="mobile-fab" 
        onClick={handleOpenAddModal} 
        aria-label="Add new lead"
        title="Add new lead"
      >
        <Plus size={26} />
      </button>

      {/* Modals */}
      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => {
          setIsLeadModalOpen(false);
          setLeadToEdit(null);
        }}
        onSave={handleSaveLead}
        leadToEdit={leadToEdit}
      />

      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        currentLeads={leads}
        onImportComplete={handleImportComplete}
      />

      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        onResetMock={handleResetMock}
      />

      <DeleteModal
        isOpen={!!leadToDelete}
        lead={leadToDelete}
        onClose={() => setLeadToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default App;
