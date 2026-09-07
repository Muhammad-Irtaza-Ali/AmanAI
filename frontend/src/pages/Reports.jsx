import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiFileText, FiDownload, FiPlus, FiEye } from 'react-icons/fi'
import { getReports, createIncident } from '../services/api'
import { SeverityBadge, Spinner } from '../components/common/Card'
import { useTranslation } from '../i18n/useTranslation'

export default function Reports() {
  const { t } = useTranslation()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [formData, setFormData] = useState({
    category: 'Medical',
    severity: 'Medium',
    confidence: 0.8,
    location: '',
    description: '',
    ai_summary: '',
    recommended_action: '',
    language: 'en',
  })

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const data = await getReports()
      setReports(data.incidents || [])
    } catch (err) {
      console.error('Reports fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createIncident(formData)
      setShowForm(false)
      setFormData({
        category: 'Medical', severity: 'Medium', confidence: 0.8,
        location: '', description: '', ai_summary: '', recommended_action: '', language: 'en',
      })
      fetchReports()
    } catch (err) {
      console.error('Incident creation error:', err)
    }
  }

  const exportPDF = (report) => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Incident Report - ${report.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1 { color: #DC2626; border-bottom: 2px solid #DC2626; padding-bottom: 10px; }
          h2 { color: #2563EB; margin-top: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
          td:first-child { font-weight: bold; width: 180px; color: #6b7280; }
          .severity { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; }
          .severity-Critical { background: #FEE2E2; color: #991B1B; }
          .severity-High { background: #FFEDD5; color: #9A3412; }
          .severity-Medium { background: #FEF9C3; color: #854D0E; }
          .severity-Low { background: #D1FAE5; color: #065F46; }
          .disclaimer { margin-top: 30px; padding: 12px; background: #FEF2F2; border-radius: 8px; font-size: 12px; color: #991B1B; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>NIGEHBAAN AI — Incident Report</h1>
        <table>
          <tr><td>Incident ID</td><td>${report.id}</td></tr>
          <tr><td>Date</td><td>${new Date(report.created_at).toLocaleDateString()}</td></tr>
          <tr><td>Time</td><td>${new Date(report.created_at).toLocaleTimeString()}</td></tr>
          <tr><td>Location</td><td>${report.location || 'Not specified'}</td></tr>
          <tr><td>Category</td><td>${report.category}</td></tr>
          <tr><td>Severity</td><td><span class="severity severity-${report.severity}">${report.severity}</span></td></tr>
          <tr><td>Confidence</td><td>${(report.confidence * 100).toFixed(0)}%</td></tr>
        </table>
        <h2>Description</h2>
        <p>${report.description}</p>
        <h2>AI Summary</h2>
        <p>${report.ai_summary || 'No AI summary available.'}</p>
        <h2>Recommended Action</h2>
        <p>${report.recommended_action || 'No specific recommendation.'}</p>
        <div class="disclaimer">
          <strong>Disclaimer:</strong> This report was generated with AI assistance and does not replace
          professional emergency assessment. Always consult with qualified emergency responders.
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const CATEGORIES = [
    'Medical', 'Fire', 'Road Accident', 'Flood', 'Earthquake',
    'Gas Leak', 'Violence', 'Missing Person', 'Other',
  ]
  const SEVERITIES = ['Low', 'Medium', 'High', 'Critical']

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
      <div className="flex items-center justify-between mb-8">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-gray-900 dark:text-white"
        >
          {t('reports.title')}
        </motion.h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          {t('reports.new')}
        </motion.button>
      </div>

      {/* Create Report Form */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="glass-card p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('reports.new_title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('reports.category')}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('reports.severity')}
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="input-field"
              >
                {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('reports.location')}
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input-field"
                placeholder={t('reports.location_ph')}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('reports.description')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows={3}
                required
                placeholder={t('reports.desc_ph')}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('reports.ai_summary')}
              </label>
              <textarea
                value={formData.ai_summary}
                onChange={(e) => setFormData({ ...formData, ai_summary: e.target.value })}
                className="input-field"
                rows={2}
                placeholder={t('reports.ai_summary_ph')}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="submit" className="btn-primary">{t('reports.save')}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
              {t('reports.cancel')}
            </button>
          </div>
        </motion.form>
      )}

      {/* Reports List */}
      {loading ? (
        <Spinner size="lg" />
      ) : reports.length === 0 ? (
        <div className="text-center py-12">
          <FiFileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t('reports.empty')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report, idx) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-5 card-hover"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {report.category}
                    </h3>
                    <SeverityBadge severity={report.severity} />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {report.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                    <span>{report.location || t('reports.no_location')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                    className="p-2 rounded-lg text-gray-400 hover:text-secondary-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                    title={t('reports.view_details')}
                  >
                    <FiEye className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => exportPDF(report)}
                    className="p-2 rounded-lg text-gray-400 hover:text-accent-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                    title={t('reports.export_pdf')}
                  >
                    <FiDownload className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Expanded details */}
              {selectedReport?.id === report.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">{t('reports.id')}</p>
                      <p className="font-mono text-xs text-gray-700 dark:text-gray-300 truncate">
                        {report.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">{t('reports.confidence')}</p>
                      <p className="font-semibold">{(report.confidence * 100).toFixed(0)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{t('reports.language')}</p>
                      <p className="font-semibold uppercase">{report.language}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{t('reports.status')}</p>
                      <p className="font-semibold capitalize">{report.status}</p>
                    </div>
                  </div>
                  {report.ai_summary && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-500 mb-1">{t('reports.ai_summary_label')}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{report.ai_summary}</p>
                    </div>
                  )}
                  {report.recommended_action && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-500 mb-1">{t('reports.recommended')}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{report.recommended_action}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
