'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navSections = [
    {
        title: 'Getting Started',
        items: [
            { href: '/docs', label: 'Introduction' },
            { href: '/docs/installation', label: 'Installation' },
        ],
    },
    {
        title: 'Core Concepts',
        items: [
            { href: '/docs/agents', label: 'Agents' },
            { href: '/docs/skills', label: 'Skills' },
            { href: '/docs/workflows', label: 'Workflows' },
        ],
    },
    {
        title: 'Guide',
        items: [
            { href: '/docs/guide/examples/web-app', label: 'Example: Create Web App' },
        ],
    },
    {
        title: 'CLI Reference',
        items: [
            { href: '/docs/cli', label: 'Commands & Options' },
        ],
    },
];

export default function DocsSidebar() {
    const pathname = usePathname();

    return (
        <nav className="space-y-1">
            {navSections.map((section) => (
                <div key={section.title} className="pb-6">
                    <h3 className="mb-3 px-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {section.title}
                    </h3>
                    <div className="space-y-0.5">
                        {section.items.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                    block px-2 py-1.5 text-sm rounded-md transition-colors
                    ${isActive
                                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-medium'
                                            : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                        }
                  `}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </nav>
    );
}
