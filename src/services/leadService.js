import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db, isFirebaseConnected } from '../firebase';
import { INITIAL_LEADS } from '../data/mockLeads';
import { cleanPhoneNumber } from '../utils/formatters';

const LOCAL_STORAGE_KEY = 'leadflow_leads_data';

// Initialize local storage if empty
export const getLocalLeads = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_LEADS));
      return INITIAL_LEADS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading localStorage leads', e);
    return INITIAL_LEADS;
  }
};

export const saveLocalLeads = (leads) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(leads));
  } catch (e) {
    console.error('Error saving localStorage leads', e);
  }
};

/**
 * Normalizes phone numbers for duplicate comparison
 */
export const normalizePhone = (phone) => {
  if (!phone) return '';
  const digitsOnly = phone.toString().replace(/[^0-9]/g, '');
  // If number has more than 10 digits (e.g. 919876543210), last 10 digits can be compared if standard
  return digitsOnly;
};

/**
 * Normalizes string for text comparison
 */
export const normalizeText = (text) => {
  if (!text) return '';
  return text.toString().toLowerCase().trim().replace(/\s+/g, ' ');
};

/**
 * Check if a candidate lead is duplicate against an existing list
 */
export const findDuplicate = (candidate, existingList = [], ignoreId = null) => {
  const candPhone = normalizePhone(candidate.contact_number);
  const candName = normalizeText(candidate.business_name);

  return existingList.find((existing) => {
    if (ignoreId && existing.id === ignoreId) return false;

    const existPhone = normalizePhone(existing.contact_number);
    const existName = normalizeText(existing.business_name);

    // Duplicate condition 1: Phone numbers match (if phone has at least 7 digits)
    if (candPhone && existPhone && candPhone.length >= 7 && existPhone.length >= 7) {
      if (candPhone === existPhone || candPhone.endsWith(existPhone) || existPhone.endsWith(candPhone)) {
        return true;
      }
    }

    // Duplicate condition 2: Business name matches exactly
    if (candName && existName && candName === existName) {
      return true;
    }

    return false;
  });
};

/**
 * Subscribe to leads with real-time updates.
 */
export const subscribeToLeads = (onUpdate, onError) => {
  if (isFirebaseConnected() && db) {
    try {
      const leadsRef = collection(db, 'leads');
      const q = query(leadsRef, orderBy('created_at', 'desc'));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const leads = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              ...data,
              created_at: data.created_at?.toDate 
                ? data.created_at.toDate().toISOString() 
                : data.created_at || new Date().toISOString()
            };
          });
          onUpdate(leads, 'firebase');
        },
        (err) => {
          console.error('Firebase snapshot error, falling back to local:', err);
          if (onError) onError(err);
          const local = getLocalLeads();
          onUpdate(local, 'local');
        }
      );
      return unsubscribe;
    } catch (err) {
      console.error('Failed to setup Firebase query, using local storage:', err);
      const local = getLocalLeads();
      onUpdate(local, 'local');
      return () => {};
    }
  } else {
    // Local storage mode
    const local = getLocalLeads();
    onUpdate(local, 'local');

    const handler = (e) => {
      if (e.key === LOCAL_STORAGE_KEY) {
        onUpdate(getLocalLeads(), 'local');
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }
};

/**
 * Create a new lead with DUPLICATE DETECTION & REJECTION
 */
export const createLead = async (leadData, currentLeads = []) => {
  const existingList = currentLeads.length > 0 ? currentLeads : getLocalLeads();

  // Duplicate Check
  const duplicate = findDuplicate(leadData, existingList);
  if (duplicate) {
    const reason = normalizePhone(leadData.contact_number) === normalizePhone(duplicate.contact_number)
      ? `Phone number "${leadData.contact_number}" already exists for "${duplicate.business_name}".`
      : `Business name "${leadData.business_name}" is already registered.`;

    return {
      success: false,
      error: 'DUPLICATE_LEAD',
      message: `Duplicate lead rejected! ${reason}`,
      duplicate
    };
  }

  const newLead = {
    business_name: (leadData.business_name || '').trim(),
    type: (leadData.type || '').trim(),
    contact_number: (leadData.contact_number || '').trim(),
    location: (leadData.location || '').trim(),
    google_rating: Number(leadData.google_rating) || 0,
    google_reviews_count: Number(leadData.google_reviews_count) || 0,
    status: leadData.status || 'New',
    notes: (leadData.notes || '').trim(),
  };

  if (isFirebaseConnected() && db) {
    try {
      const docRef = await addDoc(collection(db, 'leads'), {
        ...newLead,
        created_at: serverTimestamp()
      });
      return { 
        success: true, 
        lead: { id: docRef.id, ...newLead, created_at: new Date().toISOString() } 
      };
    } catch (err) {
      console.error('Firebase addDoc failed, storing locally:', err);
    }
  }

  // Local Storage
  const leads = getLocalLeads();
  const created = {
    ...newLead,
    id: 'lead-' + Date.now(),
    created_at: new Date().toISOString()
  };
  const updated = [created, ...leads];
  saveLocalLeads(updated);
  return { success: true, lead: created };
};

/**
 * Bulk Import Leads from JSON with automated deduplication
 */
export const bulkImportLeads = async (rawLeadsArray, currentLeads = []) => {
  if (!Array.isArray(rawLeadsArray) || rawLeadsArray.length === 0) {
    return {
      success: false,
      message: 'Invalid JSON format: Must be an array of lead objects.',
      addedCount: 0,
      skippedCount: 0
    };
  }

  const existingList = currentLeads.length > 0 ? currentLeads : getLocalLeads();
  const toInsert = [];
  const skipped = [];
  const processedPool = [...existingList];

  for (const item of rawLeadsArray) {
    // Normalization & Field Mapping
    const candidate = {
      business_name: (item.business_name || item.businessName || item.name || item.title || '').trim(),
      type: (item.type || item.category || item.industry || '').trim(),
      contact_number: (item.contact_number || item.phone || item.contact || item.phoneNumber || '').toString().trim(),
      location: (item.location || item.city || item.address || '').trim(),
      google_rating: parseFloat(item.google_rating ?? item.rating ?? 0) || 0,
      google_reviews_count: parseInt(item.google_reviews_count ?? item.reviews ?? item.reviewsCount ?? 0, 10) || 0,
      status: (item.status || 'New').trim(),
      notes: (item.notes || item.description || '').trim(),
    };

    if (!candidate.business_name && !candidate.contact_number) {
      skipped.push({ lead: candidate, reason: 'Missing both business name and contact number' });
      continue;
    }

    // Check duplicate against existing leads AND already validated items in this batch
    const duplicate = findDuplicate(candidate, processedPool);
    if (duplicate) {
      const reason = normalizePhone(candidate.contact_number) === normalizePhone(duplicate.contact_number)
        ? `Duplicate phone number: ${candidate.contact_number}`
        : `Duplicate business name: "${candidate.business_name}"`;
      skipped.push({ lead: candidate, reason });
      continue;
    }

    // Unique lead
    const timestamp = new Date().toISOString();
    const finalLead = {
      ...candidate,
      created_at: timestamp
    };

    toInsert.push(finalLead);
    // Add to pool so duplicate entries within the imported array are also prevented
    processedPool.push(finalLead);
  }

  if (toInsert.length === 0) {
    return {
      success: true,
      addedCount: 0,
      skippedCount: skipped.length,
      skipped,
      message: `No new leads added. All ${skipped.length} lead(s) were duplicates or invalid.`
    };
  }

  // Insert to Firebase or Local Storage
  if (isFirebaseConnected() && db) {
    try {
      // Use batch writes for optimal cloud performance
      const batch = writeBatch(db);
      const leadsRef = collection(db, 'leads');

      toInsert.forEach((lead) => {
        const newDoc = doc(leadsRef);
        batch.set(newDoc, {
          ...lead,
          created_at: serverTimestamp()
        });
      });

      await batch.commit();

      return {
        success: true,
        addedCount: toInsert.length,
        skippedCount: skipped.length,
        skipped,
        message: `Successfully imported ${toInsert.length} lead(s). ${skipped.length} duplicate(s) rejected.`
      };
    } catch (err) {
      console.error('Firebase batch import failed, falling back to local:', err);
    }
  }

  // Fallback to Local Storage
  const leads = getLocalLeads();
  const mappedToInsert = toInsert.map((lead, idx) => ({
    ...lead,
    id: `import-${Date.now()}-${idx}`
  }));
  const updated = [...mappedToInsert, ...leads];
  saveLocalLeads(updated);

  return {
    success: true,
    addedCount: toInsert.length,
    skippedCount: skipped.length,
    skipped,
    message: `Successfully imported ${toInsert.length} lead(s). ${skipped.length} duplicate(s) rejected.`
  };
};

/**
 * Update an existing lead (with duplicate check against other leads)
 */
export const updateLead = async (leadId, fields, currentLeads = []) => {
  const existingList = currentLeads.length > 0 ? currentLeads : getLocalLeads();

  // If changing name or phone, verify no collision with ANOTHER lead
  if (fields.business_name || fields.contact_number) {
    const duplicate = findDuplicate(fields, existingList, leadId);
    if (duplicate) {
      return {
        success: false,
        error: 'DUPLICATE_LEAD',
        message: `Cannot update: A lead with this business name or phone already exists (${duplicate.business_name}).`
      };
    }
  }

  const sanitized = { ...fields };
  if (sanitized.google_rating !== undefined) {
    sanitized.google_rating = Number(sanitized.google_rating);
  }
  if (sanitized.google_reviews_count !== undefined) {
    sanitized.google_reviews_count = Number(sanitized.google_reviews_count);
  }

  if (isFirebaseConnected() && db) {
    try {
      const leadRef = doc(db, 'leads', leadId);
      await updateDoc(leadRef, sanitized);
      return { success: true };
    } catch (err) {
      console.error('Firebase updateDoc failed, updating locally:', err);
    }
  }

  // Local Storage
  const leads = getLocalLeads();
  const updated = leads.map((l) => (l.id === leadId ? { ...l, ...sanitized } : l));
  saveLocalLeads(updated);
  return { success: true };
};

/**
 * Delete a lead
 */
export const deleteLead = async (leadId) => {
  if (isFirebaseConnected() && db) {
    try {
      const leadRef = doc(db, 'leads', leadId);
      await deleteDoc(leadRef);
      return true;
    } catch (err) {
      console.error('Firebase deleteDoc failed, deleting locally:', err);
    }
  }

  // Local Storage
  const leads = getLocalLeads();
  const filtered = leads.filter((l) => l.id !== leadId);
  saveLocalLeads(filtered);
  return true;
};

/**
 * Reset leads to initial mock data (for local testing)
 */
export const resetMockLeads = () => {
  saveLocalLeads(INITIAL_LEADS);
  return INITIAL_LEADS;
};
