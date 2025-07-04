import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'

export default function LoadingState() {
  const { t } = useTranslation(['common'])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-5xl p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-lg text-muted-foreground dark:text-gray-400">
              {t('common.loading', 'Loading gift card details...')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
