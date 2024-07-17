"use client"
import { useUser } from '@clerk/nextjs'
import { ArrowLeft, SquareArrowOutUpRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import FormUi from '../_components/FormUi'
import Controller from '../_components/Controller'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { GetFormById, PublishForm, UpdateBg, updateJsonForm, UpdateStyle, UpdateTheme } from '@/actions/form';
import Error from '@/components/FormNotFound';
import { toast } from '@/components/ui/use-toast';
import PublishAIFormBtn from '@/components/PublishAIForm';
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';
import Confetti from "react-confetti";
import { Input } from '@/components/ui/input'

function EditForm({ params }: { params: { id: string } }) {
  const { user } = useUser();
  const [jsonForm, setJsonForm] = useState([]);
  const router = useRouter();
  const [updateTrigger, setUpdateTrigger] = useState<number>();
  const [record, setRecord] = useState<any>([]);

  const [selectedTheme, setSelectedTheme] = useState<any>('light');
  const [selectedBackground, setSelectedBackground] = useState<any>();
  const [selectedStyle, setSelectedStyle] = useState<any>();
  const [form, setForm] = useState<any>()
  useEffect(() => {
    params.id && GetFormData();

  }, [user, params])



  const GetFormData = async () => {

    const result = await GetFormById(parseInt(params.id))
    setRecord(result)
    setJsonForm(JSON.parse(result?.content || "{}"))
    setSelectedBackground(result?.background)
    setSelectedTheme(result?.theme)
    setSelectedStyle(JSON.parse(result?.style || ""))
  }

  useEffect(() => {
    if (updateTrigger) {
      setJsonForm(jsonForm);
      updateJsonFormInDb();
    }
  }, [updateTrigger])

  const onFieldUpdate = (value: any, index: any) => {
    // jsonForm.fields[index].label = value.label;
    // jsonForm.fields[index].placeholder = value.placeholder;
    // setUpdateTrigger(Date.now())
  }

  const updateJsonFormInDb = async () => {
    const result = await updateJsonForm({ id: parseInt(params.id), content: JSON.stringify(jsonForm) })
    if (result) {
      toast({
        title: "Success",
        description: "Form updated successfully",
      });
    }
  }

  const deleteField = async (indexToRemove: any) => {
    //@ts-ignore
    const result = jsonForm.fields.filter((item, index) => index != indexToRemove)
    //@ts-ignore
    jsonForm.fields = result;
    setUpdateTrigger(Date.now())
  }


  const handlePublish = async () => {
    const res = await PublishForm(parseInt(params.id));
    if (res) {
      toast({
        title: "Success",
        description: "Form updated successfully",
      });
    }
  }

  useEffect(() => {
    (async () => {
      const { id } = params;
      setForm(await GetFormById(Number(id)));
    })();
  }, [handlePublish]);

  let shareUrl = "";
  if (typeof window !== "undefined") {
    shareUrl = `${window.location.origin}/submit/${form?.shareURL}`;
  }

  if (!params.id) {
    return <Error />;
  }

  if (form?.published) {
    return (
      <>
        <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={1000} />
        <div className="flex flex-col items-center justify-center h-full w-full">
          <div className="max-w-md">
            <h1 className="text-center text-4xl font-bold text-primary border-b pb-2 mb-10">
              🎊🎊 Form Published 🎊🎊
            </h1>
            <h2 className="text-2xl">Share this form</h2>
            <h3 className="text-xl text-muted-foreground border-b pb-10">
              Anyone with the link can view and submit the form
            </h3>
            <div className="my-4 flex flex-col gap-2 items-center w-full border-b pb-4">
              <Input className="w-full" readOnly value={shareUrl} />
              <Button
                className="mt-2 w-full"
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  toast({
                    title: "Copied!",
                    description: "Link copied to clipboard",
                  });
                }}
              >
                Copy link
              </Button>
            </div>
            <div className="flex justify-between">
              <Button variant={"link"} asChild>
                <Link href={"/"} className="gap-2">
                  <BsArrowLeft />
                  Go back home
                </Link>
              </Button>
              <Button variant={"link"} asChild>
                <Link href={`/forms/${form.id}`} className="gap-2">
                  Form details
                  <BsArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }


  return (
    <div className='p-10'>
      <div className='flex justify-between items-center'>
        <h2 className='flex gap-2 items-center my-5 cursor-pointer
        hover:font-bold ' onClick={() => router.replace("/")}>
          <ArrowLeft /> Home
        </h2>
        <div className='flex gap-2'>
          <Link href={'/ai-form/' + record?.id} target="_blank">
            <Button className="flex gap-2" > <SquareArrowOutUpRight className='h-5 w-5' /> Live Preview</Button>
          </Link>
          {/* <Button onClick={handlePublish} className="flex gap-2 bg-green-600 hover:bg-green-700"> <Share2 /> Publish</Button> */}

          <PublishAIFormBtn id={parseInt(params.id)} />

        </div>
      </div>
      <div className='grid grid-cols-1  md:grid-cols-3 gap-5'>
        <div className='p-5 border rounded-lg shadow-md'>
          <Controller
            id={params.id}
            selectedTheme={async (value: any) => {
              setSelectedTheme(value)
              await UpdateTheme({ id: parseInt(params.id), theme: value })
            }}
            selectedBackground={async (value: any) => {
              setSelectedBackground(value)
              await UpdateBg({ id: parseInt(params.id), bgColour: value })
            }
            }
            selectedStyle={async (value: any) => {
              console.log(value)
              await UpdateStyle({ id: parseInt(params.id), style: JSON.stringify(value) })
            }}

          />
        </div>
        <div className='md:col-span-2 border rounded-lg p-5 
             flex items-center justify-center'
          style={{
            backgroundImage: selectedBackground
          }}
        >
          <FormUi jsonForm={jsonForm}
            selectedTheme={selectedTheme}
            selectedStyle={selectedStyle}
            onFieldUpdate={onFieldUpdate}
            deleteField={(index: any) => deleteField(index)}
          />
        </div>
      </div>
    </div>
  )
}

export default EditForm