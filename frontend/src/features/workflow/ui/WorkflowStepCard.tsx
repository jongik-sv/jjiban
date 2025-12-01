import type { FC } from 'react';

interface WorkflowStep {
    id: string;
    stepName: string;
    status: string;
    resultSummary?: string;
}

interface WorkflowStepCardProps {
    step: WorkflowStep;
    index: number;
}

export const WorkflowStepCard: FC<WorkflowStepCardProps> = ({ step, index }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success': return 'bg-green-500/20 border-green-500';
            case 'running': return 'bg-blue-500/20 border-blue-500 animate-pulse';
            case 'failed': return 'bg-red-500/20 border-red-500';
            case 'pending': return 'bg-gray-500/20 border-gray-500';
            default: return 'bg-gray-500/20 border-gray-500';
        }
    };

    return (
        <div className={`border rounded p-3 ${getStatusColor(step.status)}`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-mono bg-background px-2 py-1 rounded">
                        {index + 1}
                    </span>
                    <span className="font-semibold">{step.stepName}</span>
                </div>
                <span className="text-xs uppercase font-mono">{step.status}</span>
            </div>

            {step.resultSummary && (
                <div className="text-sm text-muted-foreground mt-2 p-2 bg-background/50 rounded">
                    {step.resultSummary}
                </div>
            )}
        </div>
    );
};
