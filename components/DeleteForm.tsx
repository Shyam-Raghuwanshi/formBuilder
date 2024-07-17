"use client"
import React from 'react'
import { FaTrash } from 'react-icons/fa'
import { DeleteForm } from "@/actions/form";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
function DeleteFormButton({ id }: { id: number }) {
    const router = useRouter();
    const handleFormDelete = async () => {
        try {
            const res = await DeleteForm(id);
            if (!res.success) {
                toast({
                    className: "bg-red-500 text-white",
                    title: "Error",
                    description: "Something went wrong",
                });
                return
            }
            toast({
                title: "Success",
                description: "Form deleted successfully",
            });
            router.refresh();
        } catch (error) {
            toast({
                className: "bg-red-500 text-white",
                title: "Error",
                description: "Something went wrong",
            });
        }
    }

    return (
        <FaTrash className='cursor-pointer' onClick={() => {
            "use client"
            handleFormDelete()
        }} />
    )
}

export default DeleteFormButton;