import Link from 'next/link';
import { FileUp, Scissors, FilePlus2, RefreshCw, Type, Image as ImageIcon, FileText } from 'lucide-react';

const tools = [
  {
    title: 'Merge PDF',
    description: 'Combine multiple PDFs into a single document effortlessly.',
    icon: FilePlus2,
    href: '/merge',
    color: 'bg-blue-500',
  },
  {
    title: 'Split PDF',
    description: 'Separate one page or a whole set for easy conversion into independent PDF files.',
    icon: Scissors,
    href: '/split',
    color: 'bg-green-500',
  },
  {
    title: 'Rotate PDF',
    description: 'Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once.',
    icon: RefreshCw,
    href: '/rotate',
    color: 'bg-yellow-500',
  },
  {
    title: 'Add Watermark',
    description: 'Choose an image or text and stamp it over your PDF.',
    icon: Type,
    href: '/watermark',
    color: 'bg-purple-500',
  },
  {
    title: 'Edit PDF',
    description: 'Add text, images, shapes or freehand annotations to a PDF document.',
    icon: FileUp,
    href: '/edit',
    color: 'bg-red-500',
  },
  {
    title: 'OCR (Image to Text)',
    description: 'Extract text from scanned PDFs or images easily.',
    icon: ImageIcon,
    href: '/ocr',
    color: 'bg-indigo-500',
  },
  {
    title: 'Convert to PDF',
    description: 'Convert JPG or PNG images into a PDF document entirely in your browser.',
    icon: FileText,
    href: '/convert',
    color: 'bg-orange-500',
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-200">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FileUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">LocalPDF</span>
          </div>
          <nav className="hidden md:flex gap-6 font-medium text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition">All Tools</Link>
            <Link href="/merge" className="hover:text-blue-600 transition">Merge</Link>
            <Link href="/split" className="hover:text-blue-600 transition">Split</Link>
            <Link href="/convert" className="hover:text-blue-600 transition">Convert</Link>
            <Link href="/edit" className="hover:text-blue-600 transition">Edit</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-gray-900">
            Every tool you need to work with PDFs in one place
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            100% Free, Secure, and Local. Your files never leave your browser. Edit, merge, split, and convert your PDFs with zero server uploads.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <Link key={tool.title} href={tool.href} className="group flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all duration-300">
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
        <p>&copy; {new Date().getFullYear()} LocalPDF. 100% Private Client-Side Processing.</p>
      </footer>
    </div>
  );
}
