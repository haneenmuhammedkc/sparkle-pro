import React from 'react';
import { FileText, Mail } from 'lucide-react';
import PublicPageLayout from '../components/PublicPageLayout';

const TermsOfService = () => {
  const lastUpdated = 'August 20, 2026';

  return (
    <PublicPageLayout
      title="Terms of Service"
      subtitle={`Last updated: ${lastUpdated}. Please read these terms carefully before using SparklePro.`}
      icon={FileText}
      activePage="terms"
    >
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-6 sm:p-10 space-y-8 text-gray-700 text-sm sm:text-base leading-relaxed">
        {/* Section 1: Introduction */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            1. Introduction
          </h2>
          <p>
            These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "Owner", or "you") and <strong>SparklePro</strong> ("we", "us", or "our") governing your access to and use of the SparklePro workshop management software, website, and related digital services (the "Service").
          </p>
          <p>
            By creating an account, clicking "Create Free Account", or accessing the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, you must not access or use the Service.
          </p>
        </section>

        {/* Section 2: Eligibility */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            2. Eligibility
          </h2>
          <p>
            You must be at least 18 years of age (or the legal age of majority in your jurisdiction) and possess the legal authority to enter into binding contracts to register for and use SparklePro. If you register an account on behalf of a company, car wash, or detailing workshop entity, you represent and warrant that you have the authority to bind that legal entity to these Terms.
          </p>
        </section>

        {/* Section 3: Account Registration */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            3. Account Registration
          </h2>
          <p>
            To use SparklePro as a workshop operator, you must register for an account by providing accurate, current, and complete information, including your full name and a valid email address. You agree to complete mandatory email verification via the 6-digit One-Time Password (OTP) sent to your registered email.
          </p>
        </section>

        {/* Section 4: Account Responsibilities */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            4. Account Responsibilities
          </h2>
          <p>
            You are sole administrator of your SparklePro account. You are responsible for maintaining the confidentiality of your account credentials (password and login session tokens) and for all activities that occur under your account. You agree to notify us immediately of any unauthorized access or security breach.
          </p>
        </section>

        {/* Section 5: Free Trial */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            5. Free Trial
          </h2>
          <p>
            SparklePro may offer new workshop accounts a 14-day or 30-day free trial period upon initial account setup. The free trial grants full access to workshop onboarding, job tracking, staff workload assignment, and business settings. Upon expiration of the free trial period, continued access may require selection of an active subscription plan.
          </p>
        </section>

        {/* Section 6: Subscription and Billing */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            6. Subscription and Billing
          </h2>
          <p>
            SparklePro provides SaaS subscription plans billed on a recurring monthly or annual basis. Fees are charged according to the selected plan pricing displayed in your account settings. All fees are non-refundable except as required by law or explicitly stated in writing. SparklePro allows workshop owners to record manual payments received from vehicle customers (Cash, UPI, Card, POS), but does not process customer funds directly unless stated otherwise.
          </p>
        </section>

        {/* Section 7: Acceptable Use */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            7. Acceptable Use
          </h2>
          <p>You agree not to misuse the Service. Specifically, you agree not to:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Reverse engineer, decompile, or attempt to extract the source code of the Service.</li>
            <li>Bypass or attempt to bypass security rate limiters or authentication mechanisms.</li>
            <li>Use the Service to transmit spam, fraudulent tracking links, or malicious code.</li>
            <li>Upload false customer records, improper vehicle data, or illegal content.</li>
            <li>Interfere with or disrupt the integrity or performance of the Service or cloud infrastructure.</li>
          </ul>
        </section>

        {/* Section 8: Business and Customer Data */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            8. Business and Customer Data
          </h2>
          <p>
            You retain full ownership of all workshop data, staff records, customer contact information, and job history entered into your SparklePro account ("User Data"). You grant SparklePro a limited, non-exclusive license to host, process, and display User Data solely to provide and maintain the Service for your workshop.
          </p>
        </section>

        {/* Section 9: Intellectual Property */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            9. Intellectual Property
          </h2>
          <p>
            The Service, including software code, UI design, logos, brand identity, trademarks, graphics, and documentation, is the exclusive property of SparklePro and its licensors. Except for the limited right to access the Service in accordance with these Terms, no ownership rights are transferred to you.
          </p>
        </section>

        {/* Section 10: Third-Party Services */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            10. Third-Party Services
          </h2>
          <p>
            SparklePro may facilitate interactions with third-party tools, such as direct WhatsApp link triggers for sending vehicle tracking updates to customers. We are not responsible for the performance, terms, or availability of third-party platforms.
          </p>
        </section>

        {/* Section 11: Service Availability */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            11. Service Availability
          </h2>
          <p>
            We strive to maintain maximum uptime and platform reliability. However, the Service is provided on an "as available" basis. Scheduled maintenance, emergency server updates, or network outages may temporarily restrict access.
          </p>
        </section>

        {/* Section 12: Disclaimer of Warranties */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            12. Disclaimer
          </h2>
          <p className="uppercase text-xs tracking-wider text-gray-500 font-semibold">
            Provided "As Is"
          </p>
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
          </p>
        </section>

        {/* Section 13: Limitation of Liability */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            13. Limitation of Liability
          </h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, SPARKLEPRO AND ITS OFFICERS, DIRECTORS, AND EMPLOYEES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE.
          </p>
        </section>

        {/* Section 14: Account Suspension or Termination */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            14. Account Suspension or Termination
          </h2>
          <p>
            We reserve the right to suspend or terminate your access to the Service at any time, with or without notice, if we determine that you have violated these Terms, engaged in fraudulent activity, or posed a security risk to the platform. You may cancel your account at any time via Settings.
          </p>
        </section>

        {/* Section 15: Changes to the Service */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            15. Changes to the Service
          </h2>
          <p>
            We reserve the right to modify, enhance, or discontinue features of the Service at any time. We will endeavor to notify users of major updates or deprecated functionalities that impact workshop operations.
          </p>
        </section>

        {/* Section 16: Changes to These Terms */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            16. Changes to These Terms
          </h2>
          <p>
            We may update these Terms periodically. Revised Terms will be posted on this page with an updated "Last updated" date. Continued use of SparklePro after changes are posted constitutes your acceptance of the revised Terms.
          </p>
        </section>

        {/* Section 17: Governing Law */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            17. Governing Law
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with applicable laws, without regard to its conflict of law principles. Any legal suit or proceeding arising out of these Terms shall be instituted exclusively in competent courts.
          </p>
        </section>

        {/* Section 18: Contact Information */}
        <section className="space-y-3 pt-4 border-t border-gray-100">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            18. Contact Information
          </h2>
          <p>
            For any legal inquiries or questions regarding these Terms of Service, please reach out to our legal support team:
          </p>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 flex items-center gap-3 w-fit">
            <Mail className="w-5 h-5 text-gray-700 shrink-0" />
            <div className="text-xs sm:text-sm">
              <span className="font-semibold text-gray-900 block">SparklePro Legal Team</span>
              <a href="mailto:support@sparklepro.com" className="text-gray-600 hover:text-black font-medium underline">
                support@sparklepro.com
              </a>
            </div>
          </div>
        </section>
      </div>
    </PublicPageLayout>
  );
};

export default TermsOfService;
