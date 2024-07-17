"use client";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ImSpinner9 } from "react-icons/im";
import { Textarea } from "./ui/textarea";
import { ChatWithAI } from "@/lib/aiModel";
import { Input } from '@/components/ui/input'
import { useRouter } from "next/navigation";
import { CreateAIForm } from "@/actions/form";
import { GiArtificialIntelligence } from "react-icons/gi";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { AIFormSchema, AIFormSchemaType } from "@/schemas/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "./ui/use-toast";

const prompt = "ON the basis of description pleases give form in json format with title, form subheading, form field, form name, placeholder name, and form label, in json format "
export function CreateWithAI() {
    const router = useRouter();

    const form = useForm<AIFormSchemaType>({
        resolver: zodResolver(AIFormSchema),
    });

    async function onSubmit(values: AIFormSchemaType) {
        try {
            const res = await ChatWithAI({ prompt: `Description: ${values.prompt} ${prompt}` });
            const formId = await CreateAIForm({ name: values.name, description: values.description, content:JSON.stringify(JSON.parse(res.response.text())) });
            router.replace(`/ai-form/${formId}`);
            router.refresh();
            toast({
                title: "Success",
                description: "Form created successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong, please try again later",
                variant: "destructive",
            });
        }
    }

    return (
        <Dialog >
            <DialogTrigger asChild>
                <Button
                    variant={"outline"}
                    className="group border border-primary/20 h-[190px] items-center justify-center flex flex-col hover:border-primary hover:cursor-pointer border-dashed gap-4 "
                >
                    <GiArtificialIntelligence className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                    <p className="font-bold text-xl text-muted-foreground group-hover:text-primary">Create With AI</p>
                </Button>
            </DialogTrigger>
            <DialogContent className="">
                <DialogHeader>
                    <DialogTitle>Create Form</DialogTitle>
                    <DialogDescription>
                        Create form using AI.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea rows={5} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="prompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prompt</FormLabel>
                                    <FormControl>
                                        <Textarea rows={10} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    </form>
                </Form>
                <DialogFooter>
                    <Button className="w-full" onClick={form.handleSubmit(onSubmit)} disabled={form.formState.isSubmitted} type="button" variant="secondary">
                        {!form.formState.isSubmitting && <span>Generate</span>}
                        {form.formState.isSubmitting && <ImSpinner9 className="animate-spin" />}
                    </Button>
                </DialogFooter>
            </DialogContent >
        </Dialog >

    )
}
