import React, { useState } from 'react';
import { HardDrive, Download, Calendar, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import * as settingsService from '../services/settingsService';

const BackupData = () => {
  const [downloadingType, setDownloadingType] = useState(null);
  const [message, setMessage] = useState(null);

  const handleDownload = async (type) => {
    try {
      setDownloadingType(type);
      setMessage(null);
      await settingsService.downloadBackup(type);
      setMessage({ type: 'success', text: `Successfully exported ${type} backup archive!` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || `Failed to export ${type} backup archive` });
    } finally {
      setDownloadingType(null);
    }
  };

  return (
    <div className="space-y-6 text-gray-900">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Backup & Data Sync</h2>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
          Export weekly, monthly, and yearly shop records, vehicle logs, and customer data archives.
        </p>
      </div>

      {/* FEEDBACK ALERT */}
      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center gap-3 ${
            message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Cloud Sync Status */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-900 shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-gray-900">Automated Cloud Sync</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Live MongoDB sync active</p>
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
            <button
              onClick={() => handleDownload('weekly')}
              disabled={downloadingType === 'weekly'}
              className="w-full inline-flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white font-bold py-2.5 px-3 rounded-2xl text-xs transition-all shadow-sm disabled:opacity-50"
            >
              {downloadingType === 'weekly' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              {downloadingType === 'weekly' ? 'Exporting...' : 'Download Weekly (.CSV)'}
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
            <button
              onClick={() => handleDownload('monthly')}
              disabled={downloadingType === 'monthly'}
              className="w-full inline-flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white font-bold py-2.5 px-3 rounded-2xl text-xs transition-all shadow-sm disabled:opacity-50"
            >
              {downloadingType === 'monthly' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              {downloadingType === 'monthly' ? 'Exporting...' : 'Download Monthly (.CSV)'}
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
            <button
              onClick={() => handleDownload('yearly')}
              disabled={downloadingType === 'yearly'}
              className="w-full inline-flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white font-bold py-2.5 px-3 rounded-2xl text-xs transition-all shadow-sm disabled:opacity-50"
            >
              {downloadingType === 'yearly' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              {downloadingType === 'yearly' ? 'Exporting...' : 'Download Yearly (.JSON)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupData;
