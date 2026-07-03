"use client";

import React from 'react';
import Link from 'next/link';
import { FileUp, Scissors, FilePlus2, RefreshCw, Type, Image as ImageIcon, FileText, Camera } from 'lucide-react';
import { Header } from '@/components/Header';
import { useTranslation } from '@/hooks/useTranslation';

const pdfToolsConfig = [
  {
    titleKey: 'tools.merge.title',
    descriptionKey: 'tools.merge.description',
    icon: FilePlus2,
    href: '/merge',
    color: 'bg-blue-500',
  },
  {
    titleKey: 'tools.split.title',
    descriptionKey: 'tools.split.description',
    icon: Scissors,
    href: '/split',
    color: 'bg-green-500',
  },
  {
    titleKey: 'tools.rotate.title',
    descriptionKey: 'tools.rotate.description',
    icon: RefreshCw,
    href: '/rotate',
    color: 'bg-yellow-500',
  },
  {
    titleKey: 'tools.watermark.title',
    descriptionKey: 'tools.watermark.description',
    icon: Type,
    href: '/watermark',
    color: 'bg-purple-500',
  },
  {
    titleKey: 'tools.edit.title',
    descriptionKey: 'tools.edit.description',
    icon: FileUp,
    href: '/edit',
    color: 'bg-red-500',
  },
  {
    titleKey: 'tools.ocr.title',
    descriptionKey: 'tools.ocr.description',
    icon: ImageIcon,
    href: '/ocr',
    color: 'bg-indigo-500',
  },
  {
    titleKey: 'tools.convert.title',
    descriptionKey: 'tools.convert.description',
    icon: FileText,
    href: '/convert',
    color: 'bg-orange-500',
  },
];

const imageToolsConfig = [
  {
    titleKey: 'tools.idPhoto.title',
    descriptionKey: 'tools.idPhoto.description',
    icon: Camera,
    href: '/id-photo',
    color: 'bg-rose-500',
  },
];

interface ToolItem {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  color: string;
}

function ToolGrid({ tools }: { tools: ToolItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {tools.map((tool) => (
        <Link
          key={tool.href}
          href={tool.href}
          className="group flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all duration-300"
        >
          <div className={`p-4 rounded-full text-white mb-6 ${tool.color} group-hover:scale-110 transition-transform duration-300`}>
            <tool.icon className="w-8 h-8" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-gray-900">{tool.title}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{tool.description}</p>
        </Link>
      ))}
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();

  const pdfTools = pdfToolsConfig.map(tool => ({
    ...tool,
    title: t(tool.titleKey),
    description: t(tool.descriptionKey),
  }));

  const imageTools = imageToolsConfig.map(tool => ({
    ...tool,
    title: t(tool.titleKey),
    description: t(tool.descriptionKey),
  }));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-200">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-gray-900 leading-tight">
            {t('brand.heroTitle')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('brand.heroDescription')}
          </p>
        </div>

        {/* PDF 도구 섹션 */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-500" />
            {t('home.pdfTools')}
          </h2>
          <ToolGrid tools={pdfTools} />
        </section>

        {/* 이미지 도구 섹션 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-rose-500" />
            {t('home.imageTools')}
          </h2>
          <ToolGrid tools={imageTools} />
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-24 py-12 text-center text-gray-500">
        <p>{t('brand.copyright').replace('{year}', new Date().getFullYear().toString())}</p>
      </footer>
    </div>
  );
}
