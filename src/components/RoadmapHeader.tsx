import React from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, CheckCircle2, Circle, Clock, ShieldCheck } from 'lucide-react';

export const RoadmapHeader: React.FC = () => {
  const { t } = useTranslation();

  const steps = [
    { step: 1, title: t('roadmap.step1Title'), desc: t('roadmap.step1Desc') },
    { step: 2, title: t('roadmap.step2Title'), desc: t('roadmap.step2Desc') },
    { step: 3, title: t('roadmap.step3Title'), desc: t('roadmap.step3Desc') },
    { step: 4, title: t('roadmap.step4Title'), desc: t('roadmap.step4Desc') },
    { step: 5, title: t('roadmap.step5Title'), desc: t('roadmap.step5Desc') },
  ];

  return (
    <header className="bg-white border-b border-slate-200">
      {/* Top Banner */}
      <div className="bg-emerald-950 text-white px-4 py-2.5 text-xs sm:text-sm font-medium">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-semibold text-emerald-200 shrink-0">{t('roadmap.bannerTitle')}</span>
            <span className="truncate">{t('roadmap.bannerText')}</span>
          </div>
          <span className="bg-emerald-900 text-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 hidden md:inline-block border border-emerald-800">
            {t('common.stepDelivered')}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{t('common.appName')} {t('common.appTagline')}</h1>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> {t('common.hipaaCompliant')}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {t('common.portalTitle')} • {t('common.portalSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700">
              <span className="text-slate-400 font-mono block text-[9px] uppercase">{t('roles.client')}</span>
              <span className="font-semibold">{t('roadmap.clientPortalBadge')}</span>
            </div>
            <div className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700">
              <span className="text-slate-400 font-mono block text-[9px] uppercase">{t('roles.specialist')}</span>
              <span className="font-semibold">{t('roadmap.specialistPortalBadge')}</span>
            </div>
            <div className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700">
              <span className="text-slate-400 font-mono block text-[9px] uppercase">{t('roles.admin')}</span>
              <span className="font-semibold text-purple-700">{t('roadmap.adminPortalBadge')}</span>
            </div>
          </div>
        </div>

        {/* 5-Step Progress Tracker */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t('roadmap.deliveryRoadmap')}</span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {t('roadmap.stepOf')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {steps.map((item) => {
              const isCompleted = item.step <= 4;
              const isCurrent = item.step === 4;
              return (
                <div
                  key={item.step}
                  className={`p-2.5 rounded-lg border transition-all ${
                    isCurrent
                      ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                      : isCompleted
                      ? 'bg-slate-50 border-emerald-200'
                      : 'bg-white border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : item.step === 5 ? (
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    )}
                    <span className={`text-[11px] font-bold ${isCurrent ? 'text-emerald-950' : 'text-slate-700'}`}>
                      {t('common.stepDelivered')} {item.step}: {item.title}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
