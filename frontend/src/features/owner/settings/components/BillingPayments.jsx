import React from 'react';
import { CheckCircle2, Download, CreditCard, ShieldCheck } from 'lucide-react';

const BillingPayments = () => {
  return (
    <div className="space-y-6 text-gray-900">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Billing & Payments</h2>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
          Manage your subscription plan, invoices, and shop payment methods.
        </p>
      </div>

      {/* MATCHING EXACT DESIGN IMAGE PROVIDED BY USER */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6 max-w-md mx-auto lg:mx-0">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Professional Plan</h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
            Most Popular
          </span>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">₹1,499</span>
          <span className="text-sm font-semibold text-gray-500">/ month</span>
        </div>

        <div className="pt-2 border-t border-gray-100 space-y-3.5 text-xs sm:text-sm font-semibold text-gray-800">
          {[
            'Unlimited active jobs & routing',
            'Advanced customer analytics',
            'Up to 20 staff members',
            'Automated invoicing & billing',
            '24/7 Priority support',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-white shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <div className="pt-2 space-y-2.5 text-center">
          <button className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 px-4 rounded-2xl text-sm transition-all shadow-sm active:scale-98">
            Start 30-Day Free Trial
          </button>
          <p className="text-xs text-gray-400 font-semibold">No credit card required. Cancel anytime.</p>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
        <h3 className="text-base font-extrabold text-gray-900">Recent Invoice Statements</h3>

        <div className="space-y-3">
          {[
            { id: 'INV-2023-009', date: 'Oct 01, 2023', amount: '₹1,499.00', status: 'Paid' },
            { id: 'INV-2023-008', date: 'Sep 01, 2023', amount: '₹1,499.00', status: 'Paid' },
            { id: 'INV-2023-007', date: 'Aug 01, 2023', amount: '₹1,499.00', status: 'Paid' },
          ].map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200/80 rounded-2xl text-xs sm:text-sm font-semibold"
            >
              <div>
                <span className="block text-gray-900 font-bold">{inv.id} • {inv.date}</span>
                <span className="text-xs text-gray-600 font-bold">{inv.status}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-900 font-extrabold">{inv.amount}</span>
                <button className="p-2 text-gray-500 hover:text-black bg-white rounded-xl border border-gray-200 shadow-2xs">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BillingPayments;
