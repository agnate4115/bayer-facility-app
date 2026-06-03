import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, MapPin, User, Building, Layers, AlertCircle, Check, Loader2 } from 'lucide-react';
import { categories } from '@/data/mockData';
import { API_URL } from '@/config';

const BAYER_GREEN = '#56D500';

interface User {
  name: string;
  email: string;
  profilePic: string;
  designation: string;
  department: string;
  office: string;
  employeeId: string;
}

interface NewTicketProps {
  user: User;
}

export default function NewTicket({ user }: NewTicketProps) {
  const navigate = useNavigate();
  const [offices, setOffices] = useState<any[]>([]);
  const [selectedOfficeId, setSelectedOfficeId] = useState('');
  
  const [description, setDescription] = useState('');
  const [floorNumber, setFloorNumber] = useState('');
  const [zone, setZone] = useState('');
  
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoadingOffices, setIsLoadingOffices] = useState(true);

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const res = await fetch(`${API_URL}/api/offices/`);
        const data = await res.json();
        setOffices(data);
        if (data.length > 0) {
          setSelectedOfficeId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch offices", err);
      } finally {
        setIsLoadingOffices(false);
      }
    };
    fetchOffices();
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 3) {
      alert('You can upload maximum 3 photos');
      return;
    }

    const newPhotos = files.slice(0, 3 - photos.length);
    setPhotos([...photos, ...newPhotos]);

    newPhotos.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim() || !selectedOfficeId || !floorNumber.trim() || !zone.trim()) {
      alert('Please fill out all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('office_id', selectedOfficeId);
      formData.append('floor', floorNumber);
      formData.append('zone', zone);
      formData.append('description', description);
      formData.append('user_id', user.employeeId || 'unknown');
      formData.append('user_name', user.name);
      
      photos.forEach(photo => {
        formData.append('photos', photo);
      });

      const res = await fetch(`${API_URL}/api/tickets/`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Failed to submit ticket');
      
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/app/dashboard/ticket-history');
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('Error submitting ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingOffices) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-[#01BEFF]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3">
            <Check size={24} />
            <div>
              <p className="font-body font-semibold">Ticket submitted successfully!</p>
              <p className="font-body text-sm opacity-90">Redirecting to ticket history...</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold mb-2 text-[#00314E] ">
          Report New Issue
        </h1>
        <p className="font-body text-gray-600">
          Describe the facilities issue. Our AI will automatically categorize and route it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Office Selection */}
        <div className="rounded-xl p-6 bg-white border border-gray-200">
          <label className="flex items-center gap-2 font-display text-sm font-bold mb-3 text-gray-900 uppercase tracking-wider">
            <Building size={16} className="text-gray-600" />
            Select Office
            <span className="text-red-600">*</span>
          </label>
          <select
            value={selectedOfficeId}
            onChange={(e) => setSelectedOfficeId(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-body text-sm transition-all"
          >
            {offices.map((off) => (
              <option key={off.id} value={off.id}>
                {off.name}
              </option>
            ))}
          </select>
        </div>

        {/* Location Specifics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-xl p-6 bg-white border border-gray-200">
            <label className="flex items-center gap-2 font-display text-sm font-bold mb-3 text-gray-900 uppercase tracking-wider">
              <Layers size={16} className="text-gray-600" />
              Floor
              <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={floorNumber}
              onChange={(e) => setFloorNumber(e.target.value)}
              placeholder="e.g. 3rd Floor"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-body text-sm transition-all"
            />
          </div>
          <div className="rounded-xl p-6 bg-white border border-gray-200">
            <label className="flex items-center gap-2 font-display text-sm font-bold mb-3 text-gray-900 uppercase tracking-wider">
              <MapPin size={16} className="text-gray-600" />
              Zone / Landmark
              <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              placeholder="e.g. Near West Cafeteria"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-body text-sm transition-all"
            />
          </div>
        </div>

        {/* Issue Description */}
        <div className="rounded-xl p-6 bg-white border border-gray-200">
          <label className="flex items-center gap-2 font-display text-sm font-bold mb-3 text-gray-900 uppercase tracking-wider">
            <AlertCircle size={16} className="text-red-600" />
            Describe the Issue
            <span className="text-red-600">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please describe the issue in detail. What's broken? When did you notice it?"
            rows={6}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-body text-sm resize-none transition-all"
          />
        </div>

        {/* Photo Upload (Optional) */}
        <div className="rounded-xl p-6 bg-white border border-gray-200">
          <label className="flex items-center gap-2 font-display text-sm font-bold mb-3 text-gray-900 uppercase tracking-wider">
            <Upload size={16} className="text-gray-600" />
            Upload Photos
            <span className="font-body text-xs normal-case text-gray-500 font-normal">(Optional, max 3)</span>
          </label>

          {photos.length < 3 && (
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all">
                <Upload size={32} className="mx-auto mb-3 text-gray-400" />
                <p className="font-body text-sm font-medium text-gray-700 mb-1">
                  Click to upload photos
                </p>
                <p className="font-body text-xs text-gray-500">
                  PNG, JPG up to 5MB each
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          )}

          {photoPreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              {photoPreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting || !description.trim() || !selectedOfficeId}
            style={{ backgroundColor: BAYER_GREEN }}
            className="flex-1 py-4 rounded-xl font-display text-sm font-bold uppercase tracking-wider text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={20} className="animate-spin" />
                Analyzing & Routing...
              </span>
            ) : (
              'Submit Ticket'
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/dashboard')}
            className="px-6 py-4 rounded-xl font-display text-sm font-bold uppercase tracking-wider text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
