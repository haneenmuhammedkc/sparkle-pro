import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  UserCheck,
  Building2,
  Users,
  Briefcase,
  ShieldCheck,
  CreditCard,
  KeyRound,
  Wrench,
  Sparkles,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicPageLayout from '../components/PublicPageLayout';

const Help = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Help Topics / Categories
  const categories = [
    { id: 'All', label: 'All Topics', icon: Sparkles },
    { id: 'Getting Started', label: 'Getting Started', icon: UserCheck },
    { id: 'Account & Profile', label: 'Account & Profile', icon: KeyRound },
    { id: 'Business Setup', label: 'Business Setup', icon: Building2 },
    { id: 'Customer Management', label: 'Customer Management', icon: Users },
    { id: 'Staff Management', label: 'Staff Management', icon: Briefcase },
    { id: 'Job Management', label: 'Job Management', icon: Wrench },
    { id: 'Billing & Subscription', label: 'Billing & Subscription', icon: CreditCard },
    { id: 'Security & Password', label: 'Security & Password', icon: ShieldCheck },
    { id: 'Troubleshooting', label: 'Troubleshooting', icon: HelpCircle },
  ];

  // Frequently Asked Questions reflecting ACTUAL SparklePro capabilities
  const faqs = [
    {
      category: 'Getting Started',
      question: 'How do I create a SparklePro account?',
      answer:
        'To create an owner account, go to the Sign Up page (/register), fill in your Full Name, Email Address, and Password, accept the Terms & Privacy Policy, and click "Create Free Account". You will then receive a 6-digit email verification OTP to activate your account.',
    },
    {
      category: 'Security & Password',
      question: 'How do I verify my email?',
      answer:
        'Upon signing up, SparklePro dispatches a 6-digit verification code to your email address. Enter this code on the /verify-email screen within 10 minutes. If the code expires, you can click "Resend Code" to receive a new one.',
    },
    {
      category: 'Security & Password',
      question: 'How do I reset my password?',
      answer:
        'If you forgot your password, click "Forgot Password?" on the Sign In page or navigate to /forgot-password. Enter your account email address to receive a 6-digit recovery code. Verify the code on /forgot-password/verify, then enter your new strong password on /reset-password.',
    },
    {
      category: 'Business Setup',
      question: 'How do I set up my business profile and workshop configuration?',
      answer:
        'After verifying your email, you will be guided through the SparklePro Business Onboarding Wizard (/setup/business). Here you configure your workshop name, logo, contact details, operating hours, weekly holidays, tax rates, currency, bay allocations, and service pricing rules.',
    },
    {
      category: 'Customer Management',
      question: 'How do I add customers to SparklePro?',
      answer:
        'Customers are automatically created and saved to your Customer Directory whenever you check in a new job for a customer. You can also view, search, and filter your customer records, visit histories, and total spent under the Customers section (/customers) in the owner dashboard.',
    },
    {
      category: 'Staff Management',
      question: 'How do I add staff members?',
      answer:
        'Navigate to the Staff section (/staff) in your dashboard and click "Add Staff Member". Enter their name, phone number, and technician designation. Note that staff members exist as operational records for job assignment and workload monitoring—they do not have separate portal login credentials.',
    },
    {
      category: 'Job Management',
      question: 'How do I manage jobs and workflow status?',
      answer:
        'Create new service jobs via /new-job by entering customer details, selecting vehicle category (2-wheeler, 4-wheeler, etc.), and selecting configured services. Each job receives a unique Job ID (e.g. SPK-1001) and tracking token. You can update job status (Pending → In Progress → Ready → Completed) and workflow steps (Wait → Wash → Interior → QC → Ready) directly from the Jobs board.',
    },
    {
      category: 'Troubleshooting',
      question: 'What should I do if I cannot sign in to my account?',
      answer:
        'First, verify that your email address and password are typed correctly. If your account email has not been verified yet, the system will redirect you to the email verification screen. If you have lost your password, use the "Forgot Password?" recovery workflow.',
    },
    {
      category: 'Account & Profile',
      question: 'Does SparklePro support Google Sign-In?',
      answer:
        'Yes! On the Login and Registration screens, you can click "Continue with Google" to streamline authentication using your Google Account.',
    },
    {
      category: 'Troubleshooting',
      question: 'How do vehicle owners track their wash progress?',
      answer:
        'When a job is created, a unique tracking token is generated. Vehicle owners can monitor live progress on the public tracking portal (/tracking/:token or /track) without needing to register or create an account.',
    },
    {
      category: 'Troubleshooting',
      question: 'How do I contact support for technical assistance?',
      answer:
        'You can reach our dedicated support team directly by emailing support@sparklepro.com. Our support representatives typically respond within 24 business hours.',
    },
  ];

  // Filter FAQs based on Search Query and Selected Category
  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory =
      selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <PublicPageLayout
      title="How can we help?"
      subtitle="Search for answers, browse help topics, or contact our support team."
      icon={HelpCircle}
      activePage="help"
    >
      <div className="space-y-8">
        {/* Search Bar Container */}
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search help topics, questions, features (e.g. password, jobs, staff)..."
            className="w-full bg-white border border-gray-300 rounded-2xl py-4 pl-12 pr-4 text-gray-900 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600 bg-gray-100 px-2 py-1 rounded-md"
            >
              Clear
            </button>
          )}
        </div>

        {/* Common Help Topics / Category Pills */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center">
            Help Topics
          </h2>
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-black text-white shadow-xs'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5 shrink-0" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQs Accordion List */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <span className="text-xs text-gray-400 font-medium">
              Showing {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <HelpCircle className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-gray-500 font-medium text-sm">
                No matching answers found for "{searchQuery}".
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="text-xs font-semibold text-black underline hover:text-gray-700"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredFaqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div key={index} className="py-4 first:pt-0 last:pb-0">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between text-left gap-4 group focus:outline-none"
                    >
                      <span className="font-semibold text-gray-900 group-hover:text-black text-sm sm:text-base leading-snug">
                        {faq.question}
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-gray-200 shrink-0 transition-colors">
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                        <p>{faq.answer}</p>
                        <div className="mt-2 text-[11px] text-gray-400 font-medium flex items-center gap-1.5">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                          <span>Category: {faq.category}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Still Need Help / Contact Support Box */}
        <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl p-6 sm:p-8 space-y-4 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gray-300" />
                <h3 className="text-lg font-bold text-white">Still need help?</h3>
              </div>
              <p className="text-gray-300 text-xs sm:text-sm">
                Can't find the answer you're looking for? Reach out to our technical support team.
              </p>
            </div>

            <a
              href="mailto:support@sparklepro.com"
              className="inline-flex items-center gap-2 bg-white text-black font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl hover:bg-gray-100 transition-all shrink-0 shadow-xs"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Support</span>
            </a>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
};

export default Help;
