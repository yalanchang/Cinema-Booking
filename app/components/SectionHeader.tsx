import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  linkText?: string;
  linkHref?: string;
  showBorder?: boolean;
}

export default function SectionHeader({ 
  title, 
  subtitle, 
  linkText, 
  linkHref,
  showBorder = false 
}: SectionHeaderProps) {
  return (
    <div className={`mb-8 ${showBorder ? 'border-b border-n7 pb-4' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
          {subtitle && <p className="text-gray-400">{subtitle}</p>}
        </div>
        
        {linkText && linkHref && (
          <Link 
            href={linkHref}
            className="text-[#D26900] hover:text-[#B85700] 
              transition-colors duration-300
              flex items-center gap-2 text-sm font-medium">
            {linkText}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}