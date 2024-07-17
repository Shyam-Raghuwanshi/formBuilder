import { Input } from '@/components/ui/input'
import React, { useRef, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from '@/components/ui/button'
import FieldEdit from './FieldEdit'
import {  useUser } from '@clerk/nextjs'

function FormUi({ jsonForm, selectedTheme, selectedStyle,
  onFieldUpdate, deleteField, editable = true, formId = 0, enabledSignIn = false }: {
    jsonForm?: any, selectedTheme?: any, selectedStyle?: any,
    onFieldUpdate?: any, deleteField?: any, editable?: any, formId?: any, enabledSignIn?: any
  }) {
  const [formData, setFormData] = useState();
  let formRef = useRef();
  const { user, isSignedIn } = useUser();
  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setFormData({
      //@ts-ignore
      ...formData,
      [name]: value
    })
  }

  const hadleSelectChange = (name: any, value: any) => {
    setFormData({
      //@ts-ignore
      ...formData,
      [name]: value
    })
  }

  const onFormSubmit = async (event: any) => {
    event.preventDefault()

    // const result = await db.insert(userResponses)
    //   .values({
    //     jsonResponse: formData,
    //     createdAt: moment().format('DD/MM/yyy'),
    //     formRef: formId
    //   })

    // if (result) {
    //   formRef.reset();
    //   toast('Response Submitted Successfully !')
    // }
    // else {
    //   toast('Error while saving your form !')

    // }
  }

  const handleCheckboxChange = (fieldName: any, itemName: any, value: any) => {

    const list = formData?.[fieldName] ? formData?.[fieldName] : [];

    if (value) {
      //@ts-ignore
      list.push({
        label: itemName,
        value: value
      })
      setFormData({
        //@ts-ignore
        ...formData,
        [fieldName]: list
      })
    } else {
      //@ts-ignore
      const result = list.filter((item) => item.label == itemName);
      setFormData({
        //@ts-ignore
        ...formData,
        [fieldName]: result
      })
    }

  }

  return (
    <form
      //@ts-ignore
      ref={(e) => formRef = e}
      onSubmit={onFormSubmit}
      className='border p-5 md:w-[600px] rounded-lg'
      data-theme={selectedTheme}
      style={{
        //@ts-ignore
        boxShadow: selectedStyle?.key == 'boxshadow' && '5px 5px 0px black',
        border: selectedStyle?.key == 'border' && selectedStyle.value
      }}
    >

      <h2 className='font-bold text-center text-2xl'>{jsonForm?.formTitle}</h2>
      <h2 className='text-sm text-gray-400 text-center'>{jsonForm?.formHeading}</h2>

      {jsonForm?.fields?.map((field: any, index: number) => (
        <div key={index} className='flex items-center gap-2'>
          {field.type == 'select' ?
            <div className='my-3 w-full'>
              <label className='text-xs text-gray-500'>{field.label}</label>

              <Select required={field?.required}
                onValueChange={(v) => hadleSelectChange(field.fieldName, v)}>
                <SelectTrigger className="w-full bg-transparent">
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((item: any, index: number) => (
                    <SelectItem key={index} value={item.label ? item.label : item}>{item.label ? item.label : item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            : field.type == 'radio' ?
              <div className='w-full my-3'>
                <label className='text-xs text-gray-500'>{field.label}</label>

                <RadioGroup required={field?.required} >
                  {field.options.map((item: any, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={item.label} id={item.label}
                        onClick={() => hadleSelectChange(field.fieldName, item.label)}
                      />
                      <Label htmlFor={item.label}>{item.label}</Label>
                    </div>
                  ))}


                </RadioGroup>

              </div>
              : field.type == 'checkbox' ?
                <div className='my-3 w-full'>
                  {/* <label className='text-xs text-gray-500'>{field?.label}</label> */}
                  {field?.options ? field?.options?.map((item: any, index: number) => (
                    <div key={index} className='flex gap-2 items-center'>
                      <Checkbox className='inline-block'
                        onCheckedChange={(v) => handleCheckboxChange(field?.label, item.label ? item.label : item, v)} />
                      <h2>{item.label ? item.label : item}</h2>

                    </div>
                  ))
                    :
                    <div className='flex gap-2 items-center'>
                      <Checkbox className='inline-block' required={field.required} />
                      <h2>{field.label}</h2>
                    </div>
                  }
                </div>

                : (field?.type !== "file" && <div className='my-3 w-full'>
                  <label className='text-xs text-gray-500'>{field.label}</label>
                  <Input type={field?.type}
                    placeholder={field.placeholder}
                    name={field.fieldName}
                    className="bg-transparent inline-block"
                    required={field?.required}
                    onChange={(e) => handleInputChange(e)}
                  />
                </div>)}

          {editable && field?.type !== "file" && <div>
            <FieldEdit defaultValue={field}
              onUpdate={(value: any) => onFieldUpdate(value, index)}
              deleteField={() => deleteField(index)}
            />
          </div>}
        </div>
      ))}
      <Button className='w-full'>Submit</Button>

    </form>
  )
}

export default FormUi