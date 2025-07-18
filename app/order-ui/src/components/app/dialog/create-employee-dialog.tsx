import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PlusCircledIcon } from '@radix-ui/react-icons'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'

import { CreateEmployeeForm } from '@/components/app/form'

export default function CreateEmployeeDialog() {
  const { t } = useTranslation(['employee'])
  const [isOpen, setIsOpen] = useState(false)
  const handleSubmit = (isOpen: boolean) => {
    setIsOpen(isOpen)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1 text-xs" onClick={() => setIsOpen(true)}>
          <PlusCircledIcon className="icon" />
          {t('employee.create')}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[90%] rounded-md p-0 sm:max-w-[50%]">
        <DialogHeader className="p-4">
          <DialogTitle>{t('employee.create')}</DialogTitle>
          <DialogDescription>
            {t('employee.createDescription')}
          </DialogDescription>
        </DialogHeader>
        <CreateEmployeeForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
