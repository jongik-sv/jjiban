import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Settings, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

export const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const PROJECT_ID = 'ac2ea160-fd5f-4ac1-a67e-b7e70372e2bf'; // Temporary hardcoded ID

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
        { icon: FolderKanban, label: 'Projects', href: '/projects' },
        { icon: FileText, label: 'Templates', href: `/projects/${PROJECT_ID}/templates` },
        { icon: Settings, label: 'Settings', href: '/settings' },
    ];

    return (
        <aside
            className={`bg-card border-r border-border transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'
                }`}
        >
            <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                    {!isCollapsed && <h1 className="text-xl font-bold">JJIban</h1>}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 hover:bg-secondary rounded"
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.label}>
                                <Link
                                    to={item.href}
                                    className="flex items-center gap-3 px-3 py-2 rounded hover:bg-secondary transition-colors"
                                    title={item.label}
                                >
                                    <item.icon size={20} />
                                    {!isCollapsed && <span>{item.label}</span>}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                            U
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1">
                                <p className="text-sm font-medium">User</p>
                                <p className="text-xs text-muted-foreground">user@jjiban.dev</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
};
