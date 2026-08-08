import React, { useState } from 'react';
import { HardDrive, Download, RefreshCw, Calendar, CheckCircle2 } from 'lucide-react';

const BackupData = () => {
  const [autoBackupFreq, setAutoBackupFreq] = useState('weekly');

  return (
    <div className="space-y-6 text-gray-900">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Backup & Data Sync</h2>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
          Export weekly, monthly, and yearly shop records, vehicle logs, and customer data archives.
        </p>
      </div>

      {/* Cloud Sync Status */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-900 shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-gray-900">Automated Cloud Sync</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Last synced 5 minutes ago</p>
          </div>
        </div>

        <span className="text-xs font-extrabold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
          Active Sync
        </span>
      </div>

      {/* THREE BACKUP SECTIONS: WEEKLY, MONTHLY & YEARLY */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
          Backup Archives & Schedules
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* WEEKLY BACKUP */}
          <div className="bg-white border border-gray-200/90 rounded-3xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-gray-400 uppercase">WEEKLY BACKUP</span>
              <Calendar className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-gray-900">Weekly Archive</h4>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Jobs & customer logs from last 7 days</p>
            </div>
            <button className="w-full inline-flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white font-bold py-2.5 px-3 rounded-2xl text-xs transition-all shadow-sm">
              <Download className="w-3.5 h-3.5" />
              Download Weekly (.CSV)
            </button>
          </div>

          {/* MONTHLY BACKUP */}
          <div className="bg-white border border-gray-200/90 rounded-3xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-gray-400 uppercase">MONTHLY BACKUP</span>
              <Calendar className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-gray-900">Monthly Archive</h4>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Complete 30-day revenue & staff records</p>
            </div>
            <button className="w-full inline-flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white font-bold py-2.5 px-3 rounded-2xl text-xs transition-all shadow-sm">
              <Download className="w-3.5 h-3.5" />
              Download Monthly (.CSV)
            </button>
          </div>

          {/* YEARLY BACKUP */}
          <div className="bg-white border border-gray-200/90 rounded-3xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-gray-400 uppercase">YEARLY BACKUP</span>
              <Calendar className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-gray-900">Yearly Master Backup</h4>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Full financial database & history (.JSON)</p>
            </div>
            <button className="w-full inline-flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white font-bold py-2.5 px-3 rounded-2xl text-xs transition-all shadow-sm">
              <Download className="w-3.5 h-3.5" />
              Download Yearly (.JSON)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupData;
