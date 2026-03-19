'use client'

import { useState, useRef } from 'react'
import { Upload, Download, FileText, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { parseCsv, processBulkRows, exportResultsToCsv, downloadCsv, type BulkResultRow } from '@/lib/bulk'

const STATUS_ICON = {
  good: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
}

const STATUS_COLOR = {
  good: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400',
}

export function BulkCheckPanel() {
  const [results, setResults] = useState<BulkResultRow[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileUpload(file: File) {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }

    setIsProcessing(true)
    setError(null)
    setFileName(file.name)

    try {
      const text = await file.text()
      const rows = parseCsv(text)

      if (rows.length === 0) {
        setError('No valid rows found. Make sure your CSV has a "title" column header.')
        setIsProcessing(false)
        return
      }

      const scored = processBulkRows(rows)
      setResults(scored)
    } catch {
      setError('Failed to process CSV file. Please check the format.')
    } finally {
      setIsProcessing(false)
    }
  }

  function handleExport() {
    const csv = exportResultsToCsv(results)
    downloadCsv(csv, `seo-bulk-results-${Date.now()}.csv`)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          Bulk CSV Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload area */}
        <div
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault() }}
          onDrop={(e) => {
            e.preventDefault()
            const file = e.dataTransfer.files[0]
            if (file) handleFileUpload(file)
          }}
          role="button"
          aria-label="Upload CSV file"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') fileInputRef.current?.click() }}
        >
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm font-medium">Drop CSV file here or click to upload</p>
          <p className="text-xs text-muted-foreground mt-1">
            Required column: <code className="font-mono">title</code> · Optional:{' '}
            <code className="font-mono">description</code>, <code className="font-mono">url</code>,{' '}
            <code className="font-mono">keyword</code> · Max 500 rows
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file)
            }}
          />
        </div>

        {/* Error state */}
        {error && (
          <div role="alert" className="flex items-center gap-2 text-sm text-destructive">
            <XCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Processing */}
        {isProcessing && (
          <div className="text-center text-sm text-muted-foreground">
            Processing {fileName}...
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {results.length} {results.length === 1 ? 'row' : 'rows'} scored
              </p>
              <Button size="sm" variant="outline" onClick={handleExport} className="gap-1.5">
                <Download className="h-4 w-4" />
                Export Results
              </Button>
            </div>

            {/* Results table */}
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-2 font-medium">Title</th>
                    <th className="text-center p-2 font-medium w-20">Score</th>
                    <th className="text-center p-2 font-medium w-16">Title</th>
                    <th className="text-center p-2 font-medium w-16">Desc</th>
                    <th className="text-center p-2 font-medium w-16">Keyword</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, i) => {
                    const TitleIcon = STATUS_ICON[row.titleStatus]
                    const DescIcon = STATUS_ICON[row.descriptionStatus]
                    const KwIcon = STATUS_ICON[row.keywordStatus]

                    return (
                      <tr key={i} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="p-2 max-w-[200px]">
                          <p className="truncate font-medium">{row.title || 'Untitled'}</p>
                          {row.url && (
                            <p className="text-muted-foreground truncate">{row.url}</p>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          <span
                            className={`font-bold ${
                              row.overallScore >= 80
                                ? 'text-green-600 dark:text-green-400'
                                : row.overallScore >= 50
                                  ? 'text-yellow-600 dark:text-yellow-400'
                                  : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {row.overallScore}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <TitleIcon className={`h-3.5 w-3.5 mx-auto ${STATUS_COLOR[row.titleStatus]}`} />
                        </td>
                        <td className="p-2 text-center">
                          <DescIcon className={`h-3.5 w-3.5 mx-auto ${STATUS_COLOR[row.descriptionStatus]}`} />
                        </td>
                        <td className="p-2 text-center">
                          <KwIcon className={`h-3.5 w-3.5 mx-auto ${STATUS_COLOR[row.keywordStatus]}`} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
