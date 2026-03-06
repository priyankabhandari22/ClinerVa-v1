import React, { useState } from 'react';
import {
    Brain, Sparkles, Loader2, CheckCircle2, AlertCircle,
    XCircle, ChevronDown, ChevronUp, Zap, ShieldCheck, MessageSquare
} from 'lucide-react';
import { matchingAPI } from '../services/api';

/**
 * AIMatchPanel
 * ─────────────
 * Shows GPT-4o powered AI eligibility analysis for a patient + trial pair.
 * Also exposes a "Get AI Recommendations" button that sends the patientId
 * to the /ai/recommendations endpoint.
 *
 * Props:
 *   patientId   - MongoDB ObjectId string (required)
 *   trialId     - MongoDB ObjectId string (optional; if omitted, only recommendations available)
 *   trialTitle  - Display name of the trial (optional)
 */
export default function AIMatchPanel({ patientId, trialId, trialTitle }) {
    const [mode, setMode] = useState('idle');     // 'idle' | 'eligibility' | 'recommendations'
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(false);

    const verdictConfig = {
        EXCELLENT: { color: 'emerald', label: 'Excellent Match', Icon: CheckCircle2 },
        GOOD: { color: 'blue', label: 'Good Match', Icon: CheckCircle2 },
        MODERATE: { color: 'amber', label: 'Moderate Match', Icon: AlertCircle },
        POOR: { color: 'orange', label: 'Poor Match', Icon: AlertCircle },
        INELIGIBLE: { color: 'red', label: 'Ineligible', Icon: XCircle },
        UNKNOWN: { color: 'slate', label: 'Unknown', Icon: AlertCircle },
    };

    const runEligibility = async () => {
        if (!patientId || !trialId) return;
        setLoading(true); setError(null); setResult(null);
        try {
            const res = await matchingAPI.aiEligibility(patientId, trialId);
            setMode('eligibility');
            setResult(res.data.data);
            setExpanded(true);
        } catch (err) {
            setError(err.response?.data?.error || 'AI eligibility check failed');
        } finally {
            setLoading(false);
        }
    };

    const runRecommendations = async () => {
        if (!patientId) return;
        setLoading(true); setError(null); setResult(null);
        try {
            const res = await matchingAPI.aiRecommendations(patientId);
            setMode('recommendations');
            setResult(res.data.data);
            setExpanded(true);
        } catch (err) {
            setError(err.response?.data?.error || 'AI recommendations failed');
        } finally {
            setLoading(false);
        }
    };

    // ── Eligibility report – parsed AI JSON ────────────────────────────────
    const report = result?.eligibilityAnalysis
        ? null                      // narrative output (recommendations path)
        : result;

    const hasReport = mode === 'eligibility' && result?.eligibilityAnalysis;
    const hasNarrative = mode === 'recommendations' && result?.recommendations;

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-brand-50 border border-indigo-100 rounded-2xl p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Brain className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">GPT-4o AI Analysis</p>
                        <p className="text-xs text-slate-500 font-medium">Powered by Bytez</p>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                    {trialId && (
                        <button
                            onClick={runEligibility}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-60 shadow-sm"
                        >
                            {loading && mode !== 'recommendations' ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <ShieldCheck className="w-3.5 h-3.5" />
                            )}
                            Check Eligibility
                        </button>
                    )}
                    <button
                        onClick={runRecommendations}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-60 shadow-sm"
                    >
                        {loading && mode === 'recommendations' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                        )}
                        AI Recommendations
                    </button>
                </div>
            </div>

            {/* Loading state */}
            {loading && (
                <div className="flex items-center gap-3 py-4 px-4 bg-white/70 rounded-xl">
                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-slate-700">
                            {mode === 'eligibility' || loading
                                ? 'Analysing eligibility criteria…'
                                : 'Generating recommendations…'}
                        </p>
                        <p className="text-xs text-slate-500">GPT-4o is evaluating the patient profile</p>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 font-medium">
                    <XCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            {/* ── Eligibility Report ────────────────────────────────────────────── */}
            {mode === 'eligibility' && result && !loading && (
                <div className="space-y-3">
                    {/* Verdict badge + score */}
                    {result.eligibilityAnalysis ? (
                        /* Narrative response from the backend */
                        <NarrativeResult
                            title="Eligibility Analysis"
                            content={result.eligibilityAnalysis}
                            expanded={expanded}
                            onToggle={() => setExpanded(v => !v)}
                            icon={<ShieldCheck className="w-4 h-4" />}
                            color="indigo"
                        />
                    ) : result.aiReport ? (
                        /* Structured JSON response */
                        <StructuredReport report={result.aiReport} />
                    ) : null}
                </div>
            )}

            {/* ── Recommendations ───────────────────────────────────────────────── */}
            {mode === 'recommendations' && result && !loading && (
                <NarrativeResult
                    title="Personalised Recommendations"
                    content={result.recommendations}
                    expanded={expanded}
                    onToggle={() => setExpanded(v => !v)}
                    icon={<Zap className="w-4 h-4" />}
                    color="brand"
                />
            )}
        </div>
    );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function StructuredReport({ report }) {
    const [expanded, setExpanded] = useState(true);

    const verdictColors = {
        EXCELLENT: 'emerald', GOOD: 'blue', MODERATE: 'amber',
        POOR: 'orange', INELIGIBLE: 'red', UNKNOWN: 'slate'
    };
    const col = verdictColors[report.verdict] || 'slate';

    return (
        <div className="space-y-3">
            {/* Score + verdict */}
            <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-slate-100 shadow-sm">
                <div>
                    <p className={`text-2xl font-extrabold text-${col}-600`}>
                        {report.compatibilityScore ?? '—'}
                        <span className="text-base font-bold text-slate-400">/100</span>
                    </p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Compatibility</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full bg-${col}-50 text-${col}-700`}>
                    {report.verdict}
                </span>
            </div>

            {/* Summary */}
            {report.summary && (
                <p className="text-sm font-medium text-slate-700 px-1">{report.summary}</p>
            )}

            {/* Expandable detail */}
            <button
                onClick={() => setExpanded(v => !v)}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors px-1"
            >
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {expanded ? 'Hide detail' : 'Show detail'}
            </button>

            {expanded && (
                <div className="space-y-3 text-sm">
                    {report.inclusionMatches?.length > 0 && (
                        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                            <p className="font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Inclusion Matches
                            </p>
                            <ul className="space-y-1">
                                {report.inclusionMatches.map((r, i) => (
                                    <li key={i} className="text-emerald-700 font-medium text-xs">{r}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {report.exclusionFlags?.length > 0 && (
                        <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                            <p className="font-bold text-red-800 mb-2 flex items-center gap-1.5">
                                <XCircle className="w-3.5 h-3.5" /> Exclusion Flags
                            </p>
                            <ul className="space-y-1">
                                {report.exclusionFlags.map((f, i) => (
                                    <li key={i} className="text-red-700 font-medium text-xs">{f}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {report.recommendations?.length > 0 && (
                        <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                            <p className="font-bold text-amber-800 mb-2 flex items-center gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5" /> Recommendations
                            </p>
                            <ul className="space-y-1">
                                {report.recommendations.map((rec, i) => (
                                    <li key={i} className="text-amber-800 font-medium text-xs">{rec}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function NarrativeResult({ title, content, expanded, onToggle, icon, color }) {
    const colorMap = {
        brand: { bg: 'bg-brand-50', border: 'border-brand-100', title: 'text-brand-800', body: 'text-brand-900', btn: 'text-brand-600' },
        indigo: { bg: 'bg-indigo-50', border: 'border-indigo-100', title: 'text-indigo-800', body: 'text-indigo-900', btn: 'text-indigo-600' },
    };
    const c = colorMap[color] || colorMap.indigo;

    return (
        <div className={`${c.bg} ${c.border} border rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-2">
                <p className={`font-bold text-sm ${c.title} flex items-center gap-1.5`}>
                    {icon} {title}
                </p>
                <button
                    onClick={onToggle}
                    className={`text-xs font-bold ${c.btn} flex items-center gap-1`}
                >
                    {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {expanded ? 'Collapse' : 'Expand'}
                </button>
            </div>
            {expanded && (
                <p className={`text-xs font-medium ${c.body} whitespace-pre-wrap leading-relaxed`}>
                    {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
                </p>
            )}
        </div>
    );
}
