import React, { useState } from 'react';
import { Bell } from 'lucide-react';

const NotificationsSettings = () => {
  const [toggles, setToggles] = useState({
    emailAlerts: true,
    smsReminders: true,
    pushNotifs: true,
    jobComplete: true,
    weeklyReport: false,
  });

  const toggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 text-gray-900">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Notifications Preferences</h2>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
          Control notification channels for shop updates, customer SMS alerts, and staff notifications.
        </p>
      </div>

      <div className="bg-white border border-gray-200/90 rounded-3xl p-3 sm:p-4 shadow-2xs divide-y divide-gray-100">
        {[
          { key: 'emailAlerts', title: 'Daily Summary Email', desc: 'Receive end-of-day sales and job summary via email' },
          { key: 'smsReminders', title: 'Automated Customer SMS', desc: 'Send automated SMS to customer upon vehicle check-in & completion' },
          { key: 'pushNotifs', title: 'Technician Push Notifications', desc: 'Alert staff instantly when new jobs are assigned' },
          { key: 'jobComplete', title: 'Job Completion Alerts', desc: 'Notify supervisor when vehicle reaches Ready to Go stage' },
          { key: 'weeklyReport', title: 'Weekly Performance Report', desc: 'Receive weekly analytics and staff target summaries' },
        ].map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-4 hover:bg-gray-50/80 rounded-2xl transition-colors"
          >
            <div>
              <h3 className="text-sm font-extrabold text-gray-900">{item.title}</h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{item.desc}</p>
            </div>

            <button
              onClick={() => toggle(item.key)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                toggles[item.key] ? 'bg-black' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                  toggles[item.key] ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsSettings;
