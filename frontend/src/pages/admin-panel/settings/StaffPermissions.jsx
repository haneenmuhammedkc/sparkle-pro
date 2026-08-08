import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ShieldCheck, ArrowRight } from 'lucide-react';

const StaffPermissions = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 text-gray-900">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Staff Management & Permissions</h2>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
          Configure role access levels across managers, technicians, and wash staff.
        </p>
      </div>

      <div className="space-y-3">
        {[
          { role: 'Operations Manager', members: 2, access: 'Full Control', desc: 'Can manage billing, view analytics, assign jobs, and edit shop settings.' },
          { role: 'Supervisor', members: 3, access: 'Quality Check & Assignments', desc: 'Can approve QC stages, assign technicians, and update vehicle status.' },
          { role: 'Detailing Specialist', members: 5, access: 'Job Workflow & Status', desc: 'Can update active service progress and view assigned vehicle details.' },
          { role: 'Wash Operator', members: 4, access: 'Task View & Timer', desc: 'Can log start/stop wash timers and mark wash phases complete.' },
        ].map((r) => (
          <div
            key={r.role}
            className="p-5 bg-white border border-gray-200/90 rounded-3xl shadow-2xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">{r.role}</h3>
                <span className="text-xs text-gray-500 font-semibold">{r.members} Members Assigned</span>
              </div>
              <span className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full border border-gray-200">
                {r.access}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium pt-1 border-t border-gray-100">
              {r.desc}
            </p>
          </div>
        ))}
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
