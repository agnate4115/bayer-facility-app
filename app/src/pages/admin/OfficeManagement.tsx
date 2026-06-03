import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Building2, Users, MapPin, Search, Mail, Briefcase, ChevronDown, ChevronUp, X, Check, Shield, Loader2 } from 'lucide-react';
import { azureAdPeople, getPeopleByDepartment, currentAdmin, type AzureAdPerson } from '@/data/azureAdPeople';
import { API_URL } from '@/config';

const BAYER_GREEN = '#56D500';
const BAYER_BLUE = '#00314E';
const BAYER_CYAN = '#01BEFF';

interface Department {
  id: string;
  name: string;
  managerId: string | null;
  technicianIds: string[];
}

interface Office {
  id: string;
  name: string;
  city: string;
  address: string;
  overallManagerId: string | null;
  departments: Department[];
  qrCode?: string;
  createdAt: string;
  ticketCount: number;
  status: 'active' | 'inactive';
}

// Initial Mock Data mapped to azureAdPeople
const initialOffices: Office[] = [
  {
    id: 'office-001',
    name: 'Thane Office',
    city: 'Thane',
    address: 'Tower A, Eastern Express Highway, Thane West, Maharashtra 400601',
    overallManagerId: 'ad-001', // Rajesh Kumar
    departments: [
      {
        id: 'dept-1',
        name: 'HVAC / AC',
        managerId: 'ad-005', // Rahul Sharma
        technicianIds: ['ad-005', 'ad-018'],
      },
      {
        id: 'dept-2',
        name: 'Electrical',
        managerId: 'ad-006', // Amit Kumar
        technicianIds: ['ad-006'],
      }
    ],
    qrCode: 'BAYER-THN',
    createdAt: '2026-01-15',
    ticketCount: 156,
    status: 'active',
  },
  {
    id: 'office-002',
    name: 'Mumbai Office',
    city: 'Mumbai',
    address: 'Nariman Point Complex, 401-404, 4th Floor, Mumbai, Maharashtra 400021',
    overallManagerId: 'ad-004', // Vikram Singh
    departments: [
      {
        id: 'dept-3',
        name: 'IT Infrastructure',
        managerId: 'ad-008', // Lakshmi Menon
        technicianIds: ['ad-009'],
      }
    ],
    qrCode: 'BAYER-MUM',
    createdAt: '2026-02-20',
    ticketCount: 89,
    status: 'active',
  },
];

// Helper to render a compact person pill
function PersonPill({ personId, label }: { personId: string | null; label?: string }) {
  if (!personId) return <span className="text-gray-400 text-xs italic">Unassigned</span>;
  const person = azureAdPeople.find(p => p.id === personId);
  if (!person) return <span className="text-gray-400 text-xs italic">Unknown</span>;

  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100 max-w-xs">
      <img src={person.profilePic} alt={person.displayName} className="w-5 h-5 rounded-full" />
      <div className="flex-1 min-w-0">
        <p className="font-body text-xs font-semibold text-gray-900 truncate">
          {label && <span className="text-gray-500 font-normal mr-1">{label}:</span>}
          {person.displayName}
        </p>
      </div>
    </div>
  );
}

export default function OfficeManagement() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOfficeId, setExpandedOfficeId] = useState<string | null>(null);
  const [departmentTypes, setDepartmentTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchOffices();
  }, []);

  const fetchOffices = async () => {
    setIsLoading(true);
    try {
      const [officesRes, catRes] = await Promise.all([
        fetch(`${API_URL}/api/offices/`),
        fetch(`${API_URL}/api/settings/categories`)
      ]);
      const data = await officesRes.json();
      if (catRes.ok) {
        const catData = await catRes.json();
        setDepartmentTypes(catData.map((c: any) => c.name));
      }
      const formattedOffices = data.map((o: any) => ({
        id: o.id,
        name: o.name,
        city: o.city,
        address: o.address,
        overallManagerId: o.overall_manager_id,
        qrCode: o.qr_code,
        createdAt: o.created_at,
        ticketCount: o.ticket_count,
        status: o.status,
        departments: o.departments.map((d: any) => ({
          id: d.id,
          name: d.name,
          managerId: d.manager_id,
          technicianIds: d.technician_ids
        }))
      }));
      setOffices(formattedOffices);
      if (formattedOffices.length > 0) {
        setExpandedOfficeId(formattedOffices[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch offices", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Edit Modal State
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);
  const [showPersonPicker, setShowPersonPicker] = useState<{
    show: boolean;
    type: 'overall' | 'dept-manager' | 'dept-techs';
    deptId?: string;
  }>({ show: false, type: 'overall' });
  const [personSearch, setPersonSearch] = useState('');
  const [isSavingOffice, setIsSavingOffice] = useState(false);
  const [isDeletingOffice, setIsDeletingOffice] = useState(false);

  const filteredOffices = offices.filter(o => 
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    setExpandedOfficeId(expandedOfficeId === id ? null : id);
  };

  const handleEditClick = (office: Office) => {
    setEditingOffice(JSON.parse(JSON.stringify(office))); // deep copy
  };

  const handleSaveOffice = async () => {
    if (!editingOffice) return;
    if (!editingOffice.name || !editingOffice.city) {
      alert('Office Name and City are required.');
      return;
    }
    setIsSavingOffice(true);
    
    const payload = {
      name: editingOffice.name,
      city: editingOffice.city,
      address: editingOffice.address,
      overall_manager_id: editingOffice.overallManagerId,
      status: editingOffice.status,
      departments: editingOffice.departments.map(d => ({
        name: d.name,
        manager_id: d.managerId,
        technician_ids: d.technicianIds
      }))
    };

    try {
      const res = await fetch(`${API_URL}/api/offices/${editingOffice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to update office');
      
      await fetchOffices();
      setEditingOffice(null);
    } catch (err) {
      console.error(err);
      alert('Failed to save office updates.');
    } finally {
      setIsSavingOffice(false);
    }
  };

  const handleDeleteOffice = async (id: string) => {
    if (confirm('Are you sure you want to delete this office?')) {
      setIsDeletingOffice(true);
      try {
        const res = await fetch(`${API_URL}/api/offices/${id}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete office');
        
        await fetchOffices();
        if (expandedOfficeId === id) setExpandedOfficeId(null);
        setEditingOffice(null);
      } catch (err) {
        console.error(err);
        alert('Failed to delete office.');
      } finally {
        setIsDeletingOffice(false);
      }
    }
  };

  const addDepartment = () => {
    if (!editingOffice) return;
    const newDept: Department = {
      id: `new-dept-${Date.now()}`,
      name: departmentTypes.length > 0 ? departmentTypes[0] : 'General',
      managerId: null,
      technicianIds: [],
    };
    setEditingOffice({
      ...editingOffice,
      departments: [...editingOffice.departments, newDept]
    });
  };

  const removeDepartment = (deptId: string) => {
    if (!editingOffice) return;
    setEditingOffice({
      ...editingOffice,
      departments: editingOffice.departments.filter(d => d.id !== deptId)
    });
  };

  const updateDepartmentName = (deptId: string, name: string) => {
    if (!editingOffice) return;
    setEditingOffice({
      ...editingOffice,
      departments: editingOffice.departments.map(d => d.id === deptId ? { ...d, name } : d)
    });
  };

  const selectPerson = (personId: string) => {
    if (!editingOffice) return;
    const { type, deptId } = showPersonPicker;
    
    if (type === 'overall') {
      setEditingOffice({ ...editingOffice, overallManagerId: personId });
    } else if (type === 'dept-manager' && deptId) {
      setEditingOffice({
        ...editingOffice,
        departments: editingOffice.departments.map(d => 
          d.id === deptId ? { ...d, managerId: personId } : d
        )
      });
    } else if (type === 'dept-techs' && deptId) {
      setEditingOffice({
        ...editingOffice,
        departments: editingOffice.departments.map(d => {
          if (d.id === deptId) {
            const isSelected = d.technicianIds.includes(personId);
            const newTechs = isSelected 
              ? d.technicianIds.filter(id => id !== personId)
              : [...d.technicianIds, personId];
            return { ...d, technicianIds: newTechs };
          }
          return d;
        })
      });
    }
    
    if (type !== 'dept-techs') {
      setShowPersonPicker({ show: false, type: 'overall' });
    }
  };

  // Render Person Picker Modal
  const renderPersonPicker = () => {
    if (!showPersonPicker.show) return null;
    
    const filteredPeople = azureAdPeople.filter(p => 
      p.displayName.toLowerCase().includes(personSearch.toLowerCase()) ||
      p.email.toLowerCase().includes(personSearch.toLowerCase())
    );

    let selectedIds: string[] = [];
    if (editingOffice) {
      if (showPersonPicker.type === 'overall') {
        selectedIds = editingOffice.overallManagerId ? [editingOffice.overallManagerId] : [];
      } else if (showPersonPicker.type === 'dept-manager' && showPersonPicker.deptId) {
        const dept = editingOffice.departments.find(d => d.id === showPersonPicker.deptId);
        selectedIds = dept?.managerId ? [dept.managerId] : [];
      } else if (showPersonPicker.type === 'dept-techs' && showPersonPicker.deptId) {
        const dept = editingOffice.departments.find(d => d.id === showPersonPicker.deptId);
        selectedIds = dept?.technicianIds || [];
      }
    }

    return (
      <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-display font-semibold text-gray-900">
              {showPersonPicker.type === 'dept-techs' ? 'Select Technicians' : 'Select Manager'}
            </h3>
            <button onClick={() => setShowPersonPicker({ show: false, type: 'overall' })} className="p-1 hover:bg-gray-100 rounded-lg">
              <X size={18} className="text-gray-500" />
            </button>
          </div>
          
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Azure AD directory..."
                value={personSearch}
                onChange={(e) => setPersonSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-[#01BEFF] font-body text-sm bg-white"
                autoFocus
              />
            </div>
          </div>

          <div className="overflow-y-auto p-2">
            {filteredPeople.map(person => {
              const isSelected = selectedIds.includes(person.id);
              return (
                <button
                  key={person.id}
                  onClick={() => selectPerson(person.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isSelected ? 'bg-[#56D500]/10 border border-[#56D500]/30' : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <img src={person.profilePic} alt={person.displayName} className="w-10 h-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-body text-sm font-semibold text-gray-900 truncate">{person.displayName}</p>
                    <p className="font-body text-xs text-gray-500 truncate">{person.designation} · {person.department}</p>
                  </div>
                  {isSelected && <Check size={18}  style={{ color: BAYER_GREEN }} />}
                </button>
              );
            })}
          </div>

          {showPersonPicker.type === 'dept-techs' && (
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setShowPersonPicker({ show: false, type: 'overall' })}
                className="px-4 py-2 bg-[#56D500] text-white font-semibold text-sm rounded-lg hover:bg-[#45AA00] transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div   style={{ minHeight: '100vh' }} className="p-4 sm:p-6 lg:p-8 bg-slate-50 ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-xl lg:text-2xl font-semibold text-[#00314E] ">
            Office Management
          </h1>
          <p className="font-body text-sm mt-1 text-slate-500 ">
            Manage locations, departments, and personnel
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search offices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-[#01BEFF] font-body text-sm w-full sm:w-64 bg-white"
            />
          </div>
          <Link
            to="/admin/offices/new"
              style={{ backgroundColor: BAYER_GREEN }}
           className="flex items-center gap-2 px-4 py-2 rounded-lg font-display text-[10px] uppercase tracking-wider font-semibold text-white transition-colors flex-shrink-0">
            <Plus size={14} />
            <span className="hidden sm:inline">Add Office</span>
          </Link>
        </div>
      </div>

      {/* Office Cards List */}
      <div className="space-y-4">
        {filteredOffices.map((office) => {
          const isExpanded = expandedOfficeId === office.id;
          const overallManager = azureAdPeople.find(p => p.id === office.overallManagerId);

          return (
            <div
              key={office.id}
                style={{ boxShadow: isExpanded ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : 'none' }}
             className="rounded-2xl transition-all duration-200 bg-white  border border-slate-200 ">
              {/* Card Header (Always visible) */}
              <div 
                className="p-5 cursor-pointer flex items-center justify-between gap-4"
                onClick={() => toggleExpand(office.id)}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div   style={{ backgroundColor: `${BAYER_CYAN}15` }} className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Building2 size={24}  style={{ color: BAYER_CYAN }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-display text-lg font-semibold truncate text-[#00314E] ">
                        {office.name}
                      </h2>
                      <span className="font-display text-[9px] uppercase tracking-widest px-2 py-0.5 rounded font-semibold bg-green-50 text-green-700">
                        {office.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-body text-sm text-gray-500 truncate">
                      <MapPin size={14} className="flex-shrink-0" />
                      <span className="truncate">{office.address}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {overallManager && (
                    <div className="hidden md:block border-r border-gray-100 pr-4">
                      <p className="font-display text-[9px] uppercase tracking-wider text-gray-400 mb-1">Overall Manager</p>
                      <PersonPill personId={office.overallManagerId} />
                    </div>
                  )}
                  <div className="hidden sm:block text-center border-r border-gray-100 pr-4">
                    <p className="font-display text-[9px] uppercase tracking-wider text-gray-400 mb-1">Departments</p>
                    <p className="font-mono text-sm font-semibold">{office.departments.length}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEditClick(office); }} className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-400 hover:text-[#01BEFF]"
                    title="Edit Office"
                  >
                    <Edit2 size={18} />
                  </button>
                  <div className="p-1 rounded-full hover:bg-gray-50 transition-colors">
                    {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Col: Info & Overall Manager */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-display text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-3">Office Details</h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <MapPin size={14} className="text-gray-400 mt-0.5" />
                            <div>
                              <p className="font-body text-sm font-medium text-gray-900">{office.city}</p>
                              <p className="font-body text-xs text-gray-500 mt-0.5">{office.address}</p>
                            </div>
                          </div>
                          {office.qrCode && (
                            <div className="flex items-center gap-2">
                              <Shield size={14} className="text-gray-400" />
                              <p className="font-mono text-xs px-2 py-0.5 rounded bg-gray-50 text-gray-600 border border-gray-100">
                                {office.qrCode}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-display text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-3">Overall Manager</h3>
                        {overallManager ? (
                          <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
                            <img src={overallManager.profilePic} alt={overallManager.displayName} className="w-10 h-10 rounded-full" />
                            <div>
                              <p className="font-body text-sm font-semibold text-gray-900">{overallManager.displayName}</p>
                              <p className="font-body text-[11px] text-gray-500">{overallManager.email}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="font-body text-sm text-gray-400 italic">No overall manager assigned</p>
                        )}
                      </div>
                    </div>

                    {/* Right Col: Departments */}
                    <div className="lg:col-span-2">
                      <h3 className="font-display text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-3">Departments & Teams</h3>
                      
                      {office.departments.length === 0 ? (
                        <div className="text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          <p className="font-body text-sm text-gray-500">No departments configured yet.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {office.departments.map((dept) => {
                            const manager = azureAdPeople.find(p => p.id === dept.managerId);
                            const techs = dept.technicianIds.map(id => azureAdPeople.find(p => p.id === id)).filter(Boolean) as AzureAdPerson[];
                            
                            return (
                              <div key={dept.id} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-gray-200 transition-colors">
                                <h4 className="font-display text-sm font-semibold text-gray-900 mb-3 flex items-center justify-between">
                                  {dept.name}
                                  <span className="font-mono text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                    {techs.length} tech{techs.length !== 1 && 's'}
                                  </span>
                                </h4>
                                
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between">
                                    <span className="font-display text-[9px] uppercase text-gray-400 w-16 pt-1">Manager</span>
                                    <div className="flex-1">
                                      <PersonPill personId={dept.managerId} />
                                    </div>
                                  </div>
                                  
                                  {techs.length > 0 && (
                                    <div className="flex items-start justify-between mt-2 pt-2 border-t border-gray-50">
                                      <span className="font-display text-[9px] uppercase text-gray-400 w-16 pt-1">Team</span>
                                      <div className="flex-1 flex flex-wrap gap-1">
                                        {techs.map(t => (
                                          <img 
                                            key={t.id} 
                                            src={t.profilePic} 
                                            alt={t.displayName} 
                                            title={t.displayName}
                                            className="w-6 h-6 rounded-full border border-gray-200" 
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {/* Empty State / Loading */}
      {isLoading ? (
        <div className="text-center py-12 flex flex-col items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#01BEFF] mb-4" />
          <p className="font-display text-lg font-semibold text-gray-900">Loading offices...</p>
        </div>
      ) : filteredOffices.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} className="text-gray-400" />
          </div>
          <p className="font-display text-lg font-semibold text-gray-900">No offices found</p>
          <p className="font-body text-sm text-gray-500 mt-1">Try adjusting your search criteria</p>
        </div>
      ) : null}
      </div>

      {/* Full Edit Modal */}
      {editingOffice && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col my-8 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0 bg-gray-50/50 rounded-t-2xl">
              <h2 className="font-display text-xl font-semibold text-gray-900">Edit Office: {editingOffice.name}</h2>
              <button onClick={() => setEditingOffice(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              
              {/* Basic Info */}
              <div>
                <h3 className="font-display text-xs uppercase tracking-wider font-semibold text-gray-500 mb-4 flex items-center gap-2">
                  <MapPin size={14} /> Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-xs text-gray-600 mb-1">Office Name</label>
                    <input
                      type="text"
                      value={editingOffice.name}
                      onChange={(e) => setEditingOffice({ ...editingOffice, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#01BEFF] font-body text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-body text-xs text-gray-600 mb-1">City</label>
                    <input
                      type="text"
                      value={editingOffice.city}
                      onChange={(e) => setEditingOffice({ ...editingOffice, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#01BEFF] font-body text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-body text-xs text-gray-600 mb-1">Full Address</label>
                    <input
                      type="text"
                      value={editingOffice.address}
                      onChange={(e) => setEditingOffice({ ...editingOffice, address: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#01BEFF] font-body text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Overall Manager */}
              <div>
                <h3 className="font-display text-xs uppercase tracking-wider font-semibold text-gray-500 mb-4 flex items-center gap-2">
                  <Shield size={14} /> Leadership
                </h3>
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-body text-sm font-semibold text-gray-900 mb-1">Overall Office Manager</p>
                    <p className="font-body text-xs text-gray-500">Responsible for all operations at this location.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setPersonSearch('');
                      setShowPersonPicker({ show: true, type: 'overall' });
                    }}
                    className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-[#01BEFF] transition-colors"
                  >
                    {editingOffice.overallManagerId ? (
                      <PersonPill personId={editingOffice.overallManagerId} />
                    ) : (
                      <span className="text-gray-400 font-body text-sm">Select Manager...</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Departments */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xs uppercase tracking-wider font-semibold text-gray-500 flex items-center gap-2">
                    <Briefcase size={14} /> Departments & Teams
                  </h3>
                  <button 
                    onClick={addDepartment}
                    className="flex items-center gap-1 text-xs font-display uppercase font-semibold text-[#56D500] hover:text-[#45AA00]"
                  >
                    <Plus size={14} /> Add Department
                  </button>
                </div>
                
                <div className="space-y-4">
                  {editingOffice.departments.map((dept, index) => (
                    <div key={dept.id} className="p-4 rounded-xl border border-gray-200 bg-white flex flex-col md:flex-row gap-4 relative group">
                      
                      {/* Dept Name */}
                      <div className="flex-1">
                        <label className="block font-display text-[9px] uppercase tracking-wider text-gray-400 mb-1">Department Type</label>
                        <select
                          value={dept.name}
                          onChange={(e) => updateDepartmentName(dept.id, e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 font-body text-sm focus:outline-none focus:border-[#01BEFF]"
                        >
                          {departmentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                      </div>

                      {/* Dept Manager */}
                      <div className="flex-1">
                        <label className="block font-display text-[9px] uppercase tracking-wider text-gray-400 mb-1">Dept. Manager</label>
                        <button 
                          onClick={() => {
                            setPersonSearch('');
                            setShowPersonPicker({ show: true, type: 'dept-manager', deptId: dept.id });
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:border-[#01BEFF] transition-colors flex items-center h-[38px]"
                        >
                          {dept.managerId ? <PersonPill personId={dept.managerId} /> : <span className="text-gray-400 font-body text-xs">Assign manager...</span>}
                        </button>
                      </div>

                      {/* Dept Techs */}
                      <div className="flex-1">
                        <label className="block font-display text-[9px] uppercase tracking-wider text-gray-400 mb-1">Technicians ({dept.technicianIds.length})</label>
                        <button 
                          onClick={() => {
                            setPersonSearch('');
                            setShowPersonPicker({ show: true, type: 'dept-techs', deptId: dept.id });
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:border-[#01BEFF] transition-colors flex items-center h-[38px] overflow-hidden"
                        >
                          {dept.technicianIds.length > 0 ? (
                            <div className="flex items-center gap-1">
                              {dept.technicianIds.slice(0,3).map(id => {
                                const p = azureAdPeople.find(person => person.id === id);
                                return p ? <img key={id} src={p.profilePic} className="w-5 h-5 rounded-full" title={p.displayName} /> : null;
                              })}
                              {dept.technicianIds.length > 3 && <span className="text-xs text-gray-500 font-mono ml-1">+{dept.technicianIds.length - 3}</span>}
                            </div>
                          ) : (
                            <span className="text-gray-400 font-body text-xs">Add technicians...</span>
                          )}
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeDepartment(dept.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-200"
                        title="Remove Department"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {editingOffice.departments.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
                      <p className="font-body text-sm text-gray-400">No departments added yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-b-2xl">
              <button 
                onClick={() => handleDeleteOffice(editingOffice.id)}
                disabled={isDeletingOffice}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-body text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeletingOffice ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {isDeletingOffice ? 'Deleting...' : 'Delete Office'}
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={() => setEditingOffice(null)}
                  className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-display text-sm uppercase tracking-wider font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveOffice}
                  disabled={isSavingOffice}
                  className="px-6 py-2 bg-[#56D500] text-white rounded-lg font-display text-sm uppercase tracking-wider font-semibold hover:bg-[#45AA00] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSavingOffice && <Loader2 size={16} className="animate-spin" />}
                  {isSavingOffice ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Render Person Picker if active */}
      {renderPersonPicker()}
    </div>
  );
}
