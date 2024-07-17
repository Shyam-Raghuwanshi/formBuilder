"use client";

import React, { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { FormElementInstance, FormElements } from "./FormElements";
import { Button } from "./ui/button";
import { HiCursorClick } from "react-icons/hi";
import { toast } from "./ui/use-toast";
import { ImSpinner2 } from "react-icons/im";
import { SubmitForm } from "@/actions/form";
import { useUser } from "@clerk/nextjs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
function FormSubmitComponent({ formUrl, content, form, id }: { content: FormElementInstance[]; formUrl: string, form: any, id: string }) {
  const formValues = useRef<{ [key: string]: string }>({});
  const formErrors = useRef<{ [key: string]: boolean }>({});
  const [renderKey, setRenderKey] = useState(new Date().getTime());
  const { user } = useUser();
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();
  const [selectedTheme, setSelectedTheme] = useState<any>('light');
  const [selectedBackground, setSelectedBackground] = useState<any>();
  const [selectedStyle, setSelectedStyle] = useState<any>();
  const [formData, setFormData] = useState();
  const router = useRouter();
  let formRef = useRef();

  useEffect(() => {
    GetFormData();
  }, [user])


  const hadleSelectChange = (name: any, value: any) => {
    setFormData({
      //@ts-ignore
      ...formData,
      [name]: value
    })
  }

  const onFormSubmit = async (event: any) => {
    event.preventDefault()
    const res = await SubmitForm({ formUrl, content: JSON.stringify(formData), userId: user?.primaryEmailAddress?.emailAddress as string });

    if (res) {
      toast({
        title: "Success",
        description: "Form Submited successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Something went wrong, please try again later",
        variant: "destructive",
      });
    }
    router.refresh();
  }

  const GetFormData = async () => {
    setSelectedBackground(form?.background)
    setSelectedTheme(form?.theme)
    setSelectedStyle(JSON.parse(form?.style || ""))
  }

  const validateForm: () => boolean = useCallback(() => {
    for (const field of content) {
      const actualValue = formValues.current[field.id] || "";
      const valid = FormElements[field.type].validate(field, actualValue);

      if (!valid) {
        formErrors.current[field.id] = true;
      }
    }

    if (Object.keys(formErrors.current).length > 0) {
      return false;
    }

    return true;
  }, [content]);

  const submitValue = useCallback((key: string, value: string) => {
    formValues.current[key] = value;
  }, []);

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

  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setFormData({
      //@ts-ignore
      ...formData,
      [name]: value
    })
  }

  const submitForm = async () => {
    formErrors.current = {};
    const validForm = validateForm();
    if (!validForm) {
      setRenderKey(new Date().getTime());
      toast({
        title: "Error",
        description: "please check the form for errors",
        variant: "destructive",
      });
      return;
    }

    try {
      const jsonContent = JSON.stringify(formValues.current);
      user?.primaryEmailAddress?.emailAddress && await SubmitForm({ formUrl, content: jsonContent, userId: user?.primaryEmailAddress?.emailAddress as string });
      setSubmitted(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  if (submitted) {
    return (
      <div className="flex justify-center w-full h-full items-center p-8">
        <div className="max-w-[620px] flex flex-col gap-4 flex-grow bg-background w-full p-8 overflow-y-auto border shadow-xl shadow-blue-700 rounded">
          <h1 className="text-2xl font-bold">Form submitted</h1>
          <p className="text-muted-foreground">Thank you for submitting the form, you can close this page now.</p>
        </div>
      </div>
    );
  }

  //@ts-ignore
  if (form?.createdByAI) {
    //@ts-ignore
    const jsonForm = JSON.parse(form.content);
    return (
      <div className="w-full flex justify-center mt-8 pb-5">
        <form
          ref={(e: any) => formRef = e}
          onSubmit={onFormSubmit}
          className='border p-5 md:w-[600px] rounded-lg shadow-xl shadow-blue-700'
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
                    onValueChange={(v) => hadleSelectChange(field.name, v)}
                  >
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
                            onClick={() => hadleSelectChange(field.name, item.label)}
                          />
                          <Label htmlFor={item.label}>{item.label}</Label>
                        </div>
                      ))}


                    </RadioGroup>

                  </div>
                  : field.type == 'checkbox' ?
                    <div className='my-3 w-full'>
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
                        name={field.name}
                        className="bg-transparent inline-block"
                        required={field?.required}
                        onChange={(e) => handleInputChange(e)}
                      />
                    </div>)}
            </div>
          ))}
          <Button onSubmit={onFormSubmit} className='w-full'>Submit</Button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex justify-center w-full h-full items-center p-8">
      <div
        key={renderKey}
        className="max-w-[620px] flex flex-col gap-4 flex-grow bg-background w-full p-8 overflow-y-auto border shadow-xl shadow-blue-700 rounded"
      >
        {content.map((element) => {
          const FormElement = FormElements[element.type].formComponent;
          return (
            <FormElement
              key={element.id}
              elementInstance={element}
              submitValue={submitValue}
              isInvalid={formErrors.current[element.id]}
              defaultValue={formValues.current[element.id]}
            />
          );
        })}
        <Button
          className="mt-8"
          onClick={() => {
            startTransition(submitForm);
          }}
          disabled={pending}
        >
          {!pending && (
            <>
              <HiCursorClick className="mr-2" />
              Submit
            </>
          )}
          {pending && <ImSpinner2 className="animate-spin" />}
        </Button>
      </div>
    </div>
  );
}

export default FormSubmitComponent;
