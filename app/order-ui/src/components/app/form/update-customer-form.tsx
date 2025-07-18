import React from 'react'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
  Button,
  Input,
  ScrollArea,
} from '@/components/ui'
import { useUpdateUserSchema, TUpdateUserSchema } from '@/schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { IUpdateUserRequest, IUserInfo } from '@/types'
import { useUpdateUser } from '@/hooks'
import { showToast } from '@/utils'
import { DatePicker } from '../picker'

interface IFormUpdateCustomerProps {
  customer: IUserInfo
  onSubmit: (isOpen: boolean) => void
}

export const UpdateCustomerForm: React.FC<IFormUpdateCustomerProps> = ({
  customer, onSubmit,
}) => {
  const queryClient = useQueryClient()
  const { t } = useTranslation(['customer'])
  const { mutate: updateUser, isPending } = useUpdateUser()

  const form = useForm<TUpdateUserSchema>({
    resolver: zodResolver(useUpdateUserSchema()),
    defaultValues: {
      slug: customer.slug,
      // phonenumber: customer.phonenumber,
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      dob: customer.dob || undefined,
      email: customer.email || '',
      address: customer.address || '',
      // branch: customer?.branch?.slug || '',
    },
  })

  const handleSubmit = (data: IUpdateUserRequest) => {
    updateUser(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['users'],
          exact: false,
          refetchType: 'all'
        })
        onSubmit(false)
        form.reset()
        showToast(t('toast.updateUserSuccess'))
      },
    })
  }

  const formFields = {
    // phonenumber: (
    //   <FormField
    //     control={form.control}
    //     name="phonenumber"
    //     render={({ field }) => (
    //       <FormItem>
    //         <FormLabel>{t('customer.phoneNumber')}</FormLabel>
    //         <FormControl>
    //           <Input placeholder={t('customer.enterPhoneNumber')} {...field} />
    //         </FormControl>
    //         <FormMessage />
    //       </FormItem>
    //     )}
    //   />
    // ),
    firstName: (
      <FormField
        control={form.control}
        name="firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('customer.firstName')}</FormLabel>
            <FormControl>
              <Input placeholder={t('customer.enterFirstName')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    lastName: (
      <FormField
        control={form.control}
        name="lastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('customer.lastName')}</FormLabel>
            <FormControl>
              <Input placeholder={t('customer.enterLastName')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    dob: (
      <FormField
        control={form.control}
        name="dob"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('customer.dob')}</FormLabel>
            <FormControl>
              <DatePicker
                date={field.value}
                onSelect={(selectedDate) => {
                  field.onChange(selectedDate)
                }}
                validateDate={(date) => date <= new Date()}
                disableFutureDate
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    email: (
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('customer.email')}</FormLabel>
            <FormControl>
              <Input placeholder={t('customer.enterEmail')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    address: (
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('customer.address')}</FormLabel>
            <FormControl>
              <Input placeholder={t('customer.enterAddress')} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    ),
    // branch: (
    //   <FormField
    //     control={form.control}
    //     name="branch"
    //     render={({ field }) => (
    //       <FormItem>
    //         <FormLabel>{t('customer.branch')}</FormLabel>
    //         <FormControl>
    //           <BranchSelect defaultValue={customer?.branch?.slug} {...field} />
    //         </FormControl>
    //         <FormMessage />
    //       </FormItem>
    //     )}
    //   />
    // ),
  }

  return (
    <div className="mt-3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <ScrollArea className="h-[22rem] flex-1 pr-4 pb-4">
            <div className="grid grid-cols-1 gap-2 px-1">
              {Object.keys(formFields).map((key) => (
                <React.Fragment key={key}>
                  {formFields[key as keyof typeof formFields]}
                </React.Fragment>
              ))}
            </div>
          </ScrollArea>
          <div className="flex justify-end">
            <Button disabled={isPending} className="flex justify-end" type="submit">
              {isPending ? <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('customer.update')}
              </div> : t('customer.update')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
