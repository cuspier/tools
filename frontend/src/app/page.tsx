"use client";

import Link from 'next/link';
import { FileUp, Scissors, FilePlus2, RefreshCw, Type, Image as ImageIcon, FileText } from 'lucide-react';
import { Header } from '../components/Header';
import { useTranslation } from '../hooks/useTranslation';

export default function Home() {
  const { t } = useTranslation();

  const tools = [
    {
      title: t('tools.merge.title'),
      description: t('tools.merge.description'),
      icon: FilePlus2,
      href: '/merge',
      color: 'bg-blue-500',
    },
    {
      title: t('tools.split.title'),
      description: t('tools.split.description'),
      icon: Scissors,
      href: '/split',
      color: 'bg-green-500',
    },
    {
      title: t('tools.rotate.title'),
      description: t('tools.rotate.description'),
      icon: RefreshCw,
      href: '/rotate',
      color: 'bg-yellow-500',
    },
    {
      title: t('tools.watermark.title'),
      description: t('tools.watermark.description'),
      icon: Type,
      href: '/watermark',
      color: 'bg-purple-500',
    },
    {
      title: t('tools.edit.title'),
      description: t('tools.edit.description'),
      icon: FileUp,
      href: '/edit',
      color: 'bg-red-500',
    },
    {
      title: t('tools.ocr.title'),
      description: t('tools.ocr.description'),
      icon: ImageIcon,
      href: '/ocr',
      color: 'bg-indigo-500',
    },
    {
      title: t('tools.convert.title'),
      description: t('tools.convert.description'),
      icon: FileText,
      href: '/convert',
      color: 'bg-orange-500',
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-200">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-gray-900">
            {t('home.heroTitle')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('home.heroSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="group flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all duration-300">
              <div className={`p-4 rounded-full text-white mb-6 ${tool.color} group-hover:scale-110 transition-transform duration-300`}>
                <tool.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{tool.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{tool.description}</p>
            </Link>
          ))}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-24 py-12 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} LocalPDF. {t('common.privacyNotice')}</p>
      </footer>
    </div>
  );
}
