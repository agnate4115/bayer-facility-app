import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Building2, MapPin, Briefcase, Search, Check, Shield, Loader2 } from 'lucide-react';
import { azureAdPeople, DEPARTMENT_TYPES } from '@/data/azureAdPeople';
import { API_URL } from '@/config';

const BAYER_GREEN = '#56D500';
const BAYER_BLUE = '#00314E';
const BAYER_CYAN = '#01BEFF';

interface DepartmentForm {
  id: string;
  name: string;
  managerId: string | null;
  technicianIds: string[];
}

// Helper to render a compact person pill
function PersonPill({ personId }: { personId: string | null }) {
  if (!personId) return <span className="text-gray-400 text-xs italic">Unassigned</span>;
  const person = azureAdPeople.find(p => p.id === personId);
  if (!person) return <span className="text-gray-400 text-xs italic">Unknown</span>;

  return (
    <div className="flex items-center gap-2">
      <img src={person.profilePic} alt={person.displayName} className="w-6 h-6 rounded-full" />
      <div className="flex-1 min-w-0">
        <p className="font-body text-xs font-semibold text-gray-900 truncate">
          {person.displayName}
        </p>
      </div>
    </div>
  );
}

export default function AddOffice() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    overallManagerId: null as string | null,
  });
  const [departments, setDepartments] = useState<DepartmentForm[]>([]);

  // Person Picker State
  const [showPersonPicker, setShowPersonPicker] = useState<{
    show: boolean;
    type: 'overall' | 'dept-manager' | 'dept-techs';
    deptId?: string;
  }>({ show: false, type: 'overall' });
  const [personSearch, setPersonSearch] = useState('');

  const generateQRCode = () => {
    if (!formData.name) return '';
    const officeCode = formData.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
    return `BAYER-${officeCode}`;
  };

  const addDepartment = () => {
    const newDept: DepartmentForm = {
      id: `new-dept-${Date.now()}`,
      name: DEPARTMENT_TYPES[0],
      managerId: null,
      technicianIds: [],
    };
    setDepartments([...departments, newDept]);
  };

  const removeDepartment = (deptId: string) => {
    setDepartments(departments.filter(d => d.id !== deptId));
  };

  const updateDepartmentName = (deptId: string, name: string) => {
    setDepartments(departments.map(d => d.id === deptId ? { ...d, name } : d));
  };

  const selectPerson = (personId: string) => {
    const { type, deptId } = showPersonPicker;
    
    if (type === 'overall') {
      setFormData({ ...formData, overallManagerId: personId });
    } else if (type === 'dept-manager' && deptId) {
      setDepartments(departments.map(d => 
        d.id === deptId ? { ...d, managerId: personId } : d
      ));
    } else if (type === 'dept-techs' && deptId) {
      setDepartments(departments.map(d => {
        if (d.id === deptId) {
          const isSelected = d.technicianIds.includes(personId);
          const newTechs = isSelected 
            ? d.technicianIds.filter(id => id !== personId)
            : [...d.technicianIds, personId];
          return { ...d, technicianIds: newTechs };
        }
        return d;
      }));
    }
    
    if (type !== 'dept-techs') {
      setShowPersonPicker({ show: false, type: 'overall' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.city || !formData.address) {
      alert('Please fill in all required basic info fields.');
      return;
    }

    setIsLoading(true);

    const payload = {
      name: formData.name,
      city: formData.city,
      address: formData.address,
      overall_manager_id: formData.overallManagerId,
      departments: departments.map(d => ({
        name: d.name,
        manager_id: d.managerId,
        technician_ids: d.technicianIds
      }))
    };

    try {
      const response = await fetch(`${API_URL}/api/offices/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create office');
      }

      console.log('Office created successfully!');
      navigate('/admin/offices');
    } catch (error) {
      console.error('Error creating office:', error);
      alert('Failed to create office. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPersonPicker = () => {
    if (!showPersonPicker.show) return null;
    
    const filteredPeople = azureAdPeople.filter(p => 
      p.displayName.toLowerCase().includes(personSearch.toLowerCase()) ||
      p.email.toLowerCase().includes(personSearch.toLowerCase())
    );

    let selectedIds: string[] = [];
    if (showPersonPicker.type === 'overall') {
      selectedIds = formData.overallManagerId ? [formData.overallManagerId] : [];
    } else if (showPersonPicker.type === 'dept-manager' && showPersonPicker.deptId) {
      const dept = departments.find(d => d.id === showPersonPicker.deptId);
      selectedIds = dept?.managerId ? [dept.managerId] : [];
    } else if (showPersonPicker.type === 'dept-techs' && showPersonPicker.deptId) {
      const dept = departments.find(d => d.id === showPersonPicker.deptId);
      selectedIds = dept?.technicianIds || [];
    }

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] shadow-2xl">
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

  const isFormValid = formData.name && formData.city && formData.address;

  return (
    <div   style={{ minHeight: '100vh' }} className="p-4 sm:p-6 lg:p-8 bg-slate-50 ">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate('/admin/offices')} className="inline-flex items-center gap-2 font-display text-xs uppercase tracking-widest text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft size={14} /> Back to Offices
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isFormValid || isLoading}
          className="px-6 py-2.5 bg-[#56D500] text-white rounded-lg font-display text-xs uppercase tracking-wider font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#45AA00] transition-colors shadow-sm flex items-center gap-2"
        >
          {isLoading && <Loader2 size={14} className="animate-spin" />}
          {isLoading ? 'Creating...' : 'Create Office'}
        </button>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
            <div   style={{ backgroundColor: `${BAYER_CYAN}15` }} className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 size={24}  style={{ color: BAYER_CYAN }} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-[#00314E] ">Add New Office</h1>
              <p className="font-body text-sm text-gray-500 mt-1">Configure location details, management, and departments</p>
            </div>
          </div>

          {/* Basic Info */}
          <div className="mb-8">
            <h3 className="font-display text-xs uppercase tracking-wider font-semibold text-gray-500 mb-4 flex items-center gap-2">
              <MapPin size={14} /> Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block font-body text-sm font-medium text-gray-700 mb-1.5">Office Name <span className="text-red-500">*</span></label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Thane Office" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#01BEFF] font-body text-sm bg-gray-50 focus:bg-white transition-colors" />
              </div>
              <div>
                <label className="block font-body text-sm font-medium text-gray-700 mb-1.5">City <span className="text-red-500">*</span></label>
                <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Thane" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#01BEFF] font-body text-sm bg-gray-50 focus:bg-white transition-colors" />
              </div>
              <div className="md:col-span-2">
                <label className="block font-body text-sm font-medium text-gray-700 mb-1.5">Full Address <span className="text-red-500">*</span></label>
                <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full physical address" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#01BEFF] font-body text-sm bg-gray-50 focus:bg-white transition-colors" />
              </div>
            </div>
          </div>

          {/* Leadership */}
          <div className="mb-8">
            <h3 className="font-display text-xs uppercase tracking-wider font-semibold text-gray-500 mb-4 flex items-center gap-2">
              <Shield size={14} /> Location Leadership
            </h3>
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-body text-sm font-semibold text-gray-900 mb-1">Overall Office Manager</p>
                <p className="font-body text-xs text-gray-500">Responsible for all operations at this location.</p>
              </div>
              <button 
                onClick={() => { setPersonSearch(''); setShowPersonPicker({ show: true, type: 'overall' }); }} className="flex items-center justify-center min-w-[200px] h-10 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-[#01BEFF] transition-colors"
              >
                {formData.overallManagerId ? <PersonPill personId={formData.overallManagerId} /> : <span className="text-gray-400 font-body text-sm">Select Manager...</span>}
              </button>
            </div>
          </div>

          {/* Departments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xs uppercase tracking-wider font-semibold text-gray-500 flex items-center gap-2">
                <Briefcase size={14} /> Departments & Teams
              </h3>
              <button onClick={addDepartment} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-display uppercase tracking-wider font-semibold text-[#56D500] bg-[#56D500]/10 hover:bg-[#56D500]/20 transition-colors">
                <Plus size={14} /> Add Department
              </button>
            </div>
            
            <div className="space-y-4">
              {departments.map((dept) => (
                <div key={dept.id} className="p-4 rounded-xl border border-gray-200 bg-white flex flex-col md:flex-row gap-4 relative group">
                  <div className="flex-1">
                    <label className="block font-display text-[7px] uppercase tracking-wider text-gray-400 mb-1.5">Department Type</label>
                    <select value={dept.name} onChange={(e) => updateDepartmentName(dept.id, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 font-body text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-[#01BEFF]">
                      {DEPARTMENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block font-display text-[7px] uppercase tracking-wider text-gray-400 mb-1.5">Manager</label>
                    <button onClick={() => { setPersonSearch(''); setShowPersonPicker({ show: true, type: 'dept-manager', deptId: dept.id }); }}
                      className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white hover:border-[#01BEFF] transition-colors flex items-center h-[38px]">
                      {dept.managerId ? <PersonPill personId={dept.managerId} /> : <span className="text-gray-400 font-body text-sm">Assign manager...</span>}
                    </button>
                  </div>
                  <div className="flex-1">
                    <label className="block font-display text-[7px] uppercase tracking-wider text-gray-400 mb-1.5">Technicians ({dept.technicianIds.length})</label>
                    <button onClick={() => { setPersonSearch(''); setShowPersonPicker({ show: true, type: 'dept-techs', deptId: dept.id }); }}
                      className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white hover:border-[#01BEFF] transition-colors flex items-center h-[38px] overflow-hidden">
                      {dept.technicianIds.length > 0 ? (
                        <div className="flex items-center gap-1">
                          {dept.technicianIds.slice(0,3).map(id => {
                            const p = azureAdPeople.find(person => person.id === id);
                            return p ? <img key={id} src={p.profilePic} className="w-6 h-6 rounded-full" title={p.displayName} /> : null;
                          })}
                          {dept.technicianIds.length > 3 && <span className="text-xs text-gray-500 font-mono ml-1">+{dept.technicianIds.length - 3}</span>}
                        </div>
                      ) : (
                        <span className="text-gray-400 font-body text-sm">Add technicians...</span>
                      )}
                    </button>
                  </div>
                  <button onClick={() => removeDepartment(dept.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-200">
                    <X size={12} />
                  </button>
                </div>
              ))}
              {departments.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                  <p className="font-body text-sm text-gray-500">No departments added yet. Click "Add Department" to start.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {renderPersonPicker()}
    </div>
  );
}
