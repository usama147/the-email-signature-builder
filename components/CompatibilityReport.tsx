import React from 'react';
import { CompatibilityResult, CompatibilityStatus } from '../types';
import { CheckCircleIcon, WarningIcon, XCircleIcon } from './icons';

interface CompatibilityReportProps {
    results: CompatibilityResult[];
}

const statusMap = {
    [CompatibilityStatus.Good]: {
        icon: <CheckCircleIcon />,
        color: 'text-green-600',
        label: 'Good',
    },
    [CompatibilityStatus.Warning]: {
        icon: <WarningIcon />,
        color: 'text-yellow-600',
        label: 'Warning',
    },
    [CompatibilityStatus.Poor]: {
        icon: <XCircleIcon />,
        color: 'text-[--danger]',
        label: 'Poor Support',
    },
};

export function CompatibilityReport({ results }: CompatibilityReportProps) {
    if (results.length === 0) {
        return <p className="text-[--text-color-light]">No compatibility checks to display.</p>;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[--text-color]">Email Client Compatibility Report</h3>
            <ul className="divide-y divide-[--border-color]">
                {results.map(result => {
                    const { icon, color, label } = statusMap[result.status];
                    return (
                        <li key={result.id} className="py-4 flex items-start gap-4">
                            <div className={`shrink-0 ${color}`}>
                                {icon}
                            </div>
                            <div>
                                <h4 className="font-semibold text-[--text-color-secondary]">{result.title} <span className={`text-sm font-medium ml-2 ${color}`}>({label})</span></h4>
                                <p className="text-sm text-[--text-color-light]">{result.message}</p>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
}