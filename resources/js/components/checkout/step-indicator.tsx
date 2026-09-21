import React from 'react';

interface StepIndicatorProps {
    steps: string[];
    currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
    return (
        <div className="w-full px-2 py-4">
            <div className="mx-auto flex max-w-md items-center justify-between">
                {steps.map((label, idx) => {
                    const isCompleted = idx < currentStep;
                    const isActive = idx === currentStep;

                    return (
                        <React.Fragment key={label}>
                            {/* Step circle & label */}
                            <div className="relative flex flex-col items-center">
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-300 ${
                                        isCompleted
                                            ? 'bg-forest border-forest text-stone-100'
                                            : isActive
                                              ? 'bg-paper border-forest text-forest ring-forest/15 ring-4 font-bold'
                                              : 'bg-paper border-stone-300 text-stone-400'
                                    }`}
                                >
                                    {isCompleted ? (
                                        <svg
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        idx + 1
                                    )}
                                </div>
                                <span
                                    className={`absolute -bottom-6 text-[10px] sm:text-xs whitespace-nowrap tracking-wide ${
                                        isActive ? 'text-forest font-bold' : 'text-stone-500 font-medium'
                                    }`}
                                >
                                    {label}
                                </span>
                            </div>

                            {/* Line connector */}
                            {idx < steps.length - 1 && (
                                <div className="relative -top-3 mx-2 h-[2px] flex-1">
                                    <div
                                        className={`h-full transition-all duration-500 ${
                                            isCompleted ? 'bg-forest' : 'bg-stone-300'
                                        }`}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
            <div className="h-6" />
        </div>
    );
}

export default StepIndicator;
