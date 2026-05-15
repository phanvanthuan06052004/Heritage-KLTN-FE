import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileUp,
  Link as LinkIcon,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "~/components/common/ui/Button";
import { Input } from "~/components/common/ui/Input";
import { Textarea } from "~/components/common/ui/Textarea";
import {
  useGetKnowledgeProgressQuery,
  useGetWikiPageQuery,
  useGetWikiPagesQuery,
  useUploadDocumentMutation,
  useUploadWebsiteMutation,
} from "~/store/apis/chatSlice";
import { cn } from "~/lib/utils";

const statusStyles = {
  ready: "bg-green-100 text-green-700 border-green-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  error: "bg-red-100 text-red-700 border-red-200",
};

const getSourceId = (response) => response?.data?.source_id || response?.source_id;

const KnowledgeBase = () => {
  const [title, setTitle] = useState("");
  const [knowledgeType, setKnowledgeType] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [sourceId, setSourceId] = useState("");
  const [selectedSlug, setSelectedSlug] = useState("");
  const [pageType, setPageType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const notifiedStatusRef = useRef("");

  const [uploadDocument, { isLoading: isUploadingFile }] =
    useUploadDocumentMutation();
  const [uploadWebsite, { isLoading: isUploadingUrl }] =
    useUploadWebsiteMutation();

  const {
    data: progressResponse,
    isFetching: isFetchingProgress,
  } = useGetKnowledgeProgressQuery(sourceId, {
    skip: !sourceId,
    pollingInterval: sourceId ? 3000 : 0,
  });

  const {
    data: wikiResponse,
    isLoading: isLoadingWiki,
    isFetching: isFetchingWiki,
    refetch: refetchWiki,
  } = useGetWikiPagesQuery({ limit: 100, pageType: pageType || undefined });

  const { data: pageResponse, isFetching: isFetchingPage } =
    useGetWikiPageQuery(selectedSlug, { skip: !selectedSlug });

  const progress = progressResponse?.data;
  const wikiPages = useMemo(() => wikiResponse?.data || [], [wikiResponse]);
  const selectedPage = pageResponse?.data;
  const isUploading = isUploadingFile || isUploadingUrl;

  const filteredPages = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return wikiPages;
    return wikiPages.filter((page) =>
      [page.title, page.slug, page.summary, page.page_type]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(keyword)),
    );
  }, [searchTerm, wikiPages]);

  useEffect(() => {
    if (!progress) return;
    const statusKey = `${progress.source_id}:${progress.status}`;
    if (notifiedStatusRef.current === statusKey) return;

    if (progress.status === "ready") {
      toast.success("Knowledge source is ready.");
      refetchWiki();
      notifiedStatusRef.current = statusKey;
    }
    if (progress.status === "error") {
      toast.error(progress.progress_message || "Knowledge import failed.");
      notifiedStatusRef.current = statusKey;
    }
  }, [progress, refetchWiki]);

  const handleFileImport = async (event) => {
    event.preventDefault();
    if (!file) {
      toast.error("Please choose a document file.");
      return;
    }

    try {
      const result = await uploadDocument({
        file,
        title: title.trim(),
        knowledgeType: knowledgeType.trim(),
      }).unwrap();
      const nextSourceId = getSourceId(result);
      setSourceId(nextSourceId || "");
      setFile(null);
      toast.success("Document queued for ingestion.");
    } catch (error) {
      toast.error(error?.data?.message || "Cannot import document.");
    }
  };

  const handleUrlImport = async (event) => {
    event.preventDefault();
    if (!url.trim()) {
      toast.error("Please enter a source URL.");
      return;
    }

    try {
      const result = await uploadWebsite({
        url: url.trim(),
        title: title.trim(),
        knowledgeType: knowledgeType.trim(),
      }).unwrap();
      const nextSourceId = getSourceId(result);
      setSourceId(nextSourceId || "");
      setUrl("");
      toast.success("URL queued for ingestion.");
    } catch (error) {
      toast.error(error?.data?.message || "Cannot import URL.");
    }
  };

  const renderStatusIcon = () => {
    if (!progress) return <BookOpen className="w-4 h-4" />;
    if (progress.status === "ready") return <CheckCircle2 className="w-4 h-4" />;
    if (progress.status === "error") return <XCircle className="w-4 h-4" />;
    return <Loader2 className="w-4 h-4 animate-spin" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            Knowledge Base
          </h2>
          <p className="text-sm text-muted-foreground">
            Import historical documents and browse AI-generated wiki pages.
          </p>
        </div>
        <Button variant="outline" onClick={refetchWiki} disabled={isFetchingWiki}>
          <RefreshCw className={cn("w-4 h-4", isFetchingWiki && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="rounded-lg border border-border bg-card p-4 space-y-4">
          <div>
            <h3 className="font-semibold text-foreground">Import source</h3>
            <p className="text-sm text-muted-foreground">
              PDF, DOCX, TXT, HTML, Markdown, or a public URL.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Source title"
            />
            <Input
              value={knowledgeType}
              onChange={(event) => setKnowledgeType(event.target.value)}
              placeholder="Knowledge type slug"
            />
          </div>

          <form onSubmit={handleFileImport} className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              Document file
            </label>
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.html,.htm,.md"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
            <Button type="submit" disabled={isUploading || !file}>
              {isUploadingFile ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileUp className="w-4 h-4" />
              )}
              Upload document
            </Button>
          </form>

          <form onSubmit={handleUrlImport} className="space-y-3 border-t border-border pt-4">
            <label className="block text-sm font-medium text-foreground">
              Website URL
            </label>
            <div className="flex gap-2">
              <Input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://..."
              />
              <Button type="submit" disabled={isUploading || !url.trim()}>
                {isUploadingUrl ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LinkIcon className="w-4 h-4" />
                )}
                Import
              </Button>
            </div>
          </form>

          <div className="rounded-md border border-border bg-muted/30 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                {renderStatusIcon()}
                <span>{progress?.status || "No active import"}</span>
              </div>
              {isFetchingProgress && (
                <span className="text-xs text-muted-foreground">Polling...</span>
              )}
            </div>
            {progress && (
              <div className="mt-3 space-y-2">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-heritage transition-all"
                    style={{ width: `${Math.min(progress.progress || 0, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {progress.progress_message || "Waiting for worker..."}
                </p>
                <p className="text-xs text-muted-foreground">
                  Wiki pages: {progress.wiki_page_count || 0} · Source pages:{" "}
                  {progress.page_count || 0}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search wiki pages"
                className="pl-9"
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={pageType}
              onChange={(event) => setPageType(event.target.value)}
            >
              <option value="">All types</option>
              <option value="entity">Entity</option>
              <option value="concept">Concept</option>
              <option value="topic">Topic</option>
              <option value="source">Source</option>
            </select>
          </div>

          <div className="max-h-[520px] overflow-y-auto rounded-md border border-border">
            {isLoadingWiki ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : filteredPages.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No wiki pages found.
              </div>
            ) : (
              filteredPages.map((page) => (
                <button
                  key={page.slug}
                  type="button"
                  onClick={() => setSelectedSlug(page.slug)}
                  className={cn(
                    "block w-full border-b border-border p-3 text-left last:border-b-0 hover:bg-accent/50",
                    selectedSlug === page.slug && "bg-heritage-light/50",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{page.title}</p>
                      <p className="text-xs text-muted-foreground">{page.slug}</p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-xs",
                        statusStyles.ready,
                      )}
                    >
                      {page.page_type}
                    </span>
                  </div>
                  {page.summary && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {page.summary}
                    </p>
                  )}
                </button>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-foreground">Wiki page detail</h3>
            <p className="text-sm text-muted-foreground">
              {selectedSlug || "Select a wiki page to inspect its content."}
            </p>
          </div>
          {selectedPage?.slug && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <ExternalLink className="w-3.5 h-3.5" />
              {selectedPage.source_count || 0} sources
            </span>
          )}
        </div>

        {isFetchingPage ? (
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : selectedPage ? (
          <div className="space-y-3">
            <div>
              <h4 className="text-lg font-semibold text-foreground">
                {selectedPage.title}
              </h4>
              <p className="text-sm text-muted-foreground">
                {selectedPage.summary}
              </p>
            </div>
            <Textarea
              readOnly
              value={selectedPage.content_md || ""}
              className="min-h-[320px] font-mono text-xs leading-relaxed"
            />
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Wiki content will appear here.
          </div>
        )}
      </section>
    </div>
  );
};

export default KnowledgeBase;
