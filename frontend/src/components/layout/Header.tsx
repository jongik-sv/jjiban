import { Plus, Bell } from 'lucide-react';

export const Header = () => {
    return (
        <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Projects</span>
                <span className="text-muted-foreground">/</span>
                <span className="font-semibold">JJIban Project</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-secondary rounded relative">
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90">
                    <Plus size={18} />
                    <span>New Issue</span>
                </button>
            </div>
        </header>
    );
};
