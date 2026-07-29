import { Code2 } from 'lucide-react';

export default function DeveloperSignature() {
  return (
    <a
      href="https://arshadsheikh.dev"
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2.5 text-xs text-stone-500 hover:text-stone-300 transition-colors duration-300"
    >
      <span className="flex items-center gap-2">
        <Code2 className="w-3.5 h-3.5 text-stone-600 group-hover:text-amber-500 transition-colors duration-300" />
        <span className="tracking-wide">
          Designed &amp; Developed by{' '}
          <span className="font-semibold text-stone-400 group-hover:text-amber-500 transition-colors duration-300">
            Arshad Sheikh
          </span>
        </span>
      </span>
    </a>
  );
}
