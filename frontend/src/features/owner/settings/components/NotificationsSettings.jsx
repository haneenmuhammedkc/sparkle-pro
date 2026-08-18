import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import * as settingsService from '../services/settingsService';

const NotificationsSettings = () => {
  const [toggles, setToggles] = useState({
    emailAlerts: true,
    smsReminders: true,
    pushNotifs: true,
    jobComplete: true,
    weeklyReport: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const res = await settingsService.getSettings();
        if (isMounted && res.success && res.data && res.data.business) {
          const prefs = res.data.business.notificationPreferences;
          if (prefs) {
            setToggles({
              emailAlerts: prefs.emailAlerts !== undefined ? Boolean(prefs.emailAlerts) : true,
              smsReminders: prefs.smsReminders !== undefined ? Boolean(prefs.smsReminders) : true,
              pushNotifs: prefs.pushNotifs !== undefined ? Boolean(prefs.pushNotifs) : true,
              jobComplete: prefs.jobComplete !== undefined ? Boolean(prefs.jobComplete) : true,
              weeklyReport: prefs.weeklyReport !== undefined ? Boolean(prefs.weeklyReport) : false,
            });
          }
        }
      } catch (err) {
        if (isMounted) {
          setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load notification preferences' });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNotifications();
    return () => { isMounted = false; };
  }, []);

  const toggle = async (key) => {
    const nextToggles = { ...toggles, [key]: !toggles[key] };
    setToggles(nextToggles);
    setMessage(null);

    try {
      setSaving(true);
      const res = await settingsService.updateNotifications(nextToggles);
      if (res.success) {
        setMessage({ type: 'success', text: 'Notification preferences updated.' });
      }
    } catch (err) {
      setToggles(toggles); // Revert on error
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save notification preference' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
        <p className="text-xs text-gray-500 font-semibold">Loading notification preferences...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-900">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Notifications Preferences</h2>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
          Control notification channels for shop updates, customer SMS alerts, and staff notifications.
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
              type="button"
              disabled={saving}
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
