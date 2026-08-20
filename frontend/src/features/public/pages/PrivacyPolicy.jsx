import React from 'react';
import { ShieldCheck, Mail } from 'lucide-react';
import PublicPageLayout from '../components/PublicPageLayout';

const PrivacyPolicy = () => {
  const lastUpdated = 'August 20, 2026';

  return (
    <PublicPageLayout
      title="Privacy Policy"
      subtitle={`Last updated: ${lastUpdated}. Learn how SparklePro collects, uses, and safeguards your information.`}
      icon={ShieldCheck}
      activePage="privacy"
    >
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-6 sm:p-10 space-y-8 text-gray-700 text-sm sm:text-base leading-relaxed">
        {/* Section 1: Introduction */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            1. Introduction
          </h2>
          <p>
            Welcome to <strong>SparklePro</strong> ("we", "our", or "us"). SparklePro is an owner-centric workshop and car wash management SaaS platform designed to streamline vehicle check-ins, job workflow tracking, staff workload assignment, and business analytics for workshop operators.
          </p>
          <p>
            This Privacy Policy explains how we collect, use, disclose, and protect your information when you access or use our web applications, services, and public vehicle tracking interfaces (collectively, the "Service"). By creating an account or using SparklePro, you agree to the collection and use of information in accordance with this policy.
          </p>
        </section>

        {/* Section 2: Information We Collect */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            2. Information We Collect
          </h2>
          <p>
            We collect several types of information from and about users of our Service to provide, maintain, and improve workshop operations:
          </p>

          <div className="space-y-3 pl-4 border-l-2 border-gray-200">
            <div>
              <h3 className="font-semibold text-gray-900 text-base mb-1">
                A. Personal Information
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                When workshop owners register for an account, we collect personal identifiers such as your full name and email address.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 text-base mb-1">
                B. Account Information
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Includes login credentials (hashed passwords), authentication tokens (JSON Web Tokens and refresh token session hashes), email verification status, and security preferences.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 text-base mb-1">
                C. Business Information
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Information provided during workshop onboarding and setup, including business name, contact phone numbers, WhatsApp details, business address, operating hours, tax identification numbers, currency preferences, service catalog pricing, and bay configurations.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 text-base mb-1">
                D. Operational Data
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Customer records entered by workshop owners (names, phone numbers, vehicle registration numbers), staff operational records (names, phone numbers, technician roles), and job order details (service packages, workflow stages, estimated finish times, and payment transaction logs).
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 text-base mb-1">
                E. Usage & Technical Data
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Log data automatically sent by your browser, including IP address, user-agent string, operating system, browser type, pages viewed, timestamps, and performance telemetry.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: How We Use Information */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            3. How We Use Information
          </h2>
          <p>We use the collected information for the following operational purposes:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>To authenticate workshop owners and manage secure user sessions.</li>
            <li>To facilitate workshop onboarding, bay allocation, and service catalog management.</li>
            <li>To process vehicle service jobs, update workflow stages, and send real-time status updates to vehicle owners.</li>
            <li>To send security OTP codes for account verification and password resets.</li>
            <li>To generate aggregate revenue reports, customer visit trends, and staff workload analytics for workshop owners.</li>
            <li>To maintain rate limiting, detect fraud, prevent unauthorized access, and ensure platform security.</li>
            <li>To provide customer support and troubleshoot technical issues.</li>
          </ul>
        </section>

        {/* Section 4: How We Store and Protect Information */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            4. How We Store and Protect Information
          </h2>
          <p>
            We enforce industry-standard technical and organizational security measures to protect your data:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>
              <strong>Encryption:</strong> All data transmitted between your browser and our servers is encrypted using Transport Layer Security (TLS/HTTPS). User passwords are cryptographically hashed using salted <code>bcrypt</code> algorithms before storage.
            </li>
            <li>
              <strong>Session Security:</strong> Authentication is handled using secure HTTP-only cookies and JSON Web Tokens (JWT) with automatic refresh token rotation (RTR).
            </li>
            <li>
              <strong>Data Isolation:</strong> Business data and customer records are isolated at the database schema level using tenant identifiers (`businessId` and `ownerId`).
            </li>
          </ul>
        </section>

        {/* Section 5: Cookies and Similar Technologies */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            5. Cookies and Similar Technologies
          </h2>
          <p>
            SparklePro uses essential cookies and browser storage technologies strictly necessary for security and session management:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>
              <strong>Essential Authentication Cookies:</strong> Store encrypted refresh tokens to keep workshop owners securely signed in.
            </li>
            <li>
              <strong>Session Storage:</strong> Holds temporary state during multi-step business onboarding wizards.
            </li>
          </ul>
          <p className="text-xs text-gray-500">
            We do not use third-party tracking cookies or sell user data to advertising networks.
          </p>
        </section>

        {/* Section 6: Third-Party Services */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            6. Third-Party Services
          </h2>
          <p>
            We may integrate with trusted third-party service providers to deliver specific functionalities:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>
              <strong>Email Service Providers:</strong> Used to deliver transactional email verification codes and password reset OTPs.
            </li>
            <li>
              <strong>Messaging Interfaces:</strong> Facilitates generation of direct WhatsApp notification links for vehicle tracking updates.
            </li>
            <li>
              <strong>Cloud Hosting Infrastructure:</strong> Databases and backend application servers hosted on secure cloud platforms adhering to SOC 2 compliance.
            </li>
          </ul>
        </section>

        {/* Section 7: Data Sharing */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            7. Data Sharing
          </h2>
          <p>
            We do not sell, rent, or trade your personal or business data to third parties. We share data only under the following limited circumstances:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>
              <strong>Public Vehicle Tracking:</strong> Vehicle status details (plate number, service items, current workflow stage, estimated completion time) are accessible to customers via unique public tracking tokens (`/tracking/:token`).
            </li>
            <li>
              <strong>Legal Requirements:</strong> If required to do so by law or in response to valid requests by public authorities (e.g., a court order or subpoena).
            </li>
            <li>
              <strong>Business Operations:</strong> With third-party infrastructure vendors who act as data processors under strict confidentiality obligations.
            </li>
          </ul>
        </section>

        {/* Section 8: Data Retention */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            8. Data Retention
          </h2>
          <p>
            We retain owner account details, business settings, and job logs for as long as your account remains active. Operational security tokens (such as email OTPs and password reset codes) automatically expire and are purged from the database after their short TTL lifespan (e.g., 10–15 minutes).
          </p>
        </section>

        {/* Section 9: User Rights */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            9. User Rights
          </h2>
          <p>Depending on your jurisdiction, you possess the following data rights regarding your personal information:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Access & Export:</strong> Request a copy of your stored business profile and job history.</li>
            <li><strong>Correction:</strong> Update or correct inaccurate account or business profile information through the Settings menu.</li>
            <li><strong>Account Deletion:</strong> Request full closure of your workshop account and purge of associated records.</li>
          </ul>
        </section>

        {/* Section 10: Children's Privacy */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            10. Children's Privacy
          </h2>
          <p>
            SparklePro is a business management tool intended solely for use by adult business owners and legal entities. We do not knowingly collect personal information from individuals under the age of 18.
          </p>
        </section>

        {/* Section 11: Changes to This Privacy Policy */}
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            11. Changes to This Privacy Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in legal requirements or platform features. We will notify registered workshop owners of material updates by posting the updated policy on this page with a revised "Last updated" timestamp.
          </p>
        </section>

        {/* Section 12: Contact Us */}
        <section className="space-y-3 pt-4 border-t border-gray-100">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            12. Contact Us
          </h2>
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy or our data privacy practices, please contact our support team:
          </p>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 flex items-center gap-3 w-fit">
            <Mail className="w-5 h-5 text-gray-700 shrink-0" />
            <div className="text-xs sm:text-sm">
              <span className="font-semibold text-gray-900 block">SparklePro Support</span>
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

export default PrivacyPolicy;
