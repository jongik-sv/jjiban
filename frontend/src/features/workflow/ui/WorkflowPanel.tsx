import { useState, useEffect, type FC } from 'react';
import { useWorkflow } from '../hooks/useWorkflow';
import { WorkflowStepCard } from './WorkflowStepCard';

interface WorkflowPanelProps {
    issueId: string;
}

export const WorkflowPanel: FC<WorkflowPanelProps> = ({ issueId }) => {
    // For simplicity, we're assuming one active workflow per issue
    // In production, you'd fetch the active workflow ID for this issue
    const [jobId, setJobId] = useState<string | null>(null);
    const { job, approveNext } = useWorkflow(jobId || undefined);

    useEffect(() => {
        // Fetch workflows for this issue
        const fetchWorkflows = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/workflows/issue/${issueId}`);
                const workflows = await response.json();
                if (workflows.length > 0) {
                    setJobId(workflows[0].id);
                }
            } catch (error) {
                console.error('Failed to fetch workflows:', error);
            }
        };

        fetchWorkflows();
    }, [issueId]);

    if (!job) {
        return null;
    }

    const needsApproval =
        !job.isAutoMode &&
        job.status === 'running' &&
        job.steps[job.currentStepIndex]?.status === 'success' &&
        job.currentStepIndex < job.steps.length - 1;

    return (
        <div className="border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Workflow Progress</h3>
                <div className="flex gap-2 items-center">
                    {job.isAutoMode && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded font-mono">
                            AUTO
                        </span>
                    )}
                    <span className="text-xs uppercase font-mono">{job.status}</span>
                </div>
            </div>

            <div className="space-y-3">
                {job.steps.map((step, index) => (
                    <WorkflowStepCard key={step.id} step={step} index={index} />
                ))}
            </div>

            {needsApproval && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500 rounded">
                    <p className="text-sm mb-3">
                        Step "{job.steps[job.currentStepIndex].stepName}" completed. Proceed to next step?
                    </p>
                    <button
                        onClick={approveNext}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 text-sm"
                    >
                        Approve & Continue
                    </button>
                </div>
            )}
        </div>
    );
};
