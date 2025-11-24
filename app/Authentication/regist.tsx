"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage(){
    const[formData, setFormData] = useState({
        name : "",
        email: "",
        password: ""
    })

    const [loading, setLoading] = useState(false)

    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        setLoading(true)

        try{
            const response = await fetch('/api/auth/regist', {
                method: 'POST',
                headers: {
                    'content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            const result = await response.json()

            if(result.success){
                alert("Registration successful! Please log in.")
                router.push('/login')
            }else{
                alert("Registration failed: " + result.message) 
            }
        }catch(error){
            alert("An error occurred during registration." + error)
        }finally{
            setLoading(false)
        }

    }


    return (
        <div style={{ maxWidth: '400px', margin: '50px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>

        </div>
    )
}