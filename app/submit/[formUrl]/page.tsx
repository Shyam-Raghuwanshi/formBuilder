import { GetFormContentByUrl, CheckUserSubmission } from "@/actions/form";
import { FormElementInstance } from "@/components/FormElements";
import Error from "@/components/FormNotFound";
import FormSubmitComponent from "@/components/FormSubmitComponent";
import { Button } from "@/components/ui/button";
import { currentUser } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

async function SubmitPage({
  params,
}: {
  params: {
    formUrl: string;
  };
}) {

  const form = await GetFormContentByUrl(params.formUrl);
  const user = await currentUser();
  if (!form) {
    return <Error />;
  }

  const isUserSubmitted = await CheckUserSubmission({ url: params.formUrl, userId: user?.emailAddresses[0].emailAddress as string });


  if (isUserSubmitted) {
    return (<div className="flex w-full h-full flex-col items-center justify-center gap-4">
      <h2 className="text-green-400 text-4xl">You already Submit this form!</h2>
      <Button asChild>
        <Link href={"/"}>Go back to home</Link>
      </Button>
    </div>)
  }

  const formContent = JSON.parse(form?.content) as FormElementInstance[];

  return <FormSubmitComponent formUrl={params.formUrl} content={formContent} form={form} id={params.formUrl} />;
}

export default SubmitPage;
