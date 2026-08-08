import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Clock,
  BarChart2,
  Award,
  ArrowRight,
  Calendar,
  ClipboardList,
  UserCheck,
  TrendingUp,
  CheckCircle2,
  Truck,
  Info,
  Check,
} from 'lucide-react';

export default function WelcomePage({ onSetUp, onSkip, onContactSupport }) {
  const [selectedMobileCard, setSelectedMobileCard] = useState(3);

  // Mobile feature cards data
  const mobileFeatures = [
    {
      id: 0,
      icon: Users,
      title: 'Unlimited Customers',
      description: 'Manage an infinite client database easily.',
      highlighted: false,
    },
    {
      id: 1,
      icon: Clock,
      title: 'Smart Scheduling',
      description: 'Optimize your daily appointments.',
      highlighted: false,
    },
    {
      id: 2,
      icon: BarChart2,
      title: 'Business Analytics',
      description: 'Track revenue and growth metrics.',
      highlighted: false,
    },
    {
      id: 3,
      icon: Award,
      title: '30-Day Free Trial',
      description: 'Experience all premium features risk-free.',
      highlighted: true,
      badgeText: 'Highlighted',
    },
  ];

  // Tablet grid features data
  const tabletFeatures = [
    {
      icon: Users,
      title: 'Unlimited Customers',
      description: 'Manage an infinite database of clients with detailed profiles and history.',
    },
    {
      icon: ClipboardList,
      title: 'Unlimited Job Cards',
      description: 'Create, assign, and track as many service tickets as your business needs.',
    },
    {
      icon: UserCheck,
      title: 'Staff Management',
      description: 'Organize your team, track performance, and manage schedules easily.',
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Business Dashboard',
      description: 'Gain instant insights into revenue, active jobs, and daily operations.',
    },
  ];

  // Laptop grid features data
  const laptopFeatures = [
    {
      icon: Users,
      title: 'Unlimited Customers',
      description: 'Manage your entire client base without restrictions.',
    },
    {
      icon: ClipboardList,
      title: 'Unlimited Job Cards',
      description: 'Create and track endless service requests.',
    },
    {
      icon: UserCheck,
      title: 'Staff Management',
      description: 'Assign roles and monitor performance easily.',
    },
    {
      icon: Truck,
      title: 'Live Vehicle Tracking',
      description: 'Know exactly where every car is in the process.',
    },
  ];

  // Checklist items
  const trialChecklist = [
    'Customers',
    'Vehicles',
    'Jobs',
    'Dashboard',
    'Staff',
    'Tracking',
    'Reports',
    'Admin',
    'Backup',
    'Support',
  ];

  // Animation variants
  const fadeInVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900 antialiased selection:bg-gray-200">
      {/* =========================================================================
          1. MOBILE VIEW (< 768px)
          Exact match to image 1
         ========================================================================= */}
      <div className="flex md:hidden min-h-screen items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Top Tag */}
          <motion.div variants={fadeInVariants} className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-100/90 border border-gray-200/60 text-xs font-semibold text-gray-700 shadow-2xs">
              👋 Welcome to SparklePro
            </span>
          </motion.div>

          {/* Heading */}
          <motion.div variants={fadeInVariants} className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2 tracking-tight">
              Welcome! Let's Set Up Your Car Wash
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Get ready to manage your business seamlessly.
            </p>
          </motion.div>

          {/* Feature List */}
          <div className="w-full space-y-3 mb-6">
            {mobileFeatures.map((feature) => {
              const Icon = feature.icon;
              const isSelected = selectedMobileCard === feature.id;

              return (
                <motion.div
                  key={feature.id}
                  variants={fadeInVariants}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedMobileCard(feature.id)}
                  className={`relative cursor-pointer rounded-2xl p-4 transition-all duration-200 flex items-start gap-4 border ${
                    feature.highlighted
                      ? 'border-indigo-200/80 bg-slate-50/70 shadow-2xs'
                      : isSelected
                      ? 'border-gray-300 bg-gray-50/80'
                      : 'border-gray-200/80 bg-white hover:border-gray-300'
                  }`}
                >
                  {feature.highlighted && (
                    <span className="absolute top-0 right-0 bg-black text-white text-[10px] font-semibold px-2.5 py-1 rounded-bl-xl rounded-tr-xl">
                      {feature.badgeText || 'Highlighted'}
                    </span>
                  )}

                  <div className="mt-0.5 p-1 text-gray-900 flex-shrink-0">
                    <Icon className="w-5 h-5 stroke-[1.8]" />
                  </div>

                  <div className="flex-1 pr-12">
                    <h3 className="text-base font-semibold text-gray-900 mb-0.5 leading-snug">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-normal">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <motion.button
            variants={fadeInVariants}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSetUp}
            className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3.5 px-6 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer mb-3 transition-colors"
          >
            <span>Set Up My Business</span>
            <ArrowRight className="w-4 h-4 stroke-[2.2]" />
          </motion.button>

          <motion.button
            variants={fadeInVariants}
            onClick={onSkip}
            className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors py-1 cursor-pointer"
          >
            Skip for Now
          </motion.button>
        </motion.div>
      </div>

      {/* =========================================================================
          2. TABLET VIEW (768px - 1023px)
          Exact match to image 2
         ========================================================================= */}
      <div className="hidden md:flex lg:hidden min-h-screen items-center justify-center p-6 sm:p-10">
        <motion.div
          className="w-full max-w-2xl bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Top Tag & Header */}
          <motion.div variants={fadeInVariants} className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-100/90 border border-gray-200/60 text-xs font-semibold text-gray-700 mb-4 shadow-2xs">
              👋 Welcome to SparklePro
            </span>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
              Welcome! Let's Set Up Your Car Wash.
            </h1>
            <p className="text-sm text-gray-500 font-medium max-w-lg mx-auto">
              Your 30-Day Free Trial has been activated. Experience every premium feature with no limitations.
            </p>
          </motion.div>

          {/* Trial Banner */}
          <motion.div
            variants={fadeInVariants}
            className="bg-gray-50/80 border border-gray-200/70 rounded-2xl p-4 sm:p-5 flex items-start gap-4 mb-5"
          >
            <div className="p-2.5 bg-white border border-gray-200/60 rounded-xl text-gray-900 shadow-2xs">
              <Calendar className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold text-gray-900">30-Day Free Trial</h3>
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
                  Trial Active
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Starts Today • Ends On: 04 September 2026
              </p>
            </div>
          </motion.div>

          {/* 2x2 Feature Grid */}
          <motion.div variants={fadeInVariants} className="grid grid-cols-2 gap-4 mb-5">
            {tabletFeatures.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-white border border-gray-200/80 rounded-2xl p-5 hover:border-gray-300 transition-all shadow-2xs flex flex-col items-start"
                >
                  <div className="w-9 h-9 rounded-full bg-indigo-50/80 flex items-center justify-center text-indigo-600 mb-3">
                    <Icon className="w-4 h-4 stroke-[2]" />
                  </div>
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </motion.div>

          {/* Included During Trial Box */}
          <motion.div
            variants={fadeInVariants}
            className="bg-gray-50/70 border border-gray-200/70 rounded-2xl p-5 mb-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-3 tracking-tight">
              Included During Trial
            </h3>
            <div className="grid grid-cols-5 gap-y-3 gap-x-2">
              {trialChecklist.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-gray-900 flex-shrink-0 stroke-[2]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Time & Setup Action */}
          <motion.div variants={fadeInVariants} className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-3">
              <Clock className="w-3.5 h-3.5" />
              <span>Estimated Setup Time: Less than 2 Minutes</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSetUp}
              className="w-full max-w-xs bg-black hover:bg-gray-800 text-white font-semibold py-3.5 px-6 rounded-xl text-sm transition shadow-sm cursor-pointer mx-auto block mb-3"
            >
              Set Up My Business
            </motion.button>

            <button
              onClick={onSkip}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition cursor-pointer mb-6"
            >
              Skip for Now
            </button>
          </motion.div>

          <hr className="border-gray-200 mb-4" />

          {/* Support Footer */}
          <motion.p variants={fadeInVariants} className="text-center text-xs text-gray-500 font-medium">
            Need Help? Our onboarding team is ready to help you get started.{' '}
            <button
              onClick={onContactSupport}
              className="font-bold text-gray-900 underline hover:text-black cursor-pointer"
            >
              Contact Support
            </button>
          </motion.p>
        </motion.div>
      </div>

      {/* =========================================================================
          3. LAPTOP / DESKTOP VIEW (≥ 1024px)
          Exact match to image 3
         ========================================================================= */}
      <div className="hidden lg:flex min-h-screen bg-white">
        {/* Left Hero Section (Light Gray Angle Background) */}
        <div className="w-[45%] bg-gradient-to-br from-gray-50 via-gray-100/70 to-gray-50 p-12 xl:p-16 flex flex-col justify-between border-r border-gray-100 relative overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white border border-gray-200/80 text-xs font-semibold text-gray-700 mb-8 shadow-2xs">
              👋 Welcome to SparklePro
            </span>

            <h1 className="text-4xl xl:text-5xl font-extrabold text-gray-900 leading-[1.15] tracking-tight mb-4">
              Welcome! Let's Set Up Your Car Wash.
            </h1>

            <p className="text-gray-500 text-sm xl:text-base leading-relaxed max-w-md font-medium">
              You're only steps away from managing your workshop with a modern, cloud-based platform. Finish your setup to access your personalized dashboard.
            </p>
          </motion.div>

          {/* Activated Trial Overlay Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative z-10 bg-white/90 backdrop-blur-md border border-gray-200/90 rounded-2xl p-5 shadow-sm mt-8"
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-gray-900">30-Day Free Trial</h3>
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mb-4">Activated Successfully</p>

            <hr className="border-gray-200/70 mb-4" />

            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              Includes Access To:
            </span>

            <div className="grid grid-cols-3 gap-y-2 gap-x-1">
              {trialChecklist.slice(0, 9).map((item, idx) => (
                <div key={idx} className="flex items-center gap-1 text-xs text-gray-600 font-medium">
                  <Check className="w-3.5 h-3.5 text-gray-700 stroke-[2.5]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Content Section */}
        <div className="w-[55%] p-12 xl:p-20 flex flex-col justify-center bg-white">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-lg mx-auto w-full"
          >
            {/* 2x2 Feature Grid */}
            <motion.div variants={fadeInVariants} className="grid grid-cols-2 gap-5 mb-6">
              {laptopFeatures.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="bg-white border border-gray-200/80 rounded-2xl p-5 hover:border-gray-300 transition-all shadow-2xs flex flex-col items-start"
                  >
                    <div className="p-2.5 bg-gray-100/80 rounded-xl text-gray-900 mb-3">
                      <Icon className="w-4 h-4 stroke-[2]" />
                    </div>
                    <h4 className="text-base font-semibold text-gray-900 mb-1 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </motion.div>

            {/* Info Box */}
            <motion.div
              variants={fadeInVariants}
              className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-4 flex items-start gap-3 mb-8"
            >
              <Info className="w-5 h-5 text-gray-700 stroke-[1.8] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-gray-600 font-medium leading-relaxed">
                <span className="font-semibold text-gray-900">
                  Estimated Setup Time: Less than 2 Minutes.
                </span>{' '}
                Everything can be changed later from Settings.
              </div>
            </motion.div>

            {/* Action Row */}
            <motion.div variants={fadeInVariants} className="flex items-center gap-6">
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onClick={onSetUp}
                className="bg-black hover:bg-gray-800 text-white font-semibold py-3.5 px-8 rounded-xl text-sm transition shadow-sm cursor-pointer"
              >
                Set Up My Business
              </motion.button>

              <button
                onClick={onSkip}
                className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition cursor-pointer"
              >
                Skip for Now
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}