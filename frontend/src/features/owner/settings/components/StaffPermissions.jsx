import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import * as staffService from '../../staff/services/staffService.js';

const ROLE_PERMISSIONS = [
  { role: 'Operations Manager', access: 'Full Control', desc: 'Can manage billing, view analytics, assign jobs, and edit shop settings.' },
  { role: 'Supervisor', access: 'Quality Check & Assignments', desc: 'Can approve QC stages, assign technicians, and update vehicle status.' },
  { role: 'Detailing Specialist', access: 'Job Workflow & Status', desc: 'Can update active service progress and view assigned vehicle details.' },
  { role: 'Wash Operator', access: 'Task View & Timer', desc: 'Can log start/stop wash timers and mark wash phases complete.' },
];

const StaffPermissions = () => {
  const navigate = useNavigate();
  const [roleCounts, setRoleCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffCounts = async () => {
      try {
        const res = await staffService.getStaff({ limit: 100 });
        if (res.success && res.data && Array.isArray(res.data.staff)) {
          const counts = {};
          res.data.staff.forEach((s) => {
            const role = s.role || 'Technician';
            counts[role] = (counts[role] || 0) + 1;
          });
          setRoleCounts(counts);
        }
      } catch (err) {
        // Fallback silently if offline
      } finally {
        setLoading(false);
      }
    };

    fetchStaffCounts();
  }, []);

  return (
    <div className="space-y-6 text-gray-900">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Staff Management & Permissions</h2>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
          Configure role access levels across managers, technicians, and wash staff.
        </p>
      </div>

      <div className="space-y-3">
        {ROLE_PERMISSIONS.map((r) => {
          const count = roleCounts[r.role] || 0;
          return (
            <div
              key={r.role}
              className="p-5 bg-white border border-gray-200/90 rounded-3xl shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">{r.role}</h3>
                  <span className="text-xs text-gray-500 font-semibold">
                    {loading ? '...' : `${count} Member${count === 1 ? '' : 's'} Assigned`}
                  </span>
                </div>
                <span className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full border border-gray-200">
                  {r.access}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium pt-1 border-t border-gray-100">
                {r.desc}
              </p>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => navigate('/staff')}
        className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-bold px-6 py-3.5 rounded-2xl text-xs sm:text-sm transition-all shadow-sm active:scale-95"
      >
        Open Full Staff Dashboard
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default StaffPermissions;
