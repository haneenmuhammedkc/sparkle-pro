import React, { useState } from 'react';
import { HelpCircle, ChevronDown, MessageSquare, Send, Search } from 'lucide-react';

const FAQS = [
  { q: 'How do I create and assign a new job to a technician?', a: 'Click the "+ New Job" button in the header or dashboard, fill in vehicle and service details, select a technician under "Assign Staff", and click "Create Job Card".' },
  { q: 'How do multi-vehicle service prices work?', a: 'Under Settings > Services Management, you can set individual pricing and estimated durations for Cars, Bikes, SUVs, and Trucks for each service package.' },
  { q: 'Can I track monthly sales growth and compare with previous months?', a: 'Yes! Go to Settings > Reports & Analytics to view Month-over-Month sales comparison graphs, weekly/monthly customer counts, and staff targets.' },
  { q: 'How do I add or edit staff members and their roles?', a: 'Navigate to Staff Management to view all staff members, update roles, assign monthly job targets, or click "+ Add Staff" to register a new member.' },
  { q: 'What features are included in the ₹1,499 Professional Plan?', a: 'Unlimited active jobs & routing, advanced customer analytics, up to 20 staff members, automated invoicing & billing, and 24/7 priority support.' },
  { q: 'How do I export weekly or monthly data backups?', a: 'Navigate to Settings > Backup & Data to download Weekly CSV, Monthly CSV, or Yearly JSON database archives.' },
  { q: 'How do I update customer details or view their visit history?', a: 'Go to Customers section, find the customer card, and click "View Details" to see active service progress, past history, and vehicle profile.' },
  { q: 'Can I customize daily vehicle capacity limits?', a: 'Yes, visit Settings > Workshop Settings and adjust the Daily Vehicle Capacity slider (e.g. 30 vehicles/day).' },
  { q: 'How do notifications work across the admin panel?', a: 'Click the Bell icon on any page header to open the Notifications feed, or configure alert toggles under Settings > Notifications.' },
  { q: 'Is there a confirmation before logging out?', a: 'Yes, whenever you click Logout in the sidebar or settings page, a confirmation dialog prompts you to confirm before logging out.' },
];

const HelpSupport = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-gray-900">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Help & Customer Support</h2>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
          Find answers to common platform questions or submit a ticket to AutoFlow Ops support.
        </p>
      </div>

      {/* FAQ Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search frequently asked questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black shadow-2xs"
        />
      </div>

      {/* FAQ ACCORDION LIST */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-4 shadow-2xs space-y-2">
        <h3 className="text-sm font-extrabold text-gray-900 px-2 py-1 uppercase tracking-wider">
          Frequently Asked Questions ({filteredFaqs.length})
        </h3>

        {filteredFaqs.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div key={idx} className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/70">
              <button
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left font-extrabold text-xs sm:text-sm text-gray-900 hover:bg-gray-100/70 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs text-gray-600 font-medium leading-relaxed border-t border-gray-100 bg-white">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contact Support Ticket Form */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
        <h3 className="text-base font-extrabold text-gray-900">Submit a Support Ticket</h3>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-3.5">
          <input
            type="text"
            placeholder="Subject / Issue Title"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <textarea
            rows={3}
            placeholder="Describe your issue or query..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-sm transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            Send Ticket Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default HelpSupport;
