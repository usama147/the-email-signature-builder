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
        color: 'text-red-600',
        label: 'Poor Support',
    },
};

export function CompatibilityReport({ results }: CompatibilityReportProps) {
    if (results.length === 0) {
        return <p className="text-slate-500">No compatibility checks to display.</p>;
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Email Client Compatibility Report</h3>
            <ul className="divide-y divide-slate-200">
                {results.map(result => {
                    const { icon, color, label } = statusMap[result.status];
                    return (
                        <li key={result.id} className="py-4 flex items-start gap-4">
                            <div className={`shrink-0 ${color}`}>
                                {icon}
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-700">{result.title} <span className={`text-sm font-medium ml-2 ${color}`}>({label})</span></h4>
                                <p className="text-sm text-slate-500">{result.message}</p>
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
}
