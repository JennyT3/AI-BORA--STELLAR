import { useState } from 'react';
import { BookOpen, Award, Play, CheckCircle, Lock, ExternalLink, Loader2 } from 'lucide-react';

interface Course {
    id: string;
    title: string;
    description: string;
    duration: string;
    completed: boolean;
    locked: boolean;
    lessons: number;
}

const COURSES: Course[] = [
    {
        id: '1',
        title: 'Introduction to AIBORA',
        description: 'Platform overview, how proposals work, and your role as a collaborator.',
        duration: '45 min',
        completed: true,
        locked: false,
        lessons: 6,
    },
    {
        id: '2',
        title: 'Stellar & Blockchain Payments',
        description: 'How XLM/USDC payments work, the PaymentSplitter contract, and on-chain verification.',
        duration: '60 min',
        completed: true,
        locked: false,
        lessons: 8,
    },
    {
        id: '3',
        title: 'Client Proposal Flow',
        description: 'Creating proposals, PDF hashing, blockchain anchoring, and client acceptance.',
        duration: '50 min',
        completed: true,
        locked: false,
        lessons: 7,
    },
    {
        id: '4',
        title: 'Task Management & Delivery',
        description: 'Kanban workflow, task states, submitting deliverables, and client approval.',
        duration: '40 min',
        completed: false,
        locked: false,
        lessons: 5,
    },
    {
        id: '5',
        title: 'AI Agent & x402 Micropayments',
        description: 'How the AI agent automates workflows and handles backend micropayments.',
        duration: '55 min',
        completed: false,
        locked: true,
        lessons: 7,
    },
];

type CertState = 'idle' | 'generating' | 'done';

export default function Academy() {
    const [activeLesson, setActiveLesson] = useState < string | null > (null);
    const [certState, setCertState] = useState < CertState > ('idle');
    const [txHash, setTxHash] = useState('');

    const completed = COURSES.filter(c => c.completed).length;
    const total = COURSES.length;
    const progress = Math.round((completed / total) * 100);
    const canCertify = completed >= 3; // at least 3 courses done for demo

    const handleGenerateCertificate = async () => {
        setCertState('generating');
        // Simulate blockchain hash + PDF generation
        await new Promise(r => setTimeout(r, 2800));
        const mockHash = 'b7e3f2a1c8d94e6f0a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4';
        setTxHash(mockHash);
        setCertState('done');
    };

    return (
        <div style={s.page}>
            {/* Header */}
            <div style={s.header}>
                <div style={s.logo}>AI BORA</div>
                <div>
                    <h1 style={s.title}>Academy</h1>
                    <p style={s.subtitle}>Learn the platform — earn your blockchain certificate</p>
                </div>
            </div>

            {/* Progress bar */}
            <div style={s.progressCard}>
                <div style={s.progressTop}>
                    <span style={s.progressLabel}>Your progress</span>
                    <span style={s.progressCount}>{completed}/{total} courses completed</span>
                </div>
                <div style={s.progressTrack}>
                    <div style={{ ...s.progressFill, width: `${progress}%` }} />
                </div>
                <p style={s.progressHint}>
                    {canCertify
                        ? '🎉 You qualify for a blockchain-verified certificate!'
                        : `Complete ${3 - completed} more course${3 - completed !== 1 ? 's' : ''} to unlock your certificate.`}
                </p>
            </div>

            {/* Course list */}
            <div style={s.section}>
                <h2 style={s.sectionTitle}>Courses</h2>
                <div style={s.courseGrid}>
                    {COURSES.map(course => (
                        <div
                            key={course.id}
                            style={{ ...s.courseCard, opacity: course.locked ? 0.55 : 1 }}
                        >
                            <div style={s.courseTop}>
                                <div style={{ ...s.courseIcon, backgroundColor: course.completed ? '#f0fdf4' : '#f8f7f4' }}>
                                    {course.completed
                                        ? <CheckCircle size={20} color="#22c55e" />
                                        : course.locked
                                            ? <Lock size={20} color="#aaa" />
                                            : <BookOpen size={20} color="#F25C05" />
                                    }
                                </div>
                                <div style={s.courseMeta}>
                                    <span style={s.courseLesson}>{course.lessons} lessons · {course.duration}</span>
                                    {course.completed && <span style={s.completedBadge}>Completed</span>}
                                    {course.locked && <span style={s.lockedBadge}>Locked</span>}
                                </div>
                            </div>

                            <h3 style={s.courseTitle}>{course.title}</h3>
                            <p style={s.courseDesc}>{course.description}</p>

                            {!course.locked && (
                                <button
                                    style={course.completed ? s.btnReview : s.btnStart}
                                    onClick={() => setActiveLesson(course.id)}
                                >
                                    {course.completed ? 'Review' : 'Start course'}
                                    <Play size={14} style={{ marginLeft: 6 }} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Certificate section */}
            <div style={s.certSection}>
                <div style={s.certLeft}>
                    <Award size={40} color={canCertify ? '#F25C05' : '#ccc'} />
                    <div>
                        <h2 style={s.certTitle}>Blockchain Certificate</h2>
                        <p style={s.certDesc}>
                            Your certificate is cryptographically hashed and anchored on the Stellar network.
                            Anyone can verify its authenticity using the transaction hash — forever.
                        </p>
                    </div>
                </div>

                {certState === 'idle' && (
                    <button
                        style={canCertify ? s.btnCert : s.btnCertDisabled}
                        onClick={canCertify ? handleGenerateCertificate : undefined}
                        disabled={!canCertify}
                    >
                        Generate certificate
                    </button>
                )}

                {certState === 'generating' && (
                    <div style={s.generatingBox}>
                        <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', color: '#F25C05' }} />
                        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                        <span style={{ marginLeft: 10, color: '#666', fontSize: 14 }}>
                            Generating PDF & anchoring on Stellar...
                        </span>
                    </div>
                )}

                {certState === 'done' && (
                    <div style={s.certResult}>
                        <div style={s.certResultHeader}>
                            <CheckCircle size={20} color="#22c55e" />
                            <span style={s.certResultTitle}>Certificate issued on-chain</span>
                        </div>
                        <div style={s.hashBox}>
                            <span style={s.hashLabel}>Stellar tx hash</span>
                            <code style={s.hash}>{txHash.slice(0, 24)}...{txHash.slice(-8)}</code>
                        </div>
                        <div style={s.certActions}>
                            <a
                                href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={s.btnVerify}
                            >
                                Verify on Stellar Expert <ExternalLink size={13} style={{ marginLeft: 4 }} />
                            </a>
                            <button style={s.btnDownload} onClick={() => alert('PDF download triggered')}>
                                Download PDF
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Lesson modal (simple overlay) */}
            {activeLesson && (
                <div style={s.overlay} onClick={() => setActiveLesson(null)}>
                    <div style={s.modal} onClick={e => e.stopPropagation()}>
                        <h2 style={s.modalTitle}>
                            {COURSES.find(c => c.id === activeLesson)?.title}
                        </h2>
                        <p style={s.modalDesc}>
                            {COURSES.find(c => c.id === activeLesson)?.description}
                        </p>
                        <div style={s.videoPlaceholder}>
                            <Play size={40} color="#F25C05" />
                            <p style={{ color: '#666', marginTop: 12, fontSize: 14 }}>Video lesson — coming soon</p>
                        </div>
                        <button style={s.btnClose} onClick={() => setActiveLesson(null)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const s = {
    page: {
        minHeight: '100vh',
        backgroundColor: '#f8f7f4',
        padding: '40px 60px',
        fontFamily: 'Montserrat, sans-serif',
    } as const,
    header: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 },
    logo: {
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: 900,
        fontSize: 14,
        color: '#F25C05',
        letterSpacing: '0.3em',
        textTransform: 'uppercase' as const,
    },
    title: { fontWeight: 900, fontSize: 28, color: '#1b1c1b', margin: 0 },
    subtitle: { fontSize: 14, color: '#666', marginTop: 4 },

    progressCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 28,
        marginBottom: 40,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    },
    progressTop: { display: 'flex', justifyContent: 'space-between', marginBottom: 12 },
    progressLabel: { fontSize: 14, fontWeight: 700, color: '#1b1c1b' },
    progressCount: { fontSize: 14, color: '#666' },
    progressTrack: {
        height: 8,
        backgroundColor: '#f0ede6',
        borderRadius: 100,
        overflow: 'hidden' as const,
        marginBottom: 12,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#F25C05',
        borderRadius: 100,
        transition: 'width 0.6s ease',
    },
    progressHint: { fontSize: 13, color: '#666', margin: 0 },

    section: { marginBottom: 48 },
    sectionTitle: { fontWeight: 900, fontSize: 20, marginBottom: 20, color: '#1b1c1b' },
    courseGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 20,
    } as const,
    courseCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 12,
    },
    courseTop: { display: 'flex', alignItems: 'center', gap: 12 },
    courseIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    courseMeta: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const },
    courseLesson: { fontSize: 12, color: '#999' },
    completedBadge: {
        fontSize: 11,
        fontWeight: 700,
        backgroundColor: '#f0fdf4',
        color: '#166534',
        padding: '2px 8px',
        borderRadius: 100,
    },
    lockedBadge: {
        fontSize: 11,
        fontWeight: 700,
        backgroundColor: '#f3f4f6',
        color: '#6b7280',
        padding: '2px 8px',
        borderRadius: 100,
    },
    courseTitle: { fontWeight: 700, fontSize: 16, color: '#1b1c1b', margin: 0 },
    courseDesc: { fontSize: 13, color: '#666', lineHeight: 1.6, margin: 0, flex: 1 },
    btnStart: {
        marginTop: 4,
        padding: '10px 18px',
        backgroundColor: '#F25C05',
        color: '#fff',
        border: 'none',
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        alignSelf: 'flex-start' as const,
    },
    btnReview: {
        marginTop: 4,
        padding: '10px 18px',
        backgroundColor: '#f8f7f4',
        color: '#1b1c1b',
        border: '1.5px solid #e5e3dd',
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        alignSelf: 'flex-start' as const,
    },

    certSection: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 36,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 32,
        flexWrap: 'wrap' as const,
    },
    certLeft: { display: 'flex', alignItems: 'flex-start', gap: 20, flex: 1 },
    certTitle: { fontWeight: 900, fontSize: 20, color: '#1b1c1b', margin: '0 0 8px' },
    certDesc: { fontSize: 14, color: '#666', lineHeight: 1.7, margin: 0, maxWidth: 480 },
    btnCert: {
        padding: '14px 28px',
        backgroundColor: '#F25C05',
        color: '#fff',
        border: 'none',
        borderRadius: 12,
        fontSize: 15,
        fontWeight: 700,
        cursor: 'pointer',
        whiteSpace: 'nowrap' as const,
        alignSelf: 'center' as const,
    },
    btnCertDisabled: {
        padding: '14px 28px',
        backgroundColor: '#e5e3dd',
        color: '#aaa',
        border: 'none',
        borderRadius: 12,
        fontSize: 15,
        fontWeight: 700,
        cursor: 'not-allowed',
        whiteSpace: 'nowrap' as const,
        alignSelf: 'center' as const,
    },
    generatingBox: {
        display: 'flex',
        alignItems: 'center',
        padding: '14px 24px',
        backgroundColor: '#fff8f5',
        borderRadius: 12,
        alignSelf: 'center' as const,
    },
    certResult: {
        backgroundColor: '#f0fdf4',
        borderRadius: 16,
        padding: 24,
        minWidth: 280,
        alignSelf: 'center' as const,
    },
    certResultHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 },
    certResultTitle: { fontWeight: 700, fontSize: 14, color: '#166534' },
    hashBox: { marginBottom: 16 },
    hashLabel: { fontSize: 11, color: '#999', display: 'block', marginBottom: 4 },
    hash: {
        fontSize: 12,
        color: '#1b1c1b',
        backgroundColor: '#e8f5e9',
        padding: '6px 10px',
        borderRadius: 6,
        display: 'block',
        wordBreak: 'break-all' as const,
    },
    certActions: { display: 'flex', gap: 10, flexWrap: 'wrap' as const },
    btnVerify: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px 16px',
        backgroundColor: '#1d4ed8',
        color: '#fff',
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 700,
        textDecoration: 'none',
    },
    btnDownload: {
        padding: '10px 16px',
        backgroundColor: '#fff',
        color: '#1b1c1b',
        border: '1.5px solid #d1d5db',
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
    },

    overlay: {
        position: 'fixed' as const,
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 40,
        maxWidth: 520,
        width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    },
    modalTitle: { fontWeight: 900, fontSize: 22, color: '#1b1c1b', margin: '0 0 12px' },
    modalDesc: { fontSize: 14, color: '#666', lineHeight: 1.7, marginBottom: 24 },
    videoPlaceholder: {
        backgroundColor: '#f8f7f4',
        borderRadius: 12,
        height: 200,
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    btnClose: {
        width: '100%',
        padding: 14,
        backgroundColor: '#1b1c1b',
        color: '#fff',
        border: 'none',
        borderRadius: 12,
        fontSize: 15,
        fontWeight: 700,
        cursor: 'pointer',
    },
};