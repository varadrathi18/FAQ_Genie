import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Globe,
  FileText,
  Plus,
  RefreshCw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Database,
  Layers,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Check
} from 'lucide-react';
import { projectsApi } from '../api/projects';
import { knowledgeApi } from '../api/knowledge';
import { driftApi } from '../api/drift';
import { jobsApi } from '../api/jobs';
import { Project, KnowledgeSource, KnowledgeDriftSummary, KnowledgeDriftStatus } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';

export const KnowledgePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(true);

  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState<boolean>(false);

  const [drifts, setDrifts] = useState<KnowledgeDriftSummary[]>([]);
  const [isLoadingDrifts, setIsLoadingDrifts] = useState<boolean>(false);

  // Add Source Modal States
  const [isAddWebsiteModalOpen, setIsAddWebsiteModalOpen] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isIngESTingWebsite, setIsIngestingWebsite] = useState(false);

  const [isAddTextModalOpen, setIsAddTextModalOpen] = useState(false);
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [isIngestingText, setIsIngestingText] = useState(false);

  // Active Job Polling
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobLabel, setJobLabel] = useState<string>('');

  // Delete Modal
  const [sourceToDelete, setSourceToDelete] = useState<KnowledgeSource | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Drift Triggering
  const [detectingDriftSourceId, setDetectingDriftSourceId] = useState<string | null>(null);
  const [updatingDriftId, setUpdatingDriftId] = useState<string | null>(null);

  // Fetch initial project list
  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const res = await projectsApi.getProjects();
        if (!isMounted) return;
        setProjects(res.projects);

        const paramProjectId = searchParams.get('projectId');
        if (paramProjectId && res.projects.some((p) => p.id === paramProjectId)) {
          setSelectedProjectId(paramProjectId);
        } else if (res.projects.length > 0) {
          setSelectedProjectId(res.projects[0].id);
          setSearchParams({ projectId: res.projects[0].id }, { replace: true });
        }
      } catch (err: any) {
        if (isMounted) {
          toast(err.message || 'Failed to load projects.', 'error');
        }
      } finally {
        if (isMounted) setIsLoadingProjects(false);
      }
    };

    fetchProjects();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update URL param when project changes
  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSearchParams({ projectId }, { replace: true });
  };

  // Fetch Knowledge & Drift when selectedProjectId changes
  const fetchKnowledgeAndDrift = useCallback(async () => {
    if (!selectedProjectId) return;
    setIsLoadingSources(true);
    setIsLoadingDrifts(true);
    try {
      const [sourcesRes, driftsRes] = await Promise.all([
        knowledgeApi.getKnowledgeSources(selectedProjectId),
        driftApi.getDriftList(selectedProjectId)
      ]);
      setSources(sourcesRes.sources);
      setDrifts(driftsRes);
    } catch (err: any) {
      toast(err.message || 'Failed to fetch knowledge data.', 'error');
    } finally {
      setIsLoadingSources(false);
      setIsLoadingDrifts(false);
    }
  }, [selectedProjectId, toast]);

  useEffect(() => {
    fetchKnowledgeAndDrift();
  }, [fetchKnowledgeAndDrift]);

  // Job Polling Helper
  const pollJob = useCallback(
    async (jobId: string, label: string) => {
      setActiveJobId(jobId);
      setJobLabel(label);

      const maxAttempts = 40;
      let attempts = 0;

      const interval = setInterval(async () => {
        attempts++;
        try {
          const statusRes = await jobsApi.getJobStatus(jobId);
          if (statusRes.status === 'completed') {
            clearInterval(interval);
            setActiveJobId(null);
            toast(`${label} completed successfully!`, 'success');
            fetchKnowledgeAndDrift();
          } else if (statusRes.status === 'failed') {
            clearInterval(interval);
            setActiveJobId(null);
            const errReason = statusRes.error?.message || 'Job execution failed.';
            toast(`${label} failed: ${errReason}`, 'error');
            fetchKnowledgeAndDrift();
          } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            setActiveJobId(null);
            toast(`${label} timed out. Please refresh later.`, 'error');
            fetchKnowledgeAndDrift();
          }
        } catch (error: any) {
          clearInterval(interval);
          setActiveJobId(null);
          toast(`Failed checking job status: ${error.message}`, 'error');
        }
      }, 3000);
    },
    [fetchKnowledgeAndDrift, toast]
  );

  // Ingest Website Handler
  const handleIngestWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !websiteUrl.trim()) return;

    setIsIngestingWebsite(true);
    try {
      const res = await knowledgeApi.ingestWebsite(selectedProjectId, websiteUrl.trim());
      setIsAddWebsiteModalOpen(false);
      setWebsiteUrl('');
      toast('Website ingestion queued.', 'info');
      pollJob(res.jobId, 'Website Ingestion');
    } catch (err: any) {
      toast(err.message || 'Failed to ingest website.', 'error');
    } finally {
      setIsIngestingWebsite(false);
    }
  };

  // Ingest Text Handler
  const handleIngestText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !textTitle.trim() || !textContent.trim()) return;

    setIsIngestingText(true);
    try {
      const res = await knowledgeApi.ingestText(
        selectedProjectId,
        textTitle.trim(),
        textContent.trim()
      );
      setIsAddTextModalOpen(false);
      setTextTitle('');
      setTextContent('');
      toast('Text knowledge ingestion queued.', 'info');
      pollJob(res.jobId, 'Text Ingestion');
    } catch (err: any) {
      toast(err.message || 'Failed to ingest text.', 'error');
    } finally {
      setIsIngestingText(false);
    }
  };

  // Re-ingest Source
  const handleReingest = async (source: KnowledgeSource) => {
    if (!selectedProjectId) return;
    try {
      let res;
      if (source.type === 'website' && source.url) {
        res = await knowledgeApi.ingestWebsite(selectedProjectId, source.url);
      } else if (source.type === 'text' && source.title) {
        res = await knowledgeApi.ingestText(
          selectedProjectId,
          source.title,
          'Re-ingesting existing product knowledge.'
        );
      }
      if (res) {
        toast('Re-ingestion queued.', 'info');
        pollJob(res.jobId, `Re-ingesting ${source.title || source.url}`);
      }
    } catch (err: any) {
      toast(err.message || 'Failed to trigger re-ingestion.', 'error');
    }
  };

  // Delete Knowledge Source
  const handleDeleteSource = async () => {
    if (!selectedProjectId || !sourceToDelete) return;
    setIsDeleting(true);
    try {
      await knowledgeApi.deleteKnowledgeSource(selectedProjectId, sourceToDelete.id);
      toast('Knowledge source deleted successfully.', 'success');
      setSourceToDelete(null);
      fetchKnowledgeAndDrift();
    } catch (err: any) {
      toast(err.message || 'Failed to delete knowledge source.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Detect Knowledge Drift
  const handleDetectDrift = async (sourceId: string) => {
    if (!selectedProjectId) return;
    setDetectingDriftSourceId(sourceId);
    try {
      const res = await driftApi.detectDrift(selectedProjectId, sourceId);
      toast('Knowledge drift calculation queued.', 'info');
      pollJob(res.jobId, 'Knowledge Drift Analysis');
    } catch (err: any) {
      toast(err.message || 'Failed to initiate drift detection.', 'error');
    } finally {
      setDetectingDriftSourceId(null);
    }
  };

  // Update Drift Status
  const handleUpdateDriftStatus = async (driftId: string, nextStatus: KnowledgeDriftStatus) => {
    if (!selectedProjectId) return;
    setUpdatingDriftId(driftId);
    try {
      await driftApi.updateDriftStatus(selectedProjectId, driftId, nextStatus);
      toast(`Drift marked as ${nextStatus}.`, 'success');
      fetchKnowledgeAndDrift();
    } catch (err: any) {
      toast(err.message || 'Failed to update drift status.', 'error');
    } finally {
      setUpdatingDriftId(null);
    }
  };

  if (isLoadingProjects) {
    return (
      <div className="flex h-96 items-center justify-center text-[#69707D] text-sm select-none">
        Loading knowledge workspace...
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-6 select-none my-12 bg-white border border-[#E5E7EB] rounded-2xl shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-[#EEECFF] text-[#635BFF] flex items-center justify-center mx-auto">
          <Database className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#111318]">No Projects Available</h2>
          <p className="text-sm text-[#69707D]">
            You have not created any projects yet. Generate your first FAQ collection to automatically initialize project knowledge sources.
          </p>
        </div>
        <Button onClick={() => navigate('/app/generate')} variant="primary" className="px-6">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate First FAQ Collection
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8 select-none text-left">
      {/* Header & Project Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111318]">
            Knowledge &amp; Drift Workspace
          </h1>
          <p className="text-xs sm:text-sm text-[#69707D] mt-1">
            Manage vectorized documentation, ingest product updates, and resolve semantic knowledge drift.
          </p>
        </div>

        {/* Project Dropdown */}
        <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-lg p-1.5 shadow-xs shrink-0">
          <span className="text-xs font-semibold text-[#69707D] pl-2">Project:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => handleProjectSelect(e.target.value)}
            className="text-xs sm:text-sm font-medium text-[#111318] bg-transparent outline-none cursor-pointer pr-4 py-1"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Job Processing Notice */}
      {activeJobId && (
        <div className="bg-[#F4F3FF] border border-[#C7C2FF] rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-[#635BFF] animate-spin" />
            <div>
              <span className="text-sm font-semibold text-[#111318] block">{jobLabel} in progress...</span>
              <span className="text-xs text-[#69707D]">Polling BullMQ worker task execution ({activeJobId})</span>
            </div>
          </div>
          <Badge variant="purple">Processing</Badge>
        </div>
      )}

      {/* SECTION 1: KNOWLEDGE SOURCES */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#111318] flex items-center gap-2">
              <Database className="w-5 h-5 text-[#635BFF]" />
              Knowledge Sources
            </h2>
            <p className="text-xs text-[#69707D]">Ingested content used for grounding generated FAQs.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsAddWebsiteModalOpen(true)}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Globe className="w-3.5 h-3.5 mr-1.5 text-[#635BFF]" />
              Add Website
            </Button>
            <Button
              onClick={() => setIsAddTextModalOpen(true)}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5 text-[#635BFF]" />
              Add Text
            </Button>
          </div>
        </div>

        {/* Source List */}
        {isLoadingSources ? (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 text-center text-xs text-[#69707D]">
            Loading knowledge sources...
          </div>
        ) : sources.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 text-center space-y-3">
            <Layers className="w-8 h-8 text-[#98A2B3] mx-auto" />
            <p className="text-xs text-[#69707D]">No knowledge sources ingested for this project yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sources.map((source) => {
              const isWebsite = source.type === 'website';
              return (
                <div
                  key={source.id}
                  className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center shrink-0 text-[#635BFF]">
                      {isWebsite ? <Globe className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-[#111318] truncate">
                          {source.title || source.url || 'Knowledge Source'}
                        </span>
                        <StatusBadge status={source.status} />
                        {source.currentVersion !== undefined && (
                          <span className="text-[11px] font-mono font-medium px-2 py-0.5 bg-[#F1F5F9] text-[#475569] rounded-md">
                            v{source.currentVersion}
                          </span>
                        )}
                      </div>

                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#635BFF] hover:underline truncate block"
                        >
                          {source.url}
                        </a>
                      )}

                      <div className="flex items-center gap-4 text-[11px] text-[#69707D]">
                        {source.lastFetchedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Fetched: {new Date(source.lastFetchedAt).toLocaleString()}
                          </span>
                        )}
                        {source.chunkCount !== undefined && (
                          <span>Chunks: {source.chunkCount}</span>
                        )}
                      </div>

                      {source.error && (
                        <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100 mt-1">
                          Error: {source.error}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {source.status === 'ready' && (
                      <Button
                        onClick={() => handleDetectDrift(source.id)}
                        disabled={detectingDriftSourceId === source.id}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 mr-1 text-[#635BFF]" />
                        Check Drift
                      </Button>
                    )}
                    <Button
                      onClick={() => handleReingest(source)}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                      Re-ingest
                    </Button>
                    <button
                      onClick={() => setSourceToDelete(source)}
                      className="p-2 text-[#69707D] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Source"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: KNOWLEDGE DRIFT */}
      <div className="space-y-4 pt-4 border-t border-[#E5E7EB]">
        <div>
          <h2 className="text-lg font-bold text-[#111318] flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#635BFF]" />
            Knowledge Drift Alerts
          </h2>
          <p className="text-xs text-[#69707D]">
            Monitors semantic shifts between product knowledge versions and calculates impacted FAQ coverage.
          </p>
        </div>

        {isLoadingDrifts ? (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 text-center text-xs text-[#69707D]">
            Loading drift records...
          </div>
        ) : drifts.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 text-center space-y-2">
            <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-semibold text-[#111318]">No Knowledge Drift Detected</h3>
            <p className="text-xs text-[#69707D]">
              All product knowledge versions are aligned with your active FAQ collections.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {drifts.map((drift) => (
              <div
                key={drift.driftId}
                className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
                  <div className="flex items-center gap-3">
                    <DriftLevelBadge level={drift.driftLevel} />
                    <div>
                      <span className="text-xs font-semibold text-[#69707D] uppercase tracking-wider block">
                        Version Shift
                      </span>
                      <span className="text-sm font-bold text-[#111318]">
                        v{drift.previousVersion} &rarr; v{drift.currentVersion}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <DriftStatusBadge status={drift.status} />
                    <span className="text-xs text-[#69707D]">
                      {new Date(drift.detectedAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Score and Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#F8F9FA] p-3.5 rounded-lg border border-[#E5E7EB]">
                  <div>
                    <span className="text-[11px] text-[#69707D] block">Drift Score</span>
                    <span className="text-base font-bold text-[#111318]">{drift.driftScore}%</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#69707D] block">Changed Chunks</span>
                    <span className="text-base font-bold text-[#111318]">
                      {drift.changedChunkCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#69707D] block">Affected FAQs</span>
                    <span className="text-base font-bold text-[#111318]">
                      {drift.affectedFaqCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#69707D] block">Source ID</span>
                    <span className="text-xs font-mono font-medium text-[#475569] truncate block max-w-[100px]">
                      {drift.knowledgeSourceId}
                    </span>
                  </div>
                </div>

                {/* Lifecycle Transitions & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  {drift.affectedFaqCount > 0 ? (
                    <button
                      onClick={() => navigate('/app/history')}
                      className="text-xs font-semibold text-[#635BFF] hover:underline flex items-center gap-1 text-left"
                    >
                      <span>Review affected FAQs in History</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-xs text-[#69707D]">No generated FAQs impacted.</span>
                  )}

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {drift.status === 'detected' && (
                      <Button
                        onClick={() => handleUpdateDriftStatus(drift.driftId, 'reviewed')}
                        disabled={updatingDriftId === drift.driftId}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        Mark Reviewed
                      </Button>
                    )}
                    {(drift.status === 'detected' || drift.status === 'reviewed') && (
                      <Button
                        onClick={() => handleUpdateDriftStatus(drift.driftId, 'resolved')}
                        disabled={updatingDriftId === drift.driftId}
                        variant="primary"
                        size="sm"
                        className="text-xs bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Resolve Drift
                      </Button>
                    )}
                    {drift.status === 'resolved' && (
                      <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Drift Resolved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: ADD WEBSITE */}
      <Modal
        isOpen={isAddWebsiteModalOpen}
        onClose={() => setIsAddWebsiteModalOpen(false)}
        title="Add Website Knowledge Source"
      >
        <form onSubmit={handleIngestWebsite} className="space-y-4 text-left">
          <p className="text-xs text-[#69707D]">
            Provide a documentation or product URL to scrape and vectorize into this project&apos;s knowledge base.
          </p>
          <Input
            label="Website URL"
            type="url"
            placeholder="https://example.com/docs"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddWebsiteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isIngESTingWebsite}>
              {isIngESTingWebsite ? 'Ingesting...' : 'Ingest Website'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: ADD TEXT KNOWLEDGE */}
      <Modal
        isOpen={isAddTextModalOpen}
        onClose={() => setIsAddTextModalOpen(false)}
        title="Add Text Knowledge Source"
      >
        <form onSubmit={handleIngestText} className="space-y-4 text-left">
          <p className="text-xs text-[#69707D]">
            Add direct plain-text release notes or feature descriptions to ground FAQs without a website URL.
          </p>
          <Input
            label="Source Title / Label"
            placeholder="e.g. Q3 Release Notes"
            value={textTitle}
            onChange={(e) => setTextTitle(e.target.value)}
            required
          />
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#111318]">Product Text Content</label>
            <textarea
              rows={5}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Paste product features, API documentation, or release details..."
              className="w-full text-xs p-3 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] focus:outline-none focus:border-[#635BFF]"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddTextModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isIngestingText}>
              {isIngestingText ? 'Ingesting...' : 'Ingest Text'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: DELETE CONFIRMATION */}
      <Modal
        isOpen={!!sourceToDelete}
        onClose={() => setSourceToDelete(null)}
        title="Delete Knowledge Source"
      >
        <div className="space-y-4 text-left">
          <p className="text-xs text-[#69707D]">
            Are you sure you want to delete this knowledge source? This will remove all associated vectorized chunks permanently.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setSourceToDelete(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleDeleteSource}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Helper status badges
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'ready':
      return <Badge variant="green">Ready</Badge>;
    case 'processing':
      return <Badge variant="purple">Processing</Badge>;
    case 'pending':
      return <Badge variant="yellow">Pending</Badge>;
    case 'failed':
      return <Badge variant="red">Failed</Badge>;
    default:
      return <Badge variant="gray">{status}</Badge>;
  }
};

const DriftLevelBadge: React.FC<{ level: string }> = ({ level }) => {
  switch (level) {
    case 'high':
      return <Badge variant="red">High Drift</Badge>;
    case 'moderate':
      return <Badge variant="yellow">Moderate Drift</Badge>;
    case 'low':
      return <Badge variant="blue">Low Drift</Badge>;
    default:
      return <Badge variant="gray">No Drift</Badge>;
  }
};

const DriftStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'detected':
      return (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
          Detected
        </span>
      );
    case 'reviewed':
      return (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
          Reviewed
        </span>
      );
    case 'resolved':
      return (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
          Resolved
        </span>
      );
    default:
      return <span className="text-xs text-gray-600">{status}</span>;
  }
};
