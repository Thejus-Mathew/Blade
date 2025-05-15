"use server"

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const loginAction =async (username,password) => {    
    if(username === process.env.USERNAMEL && password === process.env.PASSWORD){
        const cookieStore = await cookies()
        const token = jwt.sign(
            { status:true },
            process.env.JWT_SECRET,
            { expiresIn: 30000 }
        );
        cookieStore.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 30000,
            path: "/"
        });
        return {success:true}
    }
    return {success:false}
}