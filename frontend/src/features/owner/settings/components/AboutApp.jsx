import React from 'react';
import { Info, RefreshCw, ShieldCheck, FileText } from 'lucide-react';

const AboutApp = () => {
  return (
    <div className="space-y-6 text-gray-900">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">About SparklePro</h2>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
          Smart Vehicle Detailing & Workshop Operations Platform.
        </p>
      </div>

      <div className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center text-white shadow-md font-extrabold text-xl shrink-0">
            SP
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-gray-900">SparklePro Platform</h3>
            <p className="text-xs text-gray-500 font-semibold">Enterprise Edition v2.4.1</p>
            <span className="inline-block mt-1 bg-gray-100 text-gray-800 text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-gray-200">
              Build #84920 • Stable Release
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t border-gray-100 text-xs sm:text-sm">
          <div className="flex justify-between font-semibold">
            <span className="text-gray-500">License Verification</span>
            <span className="text-gray-900 font-bold">Verified Enterprise Active</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span className="text-gray-500">Database Engine</span>
            <span className="text-gray-900 font-bold">MongoDB Cloud Sync Engine</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span className="text-gray-500">Last System Update</span>
            <span className="text-gray-900 font-bold">August 2026</span>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-bold px-5 py-2.5 rounded-2xl text-xs shadow-sm">
            <RefreshCw className="w-4 h-4" />
            Check for Updates
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutApp;
