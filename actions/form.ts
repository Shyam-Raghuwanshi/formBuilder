"use server";

import prisma from "@/lib/prisma";
import { AIFormSchemaType, formSchema, formSchemaType } from "@/schemas/form";
import { currentUser } from "@clerk/nextjs";

class UserNotFoundErr extends Error { }

export async function GetFormStats() {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  const stats = await prisma.form.aggregate({
    where: {
      userId: user.id,
    },
    _sum: {
      visits: true,
      submissions: true,
    },
  });

  const visits = stats._sum.visits || 0;
  const submissions = stats._sum.submissions || 0;

  let submissionRate = 0;

  if (visits > 0) {
    submissionRate = (submissions / visits) * 100;
  }

  const bounceRate = 100 - submissionRate;

  return {
    visits,
    submissions,
    submissionRate,
    bounceRate,
  };
}

export async function CreateForm(data: formSchemaType) {
  const validation = formSchema.safeParse(data);
  if (!validation.success) {
    throw new Error("form not valid");
  }

  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  const { name, description } = data;

  const form = await prisma.form.create({
    data: {
      userId: user.id,
      name,
      description,
    },
  });

  if (!form) {
    throw new Error("something went wrong");
  }

  return form.id;
}

export async function CreateAIForm({ name, description, content }: { name: string, description?: string, content: string }) {

  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  const form = await prisma.form.create({
    data: {
      userId: user.id,
      name,
      description,
      content,
      createdByAI: true,
      style: JSON.stringify({ "id": 1, "name": "default", "img": "/default.png", "value": "none", "key": "1px" })
    },
  });

  if (!form) {
    throw new Error("something went wrong");
  }

  return form.id;
}

export async function GetForms() {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  return await prisma.form.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}


export async function GetFormById(id: number) {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  return await prisma.form.findUnique({
    where: {
      userId: user.id,
      id,
    },
  });
}

export async function UpdateFormContent(
  { id, jsonContent, published }:
    { id: number, jsonContent: string, published?: boolean }
) {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  return await prisma.form.update({
    where: {
      userId: user.id,
      id,
    },
    data: {
      published,
      content: jsonContent,
    },
  });
}
export async function GetSocialAuthOption(
  { id, }:
    { id: number, }
) {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  return await prisma.form.findUnique({
    where: {
      userId: user.id,
      id,
    },
    select: {
      enabledSignIn: true,
    },
  });
}

export async function ToggleSocialAuth(
  { id, socialAuth, }:
    { id: number, socialAuth: boolean }
) {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  return await prisma.form.update({
    where: {
      userId: user.id,
      id,
    },
    data: {
      enabledSignIn: socialAuth,
    },
  });
}


export async function updateJsonForm(
  { id, content, }:
    { id: number, content: string }
) {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  return await prisma.form.update({
    where: {
      userId: user.id,
      id,
    },
    data: {
      content,
    },
  });
}

export async function UpdateBg(
  { id, bgColour, }:
    { id: number, bgColour: string }
) {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  return await prisma.form.update({
    where: {
      userId: user.id,
      id,
    },
    data: {
      background: bgColour,
    },
  });
}

export async function UpdateStyle(
  { id, style, }:
    { id: number, style: string }
) {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  return await prisma.form.update({
    where: {
      userId: user.id,
      id,
    },
    data: {
      style,
    },
  });
}

export async function UpdateTheme(
  { id, theme, }:
    { id: number, theme: string }
) {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  return await prisma.form.update({
    where: {
      userId: user.id,
      id,
    },
    data: {
      theme,
    },
  });
}


export async function PublishForm(id: number) {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  return await prisma.form.update({
    data: {
      published: true,
    },
    where: {
      userId: user.id,
      id,
    },
  });
}

export async function GetFormContentByUrl(formUrl: string) {
  return await prisma.form.findFirst({
    where: {
      shareURL: formUrl,
    },
  });
}

export async function SubmitForm({ formUrl, content, userId }: { formUrl: string, content: string, userId: string }) {
  return await prisma.form.update({
    data: {
      submissions: {
        increment: 1,
      },
      FormSubmissions: {
        create: {
          content,
          userId
        },
      },
    },
    where: {
      shareURL: formUrl,
      published: true,
    },
  });
}

export async function GetFormWithSubmissions(id: number) {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  return await prisma.form.findUnique({
    where: {
      userId: user.id,
      id,
    },
    include: {
      FormSubmissions: true,
    },
  });
}

export async function DeleteForm(id: number) {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }

  try {
    await prisma.form.delete({
      where: {
        id
      }
    })

    return { message: "Form Deleted Successfully!", success: true }

  } catch (error) {
    return { message: "Something went wrong", success: false }
  }
}


export async function CheckUserSubmission({ url, userId }: { url: string, userId: string }) {
  return await prisma.formSubmissions.findFirst({
    where: {
      userId,
      form: {
        shareURL: url
      }
    }
  })
}

export async function GetCurrentUserEmail() {
  const user = await currentUser();
  if (!user) {
    throw new UserNotFoundErr();
  }
  return user.emailAddresses[0].emailAddress;
}